import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getChannelAnalytics } from "@/lib/analytics";
import { getHealthScore } from "@/lib/health-score";
import { getCoachResponse } from "@/lib/growth-coach";
import InsightCard from "./InsightCard";
import ScenarioSwitcher from "./ScenarioSwitcher";

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
    <div style={{ padding: "20px 40px 40px", maxWidth: 700, margin: "0 auto" }}>
      <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
        Growth Coach
      </p>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 32,
          marginTop: 4,
        }}
      >
        Insights for {data.channelTitle}
      </h1>
      <p
        style={{ color: "var(--color-text-muted)", fontSize: 14, marginTop: 8 }}
      >
        Based on your recent analytics and Health Score.
      </p>

      <ScenarioSwitcher current={validScenario} />

      <div className="flex flex-col gap-4 mt-6">
        {coachResponse.insights.map((insight, i) => (
          <InsightCard key={i} insight={insight} />
        ))}
      </div>
    </div>
  );
}
