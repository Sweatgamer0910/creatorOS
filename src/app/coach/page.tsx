import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getChannelAnalytics, isYouTubeConnected } from "@/lib/analytics";
import { getHealthScore, HealthScore } from "@/lib/health-score";
import { getCoachResponse, CoachResponse } from "@/lib/growth-coach";
import InsightCard from "./InsightCard";
import ConnectYouTubePrompt from "@/components/ConnectYouTubePrompt";
import ReconnectYouTubeNotice from "@/components/ReconnectYouTubeNotice";

export default async function CoachPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const connected = await isYouTubeConnected(session.user.id);
  let channelTitle: string | null = null;
  let healthScore: HealthScore | null = null;
  let coachResponse: CoachResponse | null = null;
  let fetchFailed = false;

  if (connected) {
    try {
      const data = await getChannelAnalytics(session.user.id);
      if (data) {
        channelTitle = data.channelTitle;
        healthScore = await getHealthScore(data);
        coachResponse = await getCoachResponse(data, healthScore);
      }
    } catch (e) {
      console.error("[coach] Failed to load channel analytics:", e);
      fetchFailed = true;
    }
  }

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
        {channelTitle ? `Insights for ${channelTitle}` : "Growth Coach"}
      </h1>

      {healthScore && coachResponse && (
        <>
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
            your current Health Score of{" "}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                color: "var(--color-text)",
              }}
            >
              {healthScore.score}
            </span>{" "}
            ({healthScore.label}) — labeled by confidence, and never dressed up
            as more certain than the data actually supports.
          </p>

          <div className="flex flex-col gap-4 mt-6">
            {coachResponse.insights.map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))}
          </div>
        </>
      )}

      {!connected && (
        <ConnectYouTubePrompt
          description="Connect your YouTube channel to get insights based on your real analytics and Health Score."
          callbackURL="/coach"
        />
      )}
      {connected && fetchFailed && (
        <ReconnectYouTubeNotice callbackURL="/coach" />
      )}
    </div>
  );
}
