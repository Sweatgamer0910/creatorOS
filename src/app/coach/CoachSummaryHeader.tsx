import { HealthScore } from "@/lib/health-score";
import { labelColors } from "@/app/analytics/HealthScoreCard";
import Card from "@/components/ui/Card";
import Sparkline from "@/components/Sparkline";

// Replaces the old plain intro paragraph — something to look at
// immediately (score + the real trend behind it) instead of a sentence to
// read first. Pure Server Component, no interactivity needed.
export default function CoachSummaryHeader({
  healthScore,
  trendData,
}: {
  healthScore: HealthScore;
  trendData: number[];
}) {
  return (
    <Card
      className="flex items-center justify-between gap-6 flex-wrap"
      style={{ marginTop: 16 }}
    >
      <div>
        <div
          style={{
            fontSize: 13,
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Channel Health
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            marginTop: 6,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            {healthScore.score}
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 15,
              fontWeight: 600,
              color: labelColors[healthScore.label],
            }}
          >
            {healthScore.label}
          </span>
        </div>
      </div>
      {trendData.length >= 2 && (
        <div style={{ flex: "1 1 200px", minWidth: 160, maxWidth: 320 }}>
          <div
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              marginBottom: 4,
            }}
          >
            Views, last 30 days
          </div>
          <Sparkline data={trendData} color="#f5a623" height={40} />
        </div>
      )}
    </Card>
  );
}
