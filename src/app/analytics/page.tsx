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
import InteractiveCard from "@/components/ui/InteractiveCard";

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
    <div
      style={{ padding: "20px 40px 60px", maxWidth: 1100, margin: "0 auto" }}
    >
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

      <div className="flex items-center gap-3 flex-wrap">
        <SourceSwitcher current={useReal ? "real" : "mock"} />
        {!useReal && <ScenarioSwitcher current={validScenario} />}
      </div>

      {error && (
        <div style={{ color: "#e35d5d", marginTop: 16 }}>
          Error loading real data: {error}
        </div>
      )}

      {data && (
        <>
          <div className="mt-6">
            <HealthScoreCardWrapper data={data} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
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
            <div className="mt-8">
              <AnalyticsCharts data={data.last30Days} />
            </div>
          ) : (
            <p style={{ color: "var(--color-text-muted)", marginTop: 40 }}>
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
    <InteractiveCard className="p-4">
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
    </InteractiveCard>
  );
}
