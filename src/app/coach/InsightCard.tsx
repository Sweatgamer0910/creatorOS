import { CoachInsight } from "@/lib/growth-coach";
import Card from "@/components/ui/Card";

const typeLabels: Record<CoachInsight["type"], string> = {
  fact: "Fact",
  pattern: "Pattern",
  recommendation: "Recommendation",
  hypothesis: "Hypothesis",
};

const typeColors: Record<CoachInsight["type"], string> = {
  fact: "var(--color-text-muted)",
  pattern: "var(--color-accent-teal)",
  recommendation: "var(--color-accent)",
  hypothesis: "#e0a020",
};

const confidenceLabels: Record<CoachInsight["confidence"], string> = {
  high: "High confidence",
  medium: "Medium confidence",
  exploratory: "Exploratory",
};

export default function InsightCard({ insight }: { insight: CoachInsight }) {
  return (
    <Card padding="sm" accentBorder={typeColors[insight.type]}>
      <div className="flex items-center gap-3 mb-2">
        <span
          style={{
            color: typeColors[insight.type],
            fontWeight: 700,
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {typeLabels[insight.type]}
        </span>
        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          {confidenceLabels[insight.confidence]}
        </span>
      </div>
      <p
        style={{
          margin: 0,
          color: "var(--color-text)",
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        {insight.message}
      </p>
      {insight.evidence && (
        <p
          style={{
            marginTop: 8,
            fontSize: 12,
            color: "var(--color-text-muted)",
            fontStyle: "italic",
          }}
        >
          {insight.evidence}
        </p>
      )}
    </Card>
  );
}
