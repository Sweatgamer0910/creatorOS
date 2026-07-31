import {
  HealthScore,
  HealthScoreType,
  HealthScoreConfidence,
} from "@/lib/health-score";
import Card from "@/components/ui/Card";

// Exported so Dashboard's compact health-score tile can color its label
// the same way instead of re-declaring this map — same cross-route-import
// precedent as Coach importing this whole component.
export const labelColors: Record<HealthScore["label"], string> = {
  Excellent: "#16a34a",
  Good: "#2563eb",
  "Needs Attention": "#d97706",
  "At Risk": "#dc2626",
  "Insufficient Data": "var(--color-text-muted)",
};

// Same type/confidence vocabulary and visual treatment as
// src/app/coach/InsightCard.tsx (typeLabels/typeColors/confidenceLabels) —
// kept as its own copy rather than a shared import since Health Score and
// Coach insights are different domain types that happen to share a label
// set, not the same object.
const typeLabels: Record<HealthScoreType, string> = {
  fact: "Fact",
  pattern: "Pattern",
  recommendation: "Recommendation",
  hypothesis: "Hypothesis",
};

const typeColors: Record<HealthScoreType, string> = {
  fact: "var(--color-text-muted)",
  pattern: "var(--color-accent-teal)",
  recommendation: "var(--color-accent)",
  hypothesis: "#e0a020",
};

const confidenceLabels: Record<HealthScoreConfidence, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  exploratory: "Exploratory",
};

export default function HealthScoreCard({
  healthScore,
}: {
  healthScore: HealthScore;
}) {
  return (
    <Card
      accentBorder={labelColors[healthScore.label]}
      className="mt-5 mb-5 max-w-[500px]"
    >
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <span
          className="text-[11px] font-bold tracking-[0.5px] uppercase"
          style={{ color: typeColors[healthScore.type] }}
        >
          {typeLabels[healthScore.type]}
        </span>
        <span className="text-xs text-[var(--color-text-muted)]">
          {confidenceLabels[healthScore.confidence]}
        </span>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-4xl font-bold text-[var(--color-text)]">
          {healthScore.score}
        </span>
        <span
          className="font-display text-base font-semibold"
          style={{ color: labelColors[healthScore.label] }}
        >
          {healthScore.label}
        </span>
      </div>
      <p className="mt-2 text-sm text-[var(--color-text)]">
        {healthScore.summary}
      </p>
      <p className="mt-2 text-xs text-[var(--color-text-muted)] italic">
        This is a rule-based estimate from your recent view trends, not a
        guaranteed metric.
      </p>
    </Card>
  );
}
