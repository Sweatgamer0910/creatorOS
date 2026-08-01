# Development log

Running log of feature work on CreatorOS, newest entries first. See `DECISIONS_LOG.md` for the
reasoning behind non-obvious technical choices made along the way.

## 2026-07-31 — Health Score labeling parity, UI polish pass, public Channel Health checker + blog, growth infrastructure

Biggest single day since launch — 20 commits spanning a product-consistency fix, a full loading-state
polish pass, two new public (no-login) surfaces with their own lead-nurture infrastructure, and
launch-week bug fixes found via live testing.

**Channel Health Score now carries the same type/confidence labeling as Growth Coach insights.** It
was the one AI-generated insight in the product without Fact/Pattern/Recommendation/Hypothesis +
confidence-tier labeling, breaking the standing project rule that every AI-generated insight must
carry both. `HealthScore` now has `type` and `confidence` fields alongside score/label/summary/
isEstimate, mirroring `CoachInsight`'s shape; `computeHealthScore` assigns per branch.

**UI polish pass: skeleton loading everywhere, inline styles removed.** Dashboard and Analytics
swapped their spinner-only loading states for layout-mirroring skeletons (new shared
`Skeleton.tsx` primitives — `SkeletonBlock`, `SkeletonCard`), then the same treatment was extended
to every remaining app page (Growth Coach, Idea Lab, Script Studio, Series, Content Pipeline,
Settings). Alongside that, Dashboard/Analytics/StatCard/HealthScoreCard had their inline
`style={{...}}` props replaced with Tailwind classes, and a new shared `PageHeader.tsx` replaced a
near-verbatim duplicated header block on Dashboard and Analytics.

**Growth Coach's trend charts now click through to Analytics.** The sparklines (summary-header
"Views, last 30 days" chart and per-insight Pattern trend charts) were static, unlabeled pictures
despite being glance-sized previews of a chart Analytics already has the full version of —
`CoachSummaryHeader.tsx`'s trend block is now a link with a "Full analytics →" label.

**Custom 404 page.** No `not-found.tsx` existed anywhere, so a broken or mistyped link — likely
during a Product Hunt launch, when a wave of new links circulates — fell through to Next's generic
default instead of anything on-brand. New `src/app/not-found.tsx` matches the app's visual system.

**OG image switched from dynamic generation to a static file, then re-rendered at 2x.** LinkedIn's
Post Inspector reproducibly reported "no image found" for creatoros.onl on a cache-busted URL — title
and description came through, the image didn't. The old `opengraph-image.tsx` generated the PNG on
demand via a serverless function on every crawl; a cold/slow invocation is the likely culprit for a
crawler with a tight fetch timeout. Replaced with a static `opengraph-image.png`, then re-rendered at
2400x1260 (2x pixel density, same 1.91:1 aspect ratio) since the first pass looked soft on retina
displays.

**Landing page closing CTA redesigned: direct signup primary, waitlist secondary.** The primary CTA
now links straight to `/signup`, matching how the rest of the app funnels visitors; the waitlist
email-capture form is demoted to a smaller secondary "Get updates" option. Backend unchanged.

**Pre-signup waitlist lead nurture email sequence.** New Inngest function
(`waitlistNurtureSequence`) fires on a genuinely new waitlist row (`joinWaitlist()` now uses
`INSERT ... RETURNING` to avoid re-firing on a repeat submission): immediate welcome, then
feature-spotlight emails roughly every 5 days, ending in a signup nudge — every step re-checks
whether the email has since converted to a real account and stops if so.

**Vercel Analytics added; lockfile drift fixed the same night.** `@vercel/analytics` installed and
mounted in the root layout (zero-config on Vercel). A follow-up commit fixed `pnpm-lock.yaml` drift
the Analytics commit left behind — `package.json`'s specifier moved but the lockfile's didn't, which
fails Vercel's `--frozen-lockfile` install hard on every deploy since.

