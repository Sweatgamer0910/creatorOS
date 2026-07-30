# Development log

Running log of feature work on CreatorOS, newest entries first. See `DECISIONS_LOG.md` for the
reasoning behind non-obvious technical choices made along the way.

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
