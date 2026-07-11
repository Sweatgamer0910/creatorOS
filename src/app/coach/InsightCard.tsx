import { CoachInsight } from "@/lib/growth-coach";

const typeLabels: Record<CoachInsight["type"], string> = {
  fact: "Fact",
  pattern: "Pattern",
  recommendation: "Recommendation",
  hypothesis: "Hypothesis",
};

const typeColors: Record<CoachInsight["type"], string> = {
  fact: "#374151",
  pattern: "#2563eb",
  recommendation: "#16a34a",
  hypothesis: "#d97706",
};

const confidenceLabels: Record<CoachInsight["confidence"], string> = {
  high: "High confidence",
  medium: "Medium confidence",
  exploratory: "Exploratory",
};

export default function InsightCard({ insight }: { insight: CoachInsight }) {
  return (
    <div
      style={{
        border: `1px solid ${typeColors[insight.type]}`,
        borderRadius: 8,
        padding: 16,
      }}
    >
      <div style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 12 }}>
        <span
          style={{
            color: typeColors[insight.type],
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          {typeLabels[insight.type]}
        </span>
        <span style={{ color: "#888" }}>
          {confidenceLabels[insight.confidence]}
        </span>
      </div>
      <p style={{ margin: 0 }}>{insight.message}</p>
      {insight.evidence && (
        <p
          style={{
            marginTop: 8,
            fontSize: 12,
            color: "#888",
            fontStyle: "italic",
          }}
        >
          {insight.evidence}
        </p>
      )}
    </div>
  );
}
