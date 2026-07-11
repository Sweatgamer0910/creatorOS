import { auth } from "@/lib/auth";
import { getChannelAnalytics } from "@/lib/analytics";
import { getYouTubeAnalytics } from "@/lib/analytics/youtubeProvider";
import { getHealthScore } from "@/lib/health-score";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AnalyticsCharts from "./AnalyticsCharts";
import ScenarioSwitcher from "./ScenarioSwitcher";
import SourceSwitcher from "./SourceSwitcher";
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
    <div style={{ padding: "20px 40px 40px", maxWidth: 800, margin: "0 auto" }}>
      <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
        Analytics
      </p>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 32,
          marginTop: 4,
          marginBottom: 20,
        }}
      >
        {data?.channelTitle ?? "Loading..."}
      </h1>

      <SourceSwitcher current={useReal ? "real" : "mock"} />
      {!useReal && <ScenarioSwitcher current={validScenario} />}

      {error && (
        <div style={{ color: "#e35d5d", marginBottom: 20 }}>
          Error loading real data: {error}
        </div>
      )}

      {data && (
        <>
          <HealthScoreCardWrapper data={data} />

          <div
            style={{
              display: "flex",
              gap: 20,
              marginTop: 20,
              marginBottom: 40,
              flexWrap: "wrap",
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
            <p style={{ color: "var(--color-text-muted)" }}>
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
        border: "1px solid var(--color-border)",
        backgroundColor: "var(--color-surface)",
        borderRadius: 12,
        padding: 16,
        minWidth: 140,
      }}
    >
      <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 24,
          fontWeight: 700,
          marginTop: 4,
        }}
      >
        {value}
      </div>
    </div>
  );
}
