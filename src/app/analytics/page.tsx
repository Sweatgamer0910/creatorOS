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
    <div
      style={{ padding: "24px 40px 64px", maxWidth: 1160, margin: "0 auto" }}
    >
      <p style={{ color: "var(--color-text-muted)", fontSize: 15 }}>
        Analytics
      </p>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(30px, 3.5vw, 38px)",
          marginTop: 6,
        }}
      >
        {data?.channelTitle ?? "Analytics"}
      </h1>
      <p
        style={{
          color: "var(--color-text-muted)",
          fontSize: 16,
          marginTop: 10,
          marginBottom: 20,
          maxWidth: 640,
          lineHeight: 1.6,
        }}
      >
        Real performance data pulled directly from your connected YouTube
        channel.
      </p>

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
