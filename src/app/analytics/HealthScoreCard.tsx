import { HealthScore } from "@/lib/health-score";

const labelColors: Record<HealthScore["label"], string> = {
  Excellent: "#16a34a",
  Good: "#2563eb",
  "Needs Attention": "#d97706",
  "At Risk": "#dc2626",
};

export default function HealthScoreCard({
  healthScore,
}: {
  healthScore: HealthScore;
}) {
  return (
    <div
      style={{
        border: `2px solid ${labelColors[healthScore.label]}`,
        borderRadius: 8,
        padding: 20,
        marginTop: 20,
        marginBottom: 20,
        maxWidth: 500,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span style={{ fontSize: 36, fontWeight: 700 }}>
          {healthScore.score}
        </span>
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: labelColors[healthScore.label],
          }}
        >
          {healthScore.label}
        </span>
      </div>
      <p style={{ marginTop: 8, fontSize: 14, color: "#444" }}>
        {healthScore.summary}
      </p>
      <p
        style={{
          marginTop: 8,
          fontSize: 12,
          color: "#888",
          fontStyle: "italic",
        }}
      >
        This is an AI-generated estimate based on recent trends, not a
        guaranteed metric.
      </p>
    </div>
  );
}
