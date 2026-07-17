// Exact copy from the approved prototype (creatoros-landing.html) — do not
// reword when touching this file, only structural/prop changes.
export type ConfidenceTier = "fact" | "pattern" | "recommendation" | "hypothesis";

export const confidenceMeta: Record<
  ConfidenceTier,
  { label: string; color: string; tier: string }
> = {
  fact: { label: "Fact · directly observed", color: "#5FB3E0", tier: "High" },
  pattern: { label: "Pattern · observed trend", color: "#8B7FE0", tier: "Medium" },
  recommendation: {
    label: "Recommendation · suggested action",
    color: "#F5A623",
    tier: "Medium",
  },
  hypothesis: { label: "Hypothesis · unconfirmed", color: "#6B7280", tier: "Exploratory" },
};

export interface PipelineStage {
  index: string;
  title: string;
  body: string;
  confidence: ConfidenceTier;
}

export const pipelineStages: PipelineStage[] = [
  {
    index: "STAGE 01 — IDEA",
    title: "Every video starts as one object.",
    body: "Not a scattered pile of notes — one tracked object that carries its own context from the first spark through to the published result.",
    confidence: "fact",
  },
  {
    index: "STAGE 02 — SCRIPT",
    title: "Hook, intro, body, outro.",
    body: "Script Studio autosaves across all four sections, so the writing never blocks on the tool.",
    confidence: "pattern",
  },
  {
    index: "STAGE 03 — PRODUCE",
    title: "Recording without the admin.",
    body: "The pipeline keeps the object's context intact from script to shot list — nothing gets re-typed.",
    confidence: "recommendation",
  },
  {
    index: "STAGE 04 — PACKAGE",
    title: "Move it with the pipeline.",
    body: "A native Kanban board tracks every video from idea through to done — drag it forward as work actually happens.",
    confidence: "hypothesis",
  },
  {
    index: "STAGE 05 — PUBLISH",
    title: "Same object, same context.",
    body: "What was planned, written, and produced stays connected all the way to the upload — no context lost in the handoff.",
    confidence: "fact",
  },
  {
    index: "STAGE 06 — LEARN",
    title: "Real analytics, honestly labeled.",
    body: "Channel Health and the AI Growth Coach read your actual YouTube Analytics data — and say plainly what's fact versus what's still a guess.",
    confidence: "pattern",
  },
];
