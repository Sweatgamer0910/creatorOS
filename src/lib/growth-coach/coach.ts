import { ChannelAnalytics } from "@/lib/analytics";
import { HealthScore } from "@/lib/health-score";
import { CoachInsight, CoachResponse } from "./types";

export function computeCoachResponse(
  data: ChannelAnalytics,
  healthScore: HealthScore,
): CoachResponse {
  const insights: CoachInsight[] = [];

  insights.push({
    type: "fact",
    confidence: "high",
    message: `Your channel currently has ${data.currentStats.subscriberCount.toLocaleString()} subscribers and ${data.currentStats.videoCount} published videos.`,
  });

  const recent = data.last30Days.slice(-7);
  const earlier = data.last30Days.slice(0, 7);

  if (recent.length > 0 && earlier.length > 0) {
    const recentAvg = recent.reduce((s, d) => s + d.views, 0) / recent.length;
    const earlierAvg =
      earlier.reduce((s, d) => s + d.views, 0) / earlier.length;
    const change = (recentAvg - earlierAvg) / earlierAvg;

    if (change > 0.1) {
      insights.push({
        type: "pattern",
        confidence: "high",
        message: `Views in the last week are trending up compared to a month ago (roughly ${Math.round(change * 100)}% higher).`,
        evidence:
          "Based on comparing average daily views across the two periods.",
      });
      insights.push({
        type: "recommendation",
        confidence: "medium",
        message:
          "Whatever you changed recently seems to be working — consider keeping a similar upload style or topic for your next couple of videos to see if the trend holds.",
      });
    } else if (change < -0.1) {
      insights.push({
        type: "pattern",
        confidence: "high",
        message: `Views in the last week are down compared to a month ago (roughly ${Math.abs(Math.round(change * 100))}% lower).`,
        evidence:
          "Based on comparing average daily views across the two periods.",
      });
      insights.push({
        type: "hypothesis",
        confidence: "exploratory",
        message:
          "This could relate to a change in upload frequency, topic, or thumbnail style — but this is a guess based on the pattern alone, not a confirmed cause. Worth reviewing your last few uploads for anything that changed.",
      });
    } else {
      insights.push({
        type: "pattern",
        confidence: "high",
        message:
          "Views have stayed fairly steady over the last month — no major swings up or down.",
      });
    }
  }

  if (
    healthScore.label === "At Risk" ||
    healthScore.label === "Needs Attention"
  ) {
    insights.push({
      type: "recommendation",
      confidence: "medium",
      message:
        "Since your Health Score is currently lower, focusing on consistent upload frequency over the next few weeks is usually the highest-leverage thing to try first.",
    });
  }

  return {
    insights,
    isRuleBased: true,
  };
}
