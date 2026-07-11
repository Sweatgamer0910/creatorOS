import { getChannelAnalytics } from "@/lib/analytics";
import { getHealthScore } from "@/lib/health-score";
import { getCoachResponse } from "@/lib/growth-coach";
import InsightCard from "./InsightCard";

export default async function CoachPage({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string }>;
}) {
  const { scenario } = await searchParams;
  const validScenario =
    scenario === "declining" || scenario === "new" ? scenario : "growing";

  const data = await getChannelAnalytics(validScenario);
  const healthScore = await getHealthScore(data);
  const coachResponse = await getCoachResponse(data, healthScore);

  return (
    <div style={{ padding: 40, maxWidth: 700 }}>
      <h1>AI Growth Coach</h1>
      <p style={{ color: "#666" }}>
        Insights for: <strong>{data.channelTitle}</strong>
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          marginTop: 30,
        }}
      >
        {coachResponse.insights.map((insight, i) => (
          <InsightCard key={i} insight={insight} />
        ))}
      </div>
    </div>
  );
}
