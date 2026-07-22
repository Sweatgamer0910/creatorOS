# Development log

Running log of feature work on CreatorOS, newest entries first. See `DECISIONS_LOG.md` for the
reasoning behind non-obvious technical choices made along the way.

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
