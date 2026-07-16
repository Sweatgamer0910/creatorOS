import { HealthScore } from "@/lib/health-score";
import Card from "@/components/ui/Card";

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
    <Card
      accentBorder={labelColors[healthScore.label]}
      style={{ maxWidth: 500, marginTop: 20, marginBottom: 20 }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 36,
            fontWeight: 700,
            color: "var(--color-text)",
          }}
        >
          {healthScore.score}
        </span>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 16,
            fontWeight: 600,
            color: labelColors[healthScore.label],
          }}
        >
          {healthScore.label}
        </span>
      </div>
      <p
        style={{
          marginTop: 8,
          fontSize: 14,
          color: "var(--color-text)",
        }}
      >
        {healthScore.summary}
      </p>
      <p
        style={{
          marginTop: 8,
          fontSize: 12,
          color: "var(--color-text-muted)",
          fontStyle: "italic",
        }}
      >
        This is an AI-generated estimate based on recent trends, not a
        guaranteed metric.
      </p>
    </Card>
  );
}
