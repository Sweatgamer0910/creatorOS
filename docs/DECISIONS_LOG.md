# Decisions log

Non-obvious technical decisions, newest first, with the reasoning behind them.

## 2026-07-31 — Static OG image file instead of fixing the dynamic generator

**Replaced the on-demand `opengraph-image.tsx` (Satori/`next/og`, rendered per-crawl by a serverless
function) with a static PNG, rather than debugging the serverless path further.** LinkedIn's Post
Inspector reproducibly returned "no image found" on a cache-busted URL — title/description fine, image
missing — and this wasn't a one-off. A cold or slow serverless invocation hitting a crawler's tight
fetch timeout was the most likely cause, but that's hard to prove or fully rule out without direct
access to LinkedIn's crawler infrastructure. Since the card's content doesn't change per-request
(same brand tokens, same copy) there was no real benefit to generating it dynamically in the first
place — a static file removes the failure mode entirely instead of chasing a timeout that might
recur intermittently. Re-rendered at 2400x1260 (2x, still 1.91:1) in a same-day follow-up rather than
1920x1080 — 16:9 is narrower than the actual OG/Twitter standard and would get cropped.

## 2026-07-31 — Public Channel Health checker deliberately scoped below the real Health Score, not presented as equivalent

**`/channel-health` (no login, public YouTube Data API only) uses a distinct label set — Strong
Public Signals / Steady / Room To Grow / Insufficient Data — instead of the real in-app Health
Score's Excellent/Good/Needs Attention/At Risk, and the results page says explicitly that it's a
lighter preview.** The real score needs a signed-in user's private Analytics API data (watch time,
traffic sources, day-by-day growth) that isn't available for an arbitrary public channel URL: giving
the public checker the same labels as the real score would imply an equivalence that doesn't exist
and could read as a bait-and-switch once someone signs up and sees a different-looking number. Also
backed the checker's optional email capture with a new `ChannelCheckLead` table rather than reusing
`WaitlistEntry` — email isn't unique here since the same person could reasonably check more than one
channel over time, and every check is worth recording as separate lead context.

## 2026-07-30 — Mobile Pipeline: additive move-control instead of touch DnD; overflow fix applied everywhere, not just mobile

**Touch has no drag-and-drop equivalent, so mobile got an additive "Move to" control rather than
a touch reimplementation of the existing drag gesture.** `PipelineBoard.tsx` now accepts an
`onMove` callback, passed only from the mobile branch — desktop's `ItemCard` usage is completely
unchanged and still relies on drag-and-drop exclusively. Both paths funnel through one shared
`moveItem()` function (optimistic update, rollback + error banner on failure) instead of two
separate implementations of the same state transition, so the desktop and mobile code can't drift
out of sync on what "moving a card" actually does.

**Stage discoverability used the same mobile-gating pattern already established for the nav fix
earlier the same day** (`useIsNarrowViewport()`, same breakpoint) rather than inventing a new
convention: wrapped tabs with per-stage counts replace the single stacked column, so a new user
sees all 5 stages exist without having to scroll past every "Idea" card first.

**The dropdown-overflow fix (`flex: 1`, `minWidth: 0`, `width: 100%` on the "Link to:" selects)
was applied unconditionally, not gated to mobile.** Unlike the other two fixes, this one is a
genuine CSS correctness bug — flex children get a content-based min-width by default, so a long
enough option could in principle overflow on desktop too, just less likely there given more
available width. No reason to gate a real bug fix behind a viewport check when it doesn't change
desktop's rendered result today.

## 2026-07-30 — Mobile redesign plan recommends a page-level device branch, not a new route tree or a native app

**Drafted `docs/03-engineering/mobile-web-redesign-plan.md` (research + architecture proposal
only — nothing implemented) recommending a server-side device branch inside each existing
`page.tsx`, choosing between two presentational component trees per screen, over three
alternatives considered:**