**Public, no-login Channel Health preview checker shipped, plus an in-app build-in-public blog.**
New `/channel-health`: paste a YouTube handle or channel URL, get a free preview from public YouTube
Data API data only (no OAuth) — upload cadence, recent-vs-lifetime view performance, channel age.
New `/blog` + `/blog/[slug]`: static content in `src/lib/blog/posts.ts`, seeded with 5 posts adapted
from real `DEVELOPMENT_LOG.md`/`DECISIONS_LOG.md` entries. Both were then found, via live testing, to
redirect every visitor to `/login` — `src/proxy.ts`'s `PUBLIC_PATHS` allowlist predated both routes
and never got updated to include them; fixed. Both were also added to `sitemap.ts` (one entry per
blog post, pulled from the same posts data so new posts show up automatically) since both exist
specifically to be found via search.

**Founder-only activation tracking dashboard.** New `/internal/activation` (unlinked, URL-only,
gated by a new `ADMIN_EMAIL` env var) answers how many signups reached real activation (connected a
channel), how many went further, and how many are "active" — reusing the same workspace-state logic
the day-14 upsell email already uses, aggregated across all users.

**Landing page: Blog and free Health Check sections added.** Both features previously only had a
small nav/footer link. New `HealthCheckPromo` (static example score card, CTA to `/channel-health`)
and `BlogTeaser` (pulls the 3 most recent posts from the same data the blog reads) sections placed
between the confidence-system section and the closing CTA.

**Channel Health checker: email capture + follow-up sequence.** An optional "Email me tips" opt-in
below the results (doesn't gate the score) backs onto a new `ChannelCheckLead` table rather than
reusing `WaitlistEntry`, since email isn't unique here. A new Inngest function
(`channelCheckNurtureSequence`) sends 4 emails referencing the visitor's actual checked channel and
score, starting 48 hours after capture, stopping early if they sign up.

Also completed: QA sweep confirming the 7/30 mobile fixes on a real phone plus Pipeline drag and
Idea Lab CRUD, and recording the 3-5 minute full product walkthrough video.

## 2026-07-30 — Security patch pass, mobile Pipeline bug fixes, launch marketing kit

Later commits from the same day as the waitlist/Neon entry below — grouped here since they cover
distinct areas (legal/security hardening, a landing-page bug, mobile Pipeline, marketing content)
shipped across the rest of that session.

**`ClosingCTA` was wired up but never actually reachable.** The waitlist form built two commits
earlier (previous entry) had real backend logic but was never imported into `src/app/page.tsx` —
no signed-out visitor could ever see it, because the QA pass that verified it only tested the
component and server action in isolation, not the rendered homepage. Added the import, placed
before `LandingFooter`.

**Real CAN-SPAM mailing address; stale v1 checklist refreshed.** `MAILING_ADDRESS` in
`src/lib/marketing-email.ts` is no longer a placeholder. `docs/05-roadmap/v1-production-checklist.md`
was rewritten to match reality — it still listed privacy/terms, password reset, and the verified
sending domain as blocking when all three had been resolved days earlier.

**Security patch pass.** Fresh `pnpm audit` found `next` a patch behind (16.2.10 → 16.2.12,
covering a Turbopack middleware/proxy-bypass bug relevant to `proxy.ts`'s auth gate plus Server
Action SSRF/DoS issues) and added `pnpm-workspace.yaml` overrides forcing `sharp >=0.35.3` /
`postcss >=8.5.25`, since Next still bundles vulnerable versions of both as its own nested
dependencies. Also found and fixed a real leak vector while in there: the Google OAuth
disconnect flow (`src/lib/settings/actions.ts`) was passing the access token as a URL query
param on the revoke call instead of the POST body, where it could end up captured in Sentry's
HTTP breadcrumbs/spans or proxy access logs. `/terms` and `/privacy` were hardened to what a
lawyer's checklist would expect (liability/indemnification/arbitration clauses, YouTube API
Services disclosures, CCPA and cookies sections). Full reasoning in today's `DECISIONS_LOG.md`
entry.

**WebGL context-creation crash on the landing page, fixed.** Sentry showed 51 unhandled
`THREE.WebGLRenderer: Error creating WebGL context` events in 21 hours of real production
traffic — flagged as an open issue in the security-patch-pass `DECISIONS_LOG.md` entry above,
now closed. New `useWebGLSupported()` hook mirrors three.js's own `getContext` check;
`LandingScene.tsx` skips mounting `<Canvas>` entirely when unsupported, the same pattern already
used for the narrow-viewport case, rather than letting it throw. No separate fallback UI needed —
the page's own background gradient (`page.tsx`) already reads as intentional without the 3D hero.
Doesn't cover context loss after a successful creation (a rarer, separate failure mode) — out of
scope here.

