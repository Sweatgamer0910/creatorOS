# Decisions log

Non-obvious technical decisions, newest first, with the reasoning behind them.

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