- **A separate route tree (e.g. `/m/dashboard`) with a middleware rewrite** — functionally
  similar, but adds URL complexity and more logic to `proxy.ts`, which is already the app's
  security-critical auth gate; no caching benefit here to justify it since none of these app
  screens are statically cached today (every one already checks the session per-request).
- **A native iOS/Android app** — a genuinely separate codebase, tech stack, and app-store review
  process; ruled out as out of scope for a redesign, flagged as a distinct future decision instead.
- **Staying with pure responsive (what shipped in today's nav/padding fix)** — functional now, but
  still fundamentally "the desktop layout, rearranged," not a purpose-built mobile UI, and doesn't
  solve Pipeline's drag-and-drop problem, which needs an actually different interaction model on
  touch, not just a CSS reflow.

The recommended approach leans on a container/presenter split CreatorOS already has throughout
`src/app/*/page.tsx` (data-fetching in the Server Component, rendering handed off to presentational
components) — a second, mobile-only presentational component per screen reuses the same data-
fetching and props, so the data layer doesn't change at all. **Recommendation on timing: ship the
already-fixed responsive mobile experience now, and treat the full purpose-built redesign as a
post-launch fast-follow**, sized to real usage once Vercel/Sentry analytics show what fraction of
actual traffic is on mobile — not built in full ahead of any data on whether it's warranted. Open
questions (tablet treatment, nav parity, landing-page hero investment, native app) are left for
Ayaan to decide later, explicitly not defaulted.

## 2026-07-30 — Mobile nav was effectively unusable; fixed, desktop untouched. Re-confirmed Google verification.

**Re-checked Google OAuth verification/publishing status independently** (not trusting the earlier
in-session check): `console.cloud.google.com/auth/audience?project=creatoros-502020` shows
Publishing Status = **In production** (not Testing), with the `youtube.readonly` and
`yt-analytics.readonly` scopes already verified and approved. Because publishing status is "In
production," the 100-user testing cap doesn't apply — any brand-new random user, not just
pre-added test users, gets a normal Google consent screen and normal sign-in with no warning
interstitial. This directly confirms a first-time visitor's experience is unaffected.

**Audited actual mobile rendering by reading the source** (Chrome's `resize_window` tool doesn't
actually resize the real page viewport in this sandbox — confirmed by checking `window.innerWidth`
before/after, it never changed — so this was a code read, not a visual/screenshot test). Found the
dominant root cause of "mobile is a disaster": `NotchNav.tsx`, the entire app's navigation (home,
6 tools, settings, logout), only expands out of a collapsed dot via `onMouseEnter` — a desktop-only
hover interaction with zero touch equivalent. On a real phone the nav was likely never visible or
tappable at all.

