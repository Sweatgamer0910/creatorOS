# Development log

Running log of feature work on CreatorOS, newest entries first. See `DECISIONS_LOG.md` for the
reasoning behind non-obvious technical choices made along the way.

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
