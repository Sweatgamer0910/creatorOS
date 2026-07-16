import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getChannelAnalytics } from "@/lib/analytics";
import { getHealthScore } from "@/lib/health-score";
import { getCoachResponse } from "@/lib/growth-coach";
import InsightCard from "./InsightCard";
import ScenarioSwitcher from "./ScenarioSwitcher";
import HealthScoreCard from "@/app/analytics/HealthScoreCard";

export default async function CoachPage({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { scenario } = await searchParams;
  const validScenario =
    scenario === "declining" || scenario === "new" ? scenario : "growing";

  const data = await getChannelAnalytics(validScenario);
  const healthScore = await getHealthScore(data);
  const coachResponse = await getCoachResponse(data, healthScore);

  return (
    <div style={{ padding: "24px 40px 48px", maxWidth: 900, margin: "0 auto" }}>
      <p style={{ color: "var(--color-text-muted)", fontSize: 15 }}>
        Growth Coach
      </p>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(30px, 3.5vw, 38px)",
          marginTop: 6,
        }}
      >
        Insights for {data.channelTitle}
      </h1>
      <p
        style={{
          color: "var(--color-text-muted)",
          fontSize: 16,
          marginTop: 10,
          maxWidth: 640,
          lineHeight: 1.6,
        }}
      >
        Every insight below is read straight off your recent analytics and
        Health Score — labeled by confidence, and never dressed up as more
        certain than the data actually supports.
      </p>

      <HealthScoreCard healthScore={healthScore} />

      <ScenarioSwitcher current={validScenario} />

      <div className="flex flex-col gap-4 mt-6">
        {coachResponse.insights.map((insight, i) => (
          <InsightCard key={i} insight={insight} />
        ))}
      </div>
    </div>
  );
}