Fixed by adding a second, mobile-only branch to `NotchNav.tsx`, gated on the pre-existing
`useIsNarrowViewport()` hook (760px breakpoint): a fixed, always-visible top bar (home/settings/
logout) and bottom tab bar (6 tools, icon+label, real tap targets). The existing desktop hover-dock
branch is byte-for-byte unchanged and is the only branch that renders when `isNarrow` is false.
`MainShell.tsx` got matching top/bottom content padding for the new mobile bars (72px/84px vs.
desktop's original 100px/0), verified mathematically identical to the pre-existing desktop values
when `isNarrow` is false.

Separately found a second, systemic (less severe) issue: 10 page files all used an identical fixed
`padding: "Npx 40px Mpx"` inline style — 40px of side padding alone eats ~20% of a 390px phone
screen. Most of these are async Server Components, so the client-only viewport hook doesn't work
there; used Tailwind's `className="px-4 sm:px-10"` instead, which works via CSS media query even
in a Server Component, with `sm:` (640px) safely below any real desktop width so desktop is
unaffected.

**Known gap, not fixed in this pass:** Pipeline's Kanban board uses native HTML5 drag-and-drop
(`e.dataTransfer`), which does not work on touch devices at all. Needs a follow-up (touch-based DnD
or a library swap) — bigger scope than this nav/padding fix.

**Caveat:** none of the above was visually screenshot-verified on an actual phone — the sandbox
can't resize a real viewport. Confidence here is code-level (brace/paren-balance checked across all
12 touched files, TypeScript structure reviewed by hand); `tsc`/`eslint` could not be run in this
sandbox because the local `node_modules` here (already noted as corrupted by earlier interrupted
installs, and gitignored so it never affected what's committed) is missing the `eslint` and `next`
packages entirely. Ayaan should check the real result on his own phone before calling this fully
done.

## 2026-07-30 — Security patch pass + Terms/Privacy hardened to what a lawyer would flag

**Fresh `pnpm audit` (not the stale 2026-07-29 log entry) found `next` was still on 16.2.10** —
one patch behind 16.2.11, which fixes several high-severity CVEs including a Turbopack
middleware/proxy-bypass bug directly relevant to `proxy.ts` (this app's whole auth gate), plus
SSRF and DoS issues in Server Actions. The earlier "bumped and deployed" note was either wrong or
got reverted; either way, production was exposed. Bumped `next` to 16.2.12 and
`eslint-config-next` to match. Also found Next itself still bundles `sharp@0.34.5` (libvips CVEs,
reachable via `/​_next/image` at runtime) and `postcss@8.4.31` (build-time only) as its own nested
optionalDependencies, unaffected by the Next version bump — added `overrides` in
`pnpm-workspace.yaml` forcing `sharp >=0.35.3` and `postcss >=8.5.25` since upstream hasn't moved
its own range yet. `pnpm audit` went from 18 findings (9 high) to 5 (all in Prisma's dev-only CLI
tooling, never runs in the deployed app). Lockfile regenerated and verified to pass
`--frozen-lockfile` (what Vercel's install step uses) before this was committed.

**Live Sentry check turned up an unresolved, unhandled `THREE.WebGLRenderer: Error creating WebGL
context` on `/` — 51 events over 21 hours on real production traffic**, no error boundary or
fallback for it in `LandingScene.tsx`. Low blast radius (the canvas is `aria-hidden`,
non-interactive, z-index 0 behind the real page content, so affected visitors just don't see the
3D hero, nothing else breaks) but real and worth a follow-up fix — not addressed in this pass.

**`/terms` and `/privacy` were honest but not built to withstand a lawyer's checklist — added
what was missing:** eligibility/13+ and a COPPA-style children's-privacy statement, a disclaimer
of warranties, a limitation-of-liability clause (capped at the greater of $100 or 12 months'
payment), an indemnification clause, Texas governing law, and a binding-arbitration + class-action
waiver clause with a 30-day opt-out window (Ayaan's call, asked directly rather than assumed).
Also added the disclosures Google's own YouTube API Services Terms require and that were
previously missing entirely — a "this app uses YouTube API Services" statement, a link to the
Google Privacy Policy, a link to revoke access from Google's own security settings, and the
Limited Use Policy adherence statement — plus a lightweight CCPA rights section and a cookies
disclosure. None of this is a substitute for an actual lawyer's review before charging money or
scaling past a small free beta; it closes the gap between "present" and "what's commonly expected,"
not a certified legal opinion.

## 2026-07-29 — Phase A1 marketing email sequence (activation) + unsubscribe infra

**Built the first two phases (A0, A1) of `docs/CreatorOS_Marketing_Email_Plan.docx`** — the
free-to-paid conversion plan researched and written up earlier the same day. Full plan/reasoning
is in that document; this entry covers implementation choices not obvious from the code alone.

**Found and fixed a real bug while wiring this up:** `resend-audience.ts` was POSTing to a flat
`https://api.resend.com/contacts`, but Resend's actual API is
`POST /audiences/{audience_id}/contacts` — contacts belong to a specific audience/segment.
Every signup before this fix likely never actually landed in Resend (confirmed live: the
"General" segment showed 0 contacts despite real signups having happened). The whole call was
wrapped in a try/catch that only logs, so this failed silently the entire time. Added
`RESEND_AUDIENCE_ID` (the "General" segment's real id, `e4d1b85d-be68-44ed-bddc-fbba3caa2246`,
looked up live in the Resend dashboard) to both `.env` and Vercel.

**Marketing email is a separate send path from transactional (`src/lib/marketing-email.ts` vs.
`src/lib/email.ts`).** Transactional (verification, password reset) is CAN-SPAM-exempt;
marketing/lifecycle email is not, so only the marketing path adds an unsubscribe footer,
`List-Unsubscribe`/`List-Unsubscribe-Post` headers (RFC 8058 one-click), and checks the
contact's `unsubscribed` flag in Resend before sending (necessary because this goes through the
plain Emails API, not Resend's Broadcasts feature, which doesn't auto-suppress unsubscribed
contacts on its own).

**One URL (`/api/unsubscribe?email=...`) serves both unsubscribe mechanisms** — the RFC 8058
one-click POST mail clients send directly, and a plain GET when a human clicks the visible
footer link (which redirects to `/unsubscribe` for a readable confirmation page). Kept as one
path per RFC 8058's own recommendation rather than two divergent implementations.

**Sender identity for marketing mail is a named individual, not the company name**
(`RESEND_MARKETING_FROM_EMAIL`, "Ayaan from CreatorOS") — research backs a meaningfully higher
open/reply rate for this over a `from: CreatorOS` company address, and with two co-founders,
one consistent named voice was chosen over alternating, since recipients build recognition
email-to-email. Easy one-line config change if this should be reconsidered later.
**Caveat:** `ayaan@creatoros.onl` is not yet a real inbox — creatoros.onl's MX records point at
Resend's bounce handler, not a mailbox — so replies currently go nowhere. Fine for now since the
copy asks people to reply without depending on it, but worth a real inbox/forwarding setup
before send volume grows.

**Phase A1 (behavior-triggered activation sequence) runs as a single Inngest function**
(`src/lib/inngest/activationSequence.ts`), not five separate scheduled jobs — `step.sleep`
between stages lets one function represent the whole 14-day arc per user, durably (Inngest
persists progress between steps, so a redeploy mid-sequence doesn't lose anyone's place). This
is also the first real use of the `inngest` dependency/client that's existed since 2026-07-28
with nothing built on it — `src/app/api/inngest/route.ts` (the registration endpoint) didn't
exist before this pass either.

**Contact properties (`signupDate`, `channelConnected`, `lastActiveAt`) added live in the Resend
dashboard**, all string-typed since Resend's custom properties only support string/number, not
boolean/date — `channelConnected` is stored as the literal string `"true"`/`"false"`.
`channelConnected` gets re-synced back to Resend mid-sequence (day-3 check) so Phase A2's future
segmentation reflects real, current state rather than only what was true at signup.

**A real physical mailing address (CAN-SPAM requirement) is still a placeholder** in
`marketing-email.ts` (`MAILING_ADDRESS`) — no address exists to put there yet. Flagged with a
`TODO(ayaan)` in the code; don't let a real send volume go out with it still unset.

## 2026-07-29 — `/request-password-reset` gets its own tight rate limit

**Added a `max: 3, window: 60` custom rule for `/request-password-reset`, tighter than the
`sign-in`/`sign-up` endpoints' `max: 5`.** This endpoint sends an email per call and deliberately
doesn't reveal whether the address exists (see the comment in `forgot-password/page.tsx`), which
makes it a cheap vector for spamming a real user's inbox or running up Resend send volume — a
tighter budget than credential-guessing endpoints is warranted. Verified live against production
by firing repeat requests at the deployed endpoint and confirming a 429 after the 3rd request in
a window (see task notes, 2026-07-29 security pass).

## 2026-07-29 — creatoros.onl bought, email/password auth re-enabled

**Ayaan bought `creatoros.onl`**, lifting the specific blockers the 2026-07-28 zero-spend entry
called out (Resend sending-domain restriction, Google OAuth homepage-ownership requirement). The
zero-spend rule itself still stands for everything else — this was a one-off, deliberate spend,
not a lift of the policy.

**`emailAndPassword`/`emailVerification` are back in `src/lib/auth.ts`**, restored from the
pre-2026-07-28 implementation (git history, commit before `fe4f5d8`) and merged with the
Google/Discord OAuth + Resend-audience-sync additions from that pass rather than reverting them.
Google and Discord remain available above the divider on `/login`/`/signup` — this adds
email/password as a third option, it doesn't replace OAuth. `/forgot-password` and
`/reset-password` are real forms again instead of redirect stubs.

**`RESEND_FROM_EMAIL` was updated ahead of Resend actually verifying the domain.** The env var
now points at `noreply@creatoros.onl` before the DNS records are confirmed — sends will fail
until Resend shows the domain verified. This is intentional: the code should be ready to go the
moment domain verification completes, rather than needing a second deploy. Whoever finishes the
DNS/Resend steps should confirm a real signup verification email actually arrives before
considering this fully done.

**Google OAuth verification (sensitive `youtube.readonly`/`yt-analytics.readonly` scopes) still
needs the Cloud Console side done separately** — authorized domain, homepage/privacy/terms URLs,
redirect URIs, and submitting for review. Not automatic just because the domain exists; someone
has to click through the Console.

## 2026-07-28 — Standing rule: zero dollars spent until first paying customer

**Ayaan's explicit instruction: no money gets spent on CreatorOS — domains, paid API tiers, paid
developer program fees, upgraded plans, anything with a cost — until the product has its first
real sale.** Once there's revenue, that capital gets reinvested into the product. This is a hard
rule, not a default that can be talked past with "it's only $8" reasoning — Claude (or any future
session) should treat any action with a real-money cost as blocked until Ayaan says the zero-spend
rule has lifted, and should say so explicitly rather than proceeding or re-raising the same
purchase.

**Concrete fallout as of today:**

- Buying `creatoroshq.tech` (or any domain) is paused. This means Resend's shared
  `onboarding@resend.dev` sender stays restricted to sending only to Ayaan's own email — no real
  user can receive marketing/product-update email yet — and Google's OAuth app verification stays
  blocked on the homepage-ownership requirement. Both are accepted trade-offs for now.
- Sign-in with Apple is out for the same reason (requires the $99/year Apple Developer Program).
- The auth rebuild (removing email/password, adding Discord OAuth alongside Google, adding a
  `plan` field + Resend Audience-sync hook for when sending becomes possible) is still going
  ahead — all of that is free (code + Discord's free developer portal), so none of it is blocked
  by this rule.

## 2026-07-28 — Sentry wrapper stays "safe to ship" without a real project yet; Prisma client generated via postinstall, not committed

**`next.config.ts`'s `withSentryConfig` call passes `org`/`project`/`authToken` as `|| undefined`,
not the raw env vars.** `.env` currently declares them as empty strings, not absent — the plugin
needs a real `undefined` to know to skip source-map upload rather than trying (and failing) to
authenticate with an empty token. Paired with `silent: true`, this means the Sentry wrapper can
ship now, ahead of a real Sentry project existing, without breaking builds.

**`src/generated/prisma` (custom Prisma generator output) stays gitignored; a `postinstall`
script runs `prisma generate` instead of committing the generated client.** It only ever existed
locally because it'd been generated once during dev — Vercel's fresh clone + install never ran
`prisma generate`, so the build failed trying to resolve `@generated/prisma/client`. Committing
the generated output would also work, but a postinstall hook keeps it regenerated from the schema
on every install instead of risking it drifting out of sync in git.

## 2026-07-27 — Onboarding tour points at the real gating UI instead of skipping gated steps

**Steps whose `target` isn't in the DOM yet (Analytics/Coach before a YouTube channel is
connected) fall back to a `fallbackTarget`/`fallbackBody`, not a skip.** Pointing the tour at the
actual Connect-YouTube prompt with adjusted copy keeps the walkthrough honest about what's really
on screen, instead of either describing a chart that doesn't exist yet or silently dropping the
step — which would make the tour feel broken for anyone who hasn't connected YouTube yet, likely
most first-time users.

## 2026-07-23 — Scripted-stage migration script uses raw `pg`, not the Prisma client

**`scripts/migrate-scripted-stage.ts` talks to Postgres directly via `pg`, not the generated
Prisma client.** The generated client's own internal imports aren't extension-qualified, which
Node's native ESM loader (used here via `--experimental-strip-types`, no bundler) can't resolve
without a bundler. Raw SQL against two tables is simple enough not to need the ORM for a one-time,
hand-run backfill script.

## 2026-07-22 — Series + pipeline linking + Script Studio polish

**`AI_CONTEXT_HANDOFF.md` / `DEVELOPMENT_LOG.md` / `DECISIONS_LOG.md` didn't exist yet.** A task
brief referenced these under a `01_Documentation` folder that isn't part of this repo — searched
the whole repo and git history, found nothing. Used the docs that do actually exist instead
(`docs/05-roadmap/v1-production-checklist.md`, `docs/03-engineering/qa-security-review.md`) plus
the Fact/Pattern/Recommendation/Hypothesis rule as it's actually implemented
(`src/components/landing/ConfidenceSystem.tsx` + `src/lib/growth-coach/types.ts`) as the real
source of truth. Created this log and `DEVELOPMENT_LOG.md` fresh rather than skip them, since the
brief clearly wants that convention going forward.

**`cadence` on `Series` is a plain nullable `String`, not a Prisma enum.** Matches the existing
precedent set by `ContentItem.status`/`PipelineStatus` — a small fixed set of values
(`daily`/`weekly`/`biweekly`/`custom`) enforced in TypeScript (`SeriesCadence` in
`src/lib/series/actions.ts`), not the database. Keeps it consistent with the one other
enum-shaped field already in the schema, and `"custom"` cleanly covers anything a preset can't.

**Per-section "mark complete" is a manual toggle, not inferred from word count.** Explicit
requirement from the brief, and correct on the merits too — a short, tight hook can be "done" at
20 words while a rambling one isn't done at 80; word count alone would be wrong often enough to
be actively annoying rather than helpful.

**`ScriptVersion` has no `workspaceId` of its own.** It only needs `scriptId` (per the brief's
exact model shape). Ownership is still fully enforced — every version action first does a
workspace-scoped `findFirst` on the parent `Script`, then scopes the version query/mutation to
that already-verified `scriptId`. Same net security guarantee as a direct `workspaceId` column,
one extra query, no schema bloat for a field that would just duplicate what the parent script
already encodes.

**Version snapshots are 100% manual, never automatic.** The autosave path (800ms debounce per
section) was already wired up before this work and stays untouched — bolting a snapshot onto it
would create a `ScriptVersion` row roughly every second of active typing. Snapshots only happen
on an explicit "Save version" click.

**No changes to `NotchNav.tsx` (the main app nav) for the new Series pages.** The nav's 6 items
and sizing were deliberately tuned in an earlier pass. Adding a 7th top-level destination is a
bigger visual/product call than "link the pipeline to ideas/scripts and add a series page"
implied, so `/series` is reachable via a "View all series" link on the Idea Lab page (where
series actually get created) and via the series badges on idea/pipeline cards, instead.

**Health Score / Growth Coach were not touched.** Both are pure rule-based functions of
whatever `ChannelAnalytics` they're given (see the prior mock-data-removal pass) — this task's
"no LLM/AI calls" scope rule was already satisfied going in, nothing in Series or Script Studio
needed to touch that boundary.
