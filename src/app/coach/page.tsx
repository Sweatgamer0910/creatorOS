import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getChannelAnalytics, isYouTubeConnected } from "@/lib/analytics";
import { getHealthScore, HealthScore } from "@/lib/health-score";
import { getCoachResponse, CoachResponse } from "@/lib/growth-coach";
import InsightList from "./InsightList";
import EmptyCoachInsights from "./EmptyCoachInsights";
import CoachSummaryHeader from "./CoachSummaryHeader";
import ConnectYouTubePrompt from "@/components/ConnectYouTubePrompt";
import ReconnectYouTubeNotice from "@/components/ReconnectYouTubeNotice";

export default async function CoachPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const connected = await isYouTubeConnected(session.user.id);
  let channelTitle: string | null = null;
  let healthScore: HealthScore | null = null;
  let coachResponse: CoachResponse | null = null;
  let trendData: number[] = [];
  let fetchFailed = false;

  if (connected) {
    try {
      const data = await getChannelAnalytics(session.user.id);
      if (data) {
        channelTitle = data.channelTitle;
        healthScore = await getHealthScore(data);
        coachResponse = await getCoachResponse(data, healthScore);
        trendData = data.last30Days.map((d) => d.views);
      }
    } catch (e) {
      console.error("[coach] Failed to load channel analytics:", e);
      fetchFailed = true;
    }
  }

  const recommendations = coachResponse?.insights.filter(
    (i) => i.type === "recommendation",
  );
  const otherInsights = coachResponse?.insights.filter(
    (i) => i.type !== "recommendation",
  );

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
          <CoachSummaryHeader healthScore={healthScore} trendData={trendData} />
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: 13,
              marginTop: 10,
              maxWidth: 640,
              lineHeight: 1.6,
            }}
          >
            Every insight below is labeled by confidence, and never dressed up
            as more certain than the data actually supports.
          </p>

          {coachResponse.insights.length === 0 ? (
            <div className="mt-6">
              <EmptyCoachInsights />
            </div>
          ) : (
            <>
              {recommendations && recommendations.length > 0 && (
                <div className="mt-8">
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 16,
                      fontWeight: 600,
                      marginBottom: 12,
                    }}
                  >
                    Your next move
                  </h2>
                  <InsightList insights={recommendations} emphasized />
                </div>
              )}

              {otherInsights && otherInsights.length > 0 && (
                <div className="mt-8">
                  {recommendations && recommendations.length > 0 && (
                    <h2
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 16,
                        fontWeight: 600,
                        marginBottom: 12,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      Why
                    </h2>
                  )}
                  <InsightList insights={otherInsights} />
                </div>
              )}
            </>
          )}
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
