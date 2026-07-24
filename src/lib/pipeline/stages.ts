// Single source of truth for the pipeline's stages — everywhere that
// previously hardcoded its own copy of the 4 (now 5) status labels
// (PipelineBoard.tsx's columns, series/[id]/page.tsx's own label map)
// derives from this instead, so adding/renaming a stage only happens once.
export type PipelineStatus =
  "idea" | "scripted" | "filming" | "editing" | "published";

export const PIPELINE_STAGES: { status: PipelineStatus; label: string }[] = [
  { status: "idea", label: "Idea" },
  { status: "scripted", label: "Scripted" },
  { status: "filming", label: "Filming" },
  { status: "editing", label: "Editing" },
  { status: "published", label: "Published" },
];

export const PIPELINE_STAGE_LABELS: Record<PipelineStatus, string> =
  Object.fromEntries(PIPELINE_STAGES.map((s) => [s.status, s.label])) as Record<
    PipelineStatus,
    string
  >;
