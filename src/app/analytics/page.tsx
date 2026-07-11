import { auth } from "@/lib/auth";
import { getChannelAnalytics } from "@/lib/analytics";
import { getYouTubeAnalytics } from "@/lib/analytics/youtubeProvider";
import { getHealthScore } from "@/lib/health-score";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AnalyticsCharts from "./AnalyticsCharts";
import ScenarioSwitcher from "./ScenarioSwitcher";
import HealthScoreCard from "./HealthScoreCard";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string; source?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { scenario, source } = await searchParams;
  const validScenario =
    scenario === "declining" || scenario === "new" ? scenario : "growing";
  const useReal = source === "real";

  let data;
  let error: string | null = null;

  try {
    data = useReal
      ? await getYouTubeAnalytics(session.user.id)
      : await getChannelAnalytics(validScenario);
  } catch (e) {
    error = (e as Error).message;
  }

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 10 }}>
        <SourceSwitcher current={useReal ? "real" : "mock"} />
      </div>

      {!useReal && <ScenarioSwitcher current={validScenario} />}

      {error && (
        <div style={{ color: "red", marginBottom: 20 }}>
          Error loading real data: {error}
        </div>
      )}

      {data && (
        <>
          <h1>{data.channelTitle}</h1>
          <HealthScoreCardWrapper data={data} />

          <div
            style={{
              display: "flex",
              gap: 20,
              marginTop: 20,
              marginBottom: 40,
            }}
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

          {data.last30Days.length > 0 ? (
            <AnalyticsCharts data={data.last30Days} />
          ) : (
            <p style={{ color: "#888" }}>
              No historical data yet for this channel.
            </p>
          )}
        </>
      )}
    </div>
  );
}

async function HealthScoreCardWrapper({
  data,
}: {
  data: NonNullable<Awaited<ReturnType<typeof getChannelAnalytics>>>;
}) {
  const healthScore = await getHealthScore(data);
  return <HealthScoreCard healthScore={healthScore} />;
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

function SourceSwitcher({ current }: { current: string }) {
  const linkStyle = (active: boolean) => ({
    marginRight: 10,
    padding: "6px 12px",
    fontWeight: active ? 700 : 400,
    border: active ? "2px solid black" : "1px solid #ccc",
    display: "inline-block",
  });

  return (
    <div>
      <a href="/analytics?source=mock" style={linkStyle(current === "mock")}>
        Mock Data
      </a>
      <a href="/analytics?source=real" style={linkStyle(current === "real")}>
        Real YouTube Data
      </a>
    </div>
  );
}