**Baseline security response headers.** Confirmed live against production that only Vercel's
automatic HSTS header was present. Added `X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy`, and `Permissions-Policy` in `next.config.ts`. Deliberately not adding a CSP in
this pass — this app loads Spline/Three.js/GSAP, reports to Sentry, and redirects through
Google/Discord OAuth, and a wrong CSP fails silently (breaks features instead of erroring loudly)
rather than a quick add.

**Real 1200×630 OG/Twitter card image.** `layout.tsx` was falling back to the 512×512 square
`logo.png` for both `og:image` and `twitter:image`. New `src/app/opengraph-image.tsx` uses
`next/og`'s `ImageResponse`, built from the same brand tokens as the rest of the site; Twitter
switched to `summary_large_image` now that a real landscape image exists. Couldn't be
rendered/previewed locally (broken `node_modules` in this sandbox) — worth eyeballing the actual
card at `/opengraph-image` once deployed.

**SEO/social checklist correction.** `docs/05-roadmap/v1-production-checklist.md` was stale
again — `robots.ts` and `sitemap.ts` already existed despite the doc saying otherwise.

**Mobile nav and page padding fixed.** `NotchNav.tsx`'s entire navigation only expanded via
`onMouseEnter` — a desktop-only interaction with no touch equivalent, so it was likely never
usable on a real phone. Added a mobile-only top bar + bottom tab bar branch, plus fixed 10 pages'
identical hardcoded `padding` inline styles that ate ~20% of a phone screen's width. See
`DECISIONS_LOG.md`, 2026-07-30, for the full audit and reasoning (desktop's existing branch is
untouched).

**Mobile web redesign plan drafted — research and architecture proposal, not implemented.** New
`docs/03-engineering/mobile-web-redesign-plan.md` lays out a purpose-built (Instagram/Facebook-
style) separate mobile web UI, recommending it ship as a post-launch fast-follow rather than
before launch, informed by real mobile usage data once available. See `DECISIONS_LOG.md`,
2026-07-30, for the architecture reasoning.

**Three mobile Pipeline bugs fixed**, found on Ayaan's own phone after the nav/padding pass:

- Drag-and-drop between columns doesn't fire on touch at all. Added an explicit "Move to" select
  on each card (mobile only, via a new `onMove` callback on `PipelineBoard.tsx`); both the mobile
  select path and desktop's drag-and-drop now share one `moveItem()` function (optimistic update,
  rollback + error banner on failure) instead of duplicating that logic.
- Mobile's grid fell back to a single stacked column, so a new user had to scroll past every
  "Idea" card before discovering "Scripted," "Filming," etc. existed. Added a mobile-only branch
  (same `useIsNarrowViewport()` gating pattern as `NotchNav`/`MainShell`): all 5 stages render as
  wrapped tabs with counts, tap one to filter the card list below.
- The "Link to:" select on `NewItemForm.tsx` and the idea/script link editor could overflow past
  a card's right edge on narrow screens. Fixed with `flex: 1`, `minWidth: 0`, `width: 100%` —
  applied everywhere, not just mobile, since it's a genuine CSS correctness fix (a long enough
  option could theoretically overflow on desktop too, just less likely there).

See `DECISIONS_LOG.md`, 2026-07-30, for the reasoning behind these choices.

**Launch marketing kit added, then corrected.** New `docs/04-business/creatoros-launch-marketing-
kit.md` filled in the 6 "Not started" tasks from the existing Day 5 Launch Assets plan (demo/
walkthrough video scripts, Product Hunt copy, social posts). A follow-up commit corrected a false
premise running through it: the original kit assumed Ayaan already had an established YouTube
channel and audience ("Victory Voyager"), when the real channel (renamed to CreatorOS) has zero
subscribers, zero watch hours, and no video-making track record yet. Rewrote the strategy section
(direct outreach + Product Hunt + communities first, instead of leaning on a channel that doesn't
exist yet), the founder story across the PH copy/video intro/social posts (honestly framed as
starting from a business opportunity, not an existing creator audience), and the "what's next"
ordering to match.

