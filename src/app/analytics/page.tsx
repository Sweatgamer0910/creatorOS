import { auth } from "@/lib/auth";
import { getChannelAnalytics, isYouTubeConnected } from "@/lib/analytics";
import { getHealthScore } from "@/lib/health-score";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AnalyticsCharts from "./AnalyticsCharts";
import HealthScoreCard from "./HealthScoreCard";
import StatCard from "./StatCard";
import ConnectYouTubePrompt from "@/components/ConnectYouTubePrompt";
import ReconnectYouTubeNotice from "@/components/ReconnectYouTubeNotice";
import PageHeader from "@/components/ui/PageHeader";

export default async function AnalyticsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const connected = await isYouTubeConnected(session.user.id);
  let data: Awaited<ReturnType<typeof getChannelAnalytics>> = null;
  let fetchFailed = false;

  if (connected) {
    try {
      data = await getChannelAnalytics(session.user.id);
    } catch (e) {
      console.error("[analytics] Failed to load channel analytics:", e);
      fetchFailed = true;
    }
  }

  return (
    <div className="mx-auto max-w-[1160px] px-4 pt-6 pb-16 sm:px-10">
      <PageHeader
        eyebrow="Analytics"
        title={data?.channelTitle ?? "Analytics"}
        description="Real performance data pulled directly from your connected YouTube channel."
        className="mb-5"
      />

      {!connected && <ConnectYouTubePrompt callbackURL="/analytics" />}
      {connected && fetchFailed && (
        <ReconnectYouTubeNotice callbackURL="/analytics" />
      )}

      {data && (
        <>
          <div className="mt-6">
            <HealthScoreCardWrapper data={data} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <StatCard
              label="Subscribers"
              value={data.currentStats.subscriberCount}
            />
            <StatCard label="Total Views" value={data.currentStats.viewCount} />
            <StatCard label="Videos" value={data.currentStats.videoCount} />
            <StatCard
              label="Watch Time (hrs)"
              value={Math.round(data.currentStats.watchTimeMinutes / 60)}
            />
          </div>

          {data.history.length > 0 ? (
            <div className="mt-8">
              <AnalyticsCharts data={data.history} />
            </div>
          ) : (
            <p className="mt-10 text-[var(--color-text-muted)]">
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
