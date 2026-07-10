import { getChannelAnalytics } from "@/lib/analytics";
import { getHealthScore } from "@/lib/health-score";
import AnalyticsCharts from "./AnalyticsCharts";
import ScenarioSwitcher from "./ScenarioSwitcher";
import HealthScoreCard from "./HealthScoreCard";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string }>;
}) {
  const { scenario } = await searchParams;
  const validScenario =
    scenario === "declining" || scenario === "new" ? scenario : "growing";

  const data = await getChannelAnalytics(validScenario);
  const healthScore = await getHealthScore(data);

  return (
    <div style={{ padding: 40 }}>
      <ScenarioSwitcher current={validScenario} />

      <h1>{data.channelTitle}</h1>

      <HealthScoreCard healthScore={healthScore} />

      <div
        style={{ display: "flex", gap: 20, marginTop: 20, marginBottom: 40 }}
      >
        <StatCard
          label="Subscribers"
          value={data.currentStats.subscriberCount.toLocaleString()}
        />
        <StatCard
          label="Total Views"
          value={data.currentStats.viewCount.toLocaleString()}
        />
        <StatCard
          label="Videos"
          value={data.currentStats.videoCount.toLocaleString()}
        />
        <StatCard
          label="Watch Time (hrs)"
          value={Math.round(
            data.currentStats.watchTimeMinutes / 60,
          ).toLocaleString()}
        />
      </div>

      <AnalyticsCharts data={data.last30Days} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: 8,
        padding: 20,
        minWidth: 150,
      }}
    >
      <div style={{ fontSize: 14, color: "#666" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