## 2026-07-30 — Landing page waitlist capture; Neon pooled-connection fix

**Landing page's `ClosingCTA` form now actually persists emails.** It used to just flip its own
button label with no backend call — the code comment there said as much. New `WaitlistEntry`
table (`prisma/migrations/20260730050000_add_waitlist_entry`) is the source of truth;
`src/lib/waitlist/actions.ts` rate-limits it (5/hour/IP via the existing Upstash Redis instance,
since this is a public unauthenticated write) and best-effort syncs to the Resend audience
(`addWaitlistContact` in `src/lib/resend-audience.ts`) tagged `plan: "waitlist"` so Phase A2
broadcasts can segment pre-launch signups from real accounts.

**Switched `DATABASE_URL` to Neon's pooled connection string**, prompted by a quota/headroom
review ahead of the planned content push — the app was connecting through Neon's direct endpoint,
which Vercel's serverless functions can exhaust under concurrent load since each invocation opens
its own connection with no shared pool. Plausibly the cause of intermittent 503s seen during the
2026-07-29 live QA pass.

**That change broke the next deploy — `P1001: Can't reach database server` against the `-pooler`
host during `prisma migrate deploy`.** First read as the well-known Prisma+PgBouncer migration
incompatibility, so a `directUrl` field went into `schema.prisma` (the standard fix, pointing
migrate at a direct, non-pooled connection while the app's Client keeps using the pooled one).
That's wrong for this project's Prisma version: 7.8.0 rejects `directUrl` in `schema.prisma`
entirely (P1012, "no longer supported in schema files — move connection URLs to
prisma.config.ts"), and `@prisma/config`'s `Datasource` type only exposes `url`/
`shadowDatabaseUrl` — no `directUrl` equivalent there either. Reverted the schema.prisma edit and
the attempted `prisma.config.ts` mirror of it.

**Turned out `directUrl` was never needed.** A manual redeploy (after adding `DIRECT_URL` as an
env var, unused as it turned out) succeeded through the pooled connection on retry — 7 migrations
applied clean, no P1001. The original failure was a one-off (Neon compute cold-start after
sitting idle, most likely), not a hard pooled-connection-can't-run-migrations wall. Left
`DATABASE_URL` on the pooled endpoint (the fix that actually mattered, for the runtime connection-
exhaustion concern); `DIRECT_URL` in Vercel's env vars is now unused and can be deleted whenever,
no rush.

## 2026-07-29 — Live QA pass on production; two findings fixed

**First live click-through of the deployed app** (creatoros.onl), as opposed to the prior QA
pass which was a static code read only (`docs/03-engineering/qa-security-review.md`). Walked
dashboard, analytics, coach, ideas, scripts, pipeline, settings, login, signup, forgot-password,
privacy, and terms while authenticated — all render with zero console errors, real YouTube data
flowing correctly, legal pages present and accurate.

Two real findings, both fixed:

- **`HealthScoreCard.tsx` called the Health Score "AI-generated,"** contradicting the fact that
  it's rule-based (see `src/lib/health-score/scorer.ts`) and the project's own honest-labeling
  standard. Copy changed to "rule-based estimate from your recent view trends."
- **`/login` and `/signup` didn't redirect an already-authenticated visitor** — hitting either
  route while signed in just rendered the form instead of bouncing to `/dashboard`, unlike `/`
  which already had this handled. Split both into a server component wrapper (session check +
  redirect, same pattern as `src/app/page.tsx`) plus a client form component (`LoginForm.tsx`,
  `SignupForm.tsx`) so the check runs server-side before any client JS loads.

One non-blocking observation, not acted on: intermittent 503s on Next.js's background RSC
prefetch requests for a few routes — never on an actual page load/navigation, always recovered
on retry. Worth watching once real traffic hits, not worth chasing on a QA pass with n=1.

`pnpm audit` and a full signed-out/fresh-signup click-through are still outstanding — see
`docs/05-roadmap/v1-production-checklist.md`.

## 2026-07-29 — 90-day chart "Week of" labels; marketing email Phase A0/A1 shipped

**Analytics 90-day chart buckets now group by real calendar week (Sunday-start) instead of an
arbitrary 7-day chunk**, labeled "Week of [date]" (`src/lib/analytics/buckets.ts` +
`buckets.test.ts`). Same "real calendar unit" reasoning already used for 1Y's month grouping,
just applied to weeks.

**Shipped the first two phases of the marketing email plan** (full plan in
`docs/CreatorOS_Marketing_Email_Plan.docx`, reasoning in today's `DECISIONS_LOG.md` entry):

- Fixed a real bug in `resend-audience.ts` (contact sync was silently failing on every signup —
  wrong API URL shape).
- New `src/lib/marketing-email.ts` — a separate, CAN-SPAM-compliant send path for
  non-transactional email (unsubscribe footer + `List-Unsubscribe` headers), distinct from the
  existing transactional `src/lib/email.ts`.
- New `/unsubscribe` page + `/api/unsubscribe` route (one-click + human-facing).
- New `src/lib/inngest/activationSequence.ts` + `src/app/api/inngest/route.ts` — the Phase A1
  behavior-triggered welcome/activation sequence (signup → day 14), the first real use of the
  previously-unused `inngest` dependency.
- Added `signupDate`, `channelConnected`, `lastActiveAt` custom contact properties in Resend's
  dashboard for future segmentation.

Phase A2 (paid upsell broadcast) and Track B (renewal/win-back) are still blocked on a pricing/
billing decision — not started, per the plan doc.

## 2026-07-29 — Fixed Health Score / Growth Coach false-signal bug; email/password auth restored

**Health Score and Growth Coach were reporting confident "Excellent"/"At Risk" verdicts (and
occasionally a literal "Infinity%") off channels with near-zero view history.** Root cause: both
`src/lib/health-score/scorer.ts` and `src/lib/growth-coach/coach.ts` computed a week-over-week
percentage growth rate by dividing by the earlier week's average views with no floor — `0/0` is
`NaN`, and `x/0` is `Infinity`, either of which can silently trip a scoring branch. New shared
`src/lib/analytics/viewsGrowth.ts` adds a minimum-average-views floor before trusting a percentage
at all; below it, both features now report an honest "Insufficient Data" state instead of a
number pulled from noise. `HealthScore["label"]` gained the new `"Insufficient Data"` value.

**Email/password sign-in, verification, and password reset are back**, alongside Google/Discord
OAuth rather than replacing them. See the 2026-07-29 `DECISIONS_LOG.md` entry for the reasoning
(short version: `creatoros.onl` is bought, which unblocks the Resend verified-sending-domain
requirement that motivated going OAuth-only on 2026-07-28).

## 2026-07-28 — OAuth-only auth (Google + Discord), Workspace.plan, Resend audience sync

**Removed `emailAndPassword`/`emailVerification` entirely from `src/lib/auth.ts`.** Sign-in is
now Google + Discord only (`GoogleSignInButton`/`DiscordSignInButton`, both on `/login` and
`/signup`). No password field exists anywhere in the app anymore. `/forgot-password` and
`/reset-password` are now plain `redirect("/login")` stubs instead of rendering dead forms.
Discord's Client ID/Secret aren't filled in yet — creating the app in Discord's Developer Portal
needs a human to click through an hCaptcha, so sign-in with Discord doesn't functionally work
until that's done and the real values are added to `.env`/Vercel.

**Added `Workspace.plan`** (`String @default("free")`, migration
`20260728220000_add_workspace_plan`) — nothing reads/writes it yet beyond the default, it exists
so a future paid tier has somewhere to land.

**New `src/lib/resend-audience.ts`.** The post-signup `databaseHooks.user.create.after` hook now
best-effort syncs every new user into Resend's Contacts list (flat `POST /contacts`, with a
`plan` custom property) using a separate `RESEND_AUDIENCE_API_KEY` (Full access — the existing
`RESEND_API_KEY` is Sending-access only and can't write contacts). Lets marketing/product-update
emails be sent straight from Resend's dashboard later. Couldn't be live-tested from this sandbox
(network-blocked from `api.resend.com`, same allowlist restriction as the npm registry) — worth
a real signup test once deployed to confirm a contact actually appears in Resend.

**`package.json`'s `build` script now runs `prisma migrate deploy && next build`** instead of
just `next build`, so schema migrations apply automatically on every deploy rather than relying
on someone running `migrate deploy` by hand.

## 2026-07-28 — Deployment prep (legal pages, Settings, Sentry), Vercel build fix, landing preview mode

**Deployment readiness pass.** Real `/privacy` and `/terms` pages replace whatever stood in for
them before — needed to clear Google's OAuth verification for the YouTube scopes. New `/settings`
page covers workspace rename, YouTube disconnect (with token revocation), delete account, and
replaying the onboarding tour (`WorkspaceNameForm.tsx`, `YouTubeConnectionSection.tsx`,
`DeleteAccountSection.tsx`, `ReplayTourButton.tsx`, `settings/actions.ts`). Sentry error monitoring
scaffolding landed (`sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts`,
`instrumentation-client.ts`, `global-error.tsx`), wired into `next.config.ts` via
`withSentryConfig`. `robots.ts` and `sitemap.ts` cover crawler/OG metadata. The onboarding tour's
placeholder avatar is now a real captured render of the 3D Nova model.

**Vercel build fix.** Production builds were failing on a fresh Vercel clone with an unresolvable
`@generated/prisma/client` import — the custom Prisma generator output only existed locally
because it'd been generated once during dev and never committed (it's gitignored). Added a
`postinstall` hook so `prisma generate` runs on every install, local or CI.

**Landing page preview mode.** `src/app/page.tsx` now accepts a `?preview=1` query param so a
signed-in visitor can view the marketing landing page without being auto-redirected to
`/dashboard` — an escape hatch for testing the landing page without logging out first.

## 2026-07-27 — Onboarding tour (Nova walkthrough)

**First-run onboarding tour.** New `OnboardingTourProvider.tsx` drives a step-by-step spotlight
tour (`Spotlight.tsx` + `TourWidget.tsx`) narrated by Nova, covering nav, dashboard quick access,
and the core app pages in under a minute; skippable at any point. Steps are data-driven
(`src/lib/onboarding/steps.ts`) with a `route`/`target` per step and an optional
`fallbackTarget`/`fallbackBody` for pages gated behind a YouTube connection (Analytics, Coach) —
when the real target isn't in the DOM yet, the tour points at the Connect-YouTube prompt with
different copy instead of skipping the step. `positioning.ts` (+ test) computes spotlight/tooltip
placement from a target rect; `dom.ts` polls for the target element and waits for its rect to
stabilize before showing it, so the tour doesn't point at content still animating in.

**Completion tracking.** `User` gained a nullable `onboardingCompletedAt` (migration
`20260724214341_add_onboarding_completed_at`), set by a new `completeOnboarding` server action
when the tour finishes or is skipped — null means "hasn't seen it yet" and drives the auto-launch
check. `NotchNav.tsx`, `layout.tsx`, and a handful of pages picked up the `data-tour="..."`
anchors the steps target.

## 2026-07-24 — QA/ops progress (no commits)

Also completed: Write automated test coverage for V1 (Vitest + Playwright), Set up editing
software + reusable intro/outro/lower-third templates, Prioritize V2 candidate features without
building yet.

## 2026-07-23 — Growth Coach revamp, cross-linked cards, Script Studio scroll areas, dashboard "Resume work"

Fourth commit in the post-V1 polish pass, still no LLM/AI work.

**Growth Coach revamp.** Rebuilt the Coach page UI: a new `CoachSummaryHeader.tsx` sits above the
list, `InsightList.tsx` replaces inline rendering with a dedicated list component, `InsightCard.tsx`
grew richer states, and `EmptyCoachInsights.tsx` gives a proper empty state instead of a blank page
when there's nothing to show yet. `insightActions.ts` and the underlying
`growth-coach/coach.ts`/`types.ts` picked up small supporting changes; `coach.test.ts` covers the
new logic. Still purely rule-based off `ChannelAnalytics` — no AI calls added.

**Pipeline "Scripted" stage + idea/script cross-links.** `ContentItem.status` gained a `"scripted"`
stage between `idea` and `filming` (`src/lib/pipeline/stages.ts`), for cards that have a script
attached but haven't started filming yet. `scripts/migrate-scripted-stage.ts` is a one-time,
hand-run backfill that moves existing idea-stage cards with a linked script into the new stage.
`PipelineBoard.tsx` picked up the new column, and the "from: [title]" idea/script links added in
the 7/22 pass got more visible surfacing across `ScriptListItem.tsx`, `scripts/page.tsx`, and
`series/page.tsx`.

**Script Studio scrollable sections.** `ScriptEditor.tsx` and `NewScriptForm.tsx` got scrollable
containers for the hook/intro/body/outro sections instead of growing the page, so long scripts
stay usable without the whole page scrolling. `VersionHistoryPanel.tsx` picked up matching layout
fixes.

**Dashboard "Resume work."** New `ResumeWork.tsx` widget surfaces the most recent idea/script/
pipeline card the user touched (`dashboard/actions.ts`), dismissible per-item-set via a
`localStorage` key so it reappears only when the underlying set of recent items actually changes.

**General look-and-feel pass.** New `PageTransition.tsx` (+ test) wraps route changes;
`RangePicker.tsx`, `Sparkline.tsx`, `StatCard.tsx`, and `useCountUp.ts` are new small building
blocks used to tighten up the Analytics page (`AnalyticsCharts.tsx`, `analytics/page.tsx`,
`chartTheme.ts` + test, `analytics/buckets.ts` + test). `LandingNav.tsx`, `MainShell.tsx`,
`LenisProvider.tsx`, and `globals.css` got matching polish.

Also completed: Verify the landing page black-void bug, Fix landing page bug (if confirmed),
Weekly reprioritization review, Define V1 soft-launch checklist (first users, feedback loop).

## 2026-07-22 — Series feature, pipeline↔idea/script linking, Script Studio polish

Three-part V1 finishing pass (no LLM/AI work — that's still a separate, unbuilt piece tracked in
`05-roadmap/v1-production-checklist.md`).

**Pipeline ↔ Idea/Script linking.** `ContentItem` (the Kanban pipeline card) previously had no
relation to `Idea` or `Script` at all. Added optional `ideaId`/`scriptId` (both `onDelete:
SetNull`). `NewItemForm` on the pipeline page can now optionally link a new card to an existing
idea or script (pre-fills the title, editable); linked cards show a small "from: [title]" tag.

**Series feature.** New `Series` model (`title`, `description`, `cadence`, scoped to
`Workspace`). `Idea` gained optional `seriesId` + `episodeNumber`. `IdeaForm` has an inline
"Part of a series?" control — pick an existing series or create one on the spot. Idea and
pipeline cards show a small series badge (`src/components/SeriesBadge.tsx`) linking to
`/series/[id]`. The series detail page lists its ideas in episode order with a computed stage —
idea only / scripted / in pipeline (+status) / published — by walking the idea → script →
pipeline-card chain (`src/lib/series/stage.ts`). `/series` is reachable via a "View all series"
link on the Idea Lab page (the main nav wasn't touched — it was deliberately sized/tuned in an
earlier pass and a 7th top-level item felt like a bigger call than this task asked for).

**Script Studio polish.** Live per-section and total word count + estimated spoken read time
(~150 wpm, always labeled as an estimate). Manual per-section "mark complete" toggle (`hook
Complete`/`introComplete`/`bodyComplete`/`outroComplete` on `Script` — deliberately not inferred
from word count). Focus mode expands one section and hides the other three. A new full-screen
teleprompter view (`Teleprompter.tsx`) auto-scrolls the combined script with a speed control.
New `ScriptVersion` model + manual "save version" / restore flow (`VersionHistoryPanel.tsx`) —
snapshots only happen on explicit user action, never on every autosave.

Also: added the project's first Vitest setup (`vitest.config.ts`, `pnpm test`) with tests for
the word-count/read-time math (`src/lib/scripts/wordCount.test.ts`).

Shipped as three separate commits (one per part above), each preceded by a clean
`pnpm typecheck` / `pnpm lint` / `pnpm build` pass.
