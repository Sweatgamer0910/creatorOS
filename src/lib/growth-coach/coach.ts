import { ChannelAnalytics } from "@/lib/analytics";
import { computeViewsGrowth } from "@/lib/analytics/viewsGrowth";
import { HealthScore } from "@/lib/health-score";
import { CoachInsight, CoachResponse } from "./types";

export function computeCoachResponse(
  data: ChannelAnalytics,
  healthScore: HealthScore,
): CoachResponse {
  const insights: CoachInsight[] = [];

  insights.push({
    id: "fact-overview",
    type: "fact",
    confidence: "high",
    message: `Your channel currently has ${data.currentStats.subscriberCount.toLocaleString()} subscribers and ${data.currentStats.videoCount} published videos.`,
  });

  const trendData = data.last30Days.map((d) => d.views);
  const { hasWindowData, isTrendReliable, growthRate } = computeViewsGrowth(
    data.last30Days,
  );

  if (hasWindowData) {
    if (!isTrendReliable) {
      // Same noise-floor guard as the Health Score: don't report a
      // percentage swing computed from near-zero (or zero) view counts
      // as if it were a real week-over-week trend.
      insights.push({
        id: "pattern-insufficient-trend-data",
        type: "pattern",
        confidence: "high",
        message:
          "View counts are still too low to measure a reliable week-over-week trend — on a small channel, a tiny change in raw views can look like a huge percentage swing.",
        evidence:
          "Based on average daily views being too low for a percentage comparison to be meaningful.",
        trendData,
      });
    } else if (growthRate! > 0.1) {
      insights.push({
        id: "pattern-trend-up",
        type: "pattern",
        confidence: "high",
        message: `Views in the last week are trending up compared to a month ago (roughly ${Math.round(growthRate! * 100)}% higher).`,
        evidence:
          "Based on comparing average daily views across the two periods.",
        trendData,
      });
      insights.push({
        id: "recommendation-momentum",
        type: "recommendation",
        confidence: "medium",
        message:
          "Whatever you changed recently seems to be working — consider keeping a similar upload style or topic for your next couple of videos to see if the trend holds.",
      });
    } else if (growthRate! < -0.1) {
      insights.push({
        id: "pattern-trend-down",
        type: "pattern",
        confidence: "high",
        message: `Views in the last week are down compared to a month ago (roughly ${Math.abs(Math.round(growthRate! * 100))}% lower).`,
        evidence:
          "Based on comparing average daily views across the two periods.",
        trendData,
      });
      insights.push({
        id: "hypothesis-decline-reason",
        type: "hypothesis",
        confidence: "exploratory",
        message:
          "This could relate to a change in upload frequency, topic, or thumbnail style — but this is a guess based on the pattern alone, not a confirmed cause. Worth reviewing your last few uploads for anything that changed.",
      });
    } else {
      insights.push({
        id: "pattern-trend-steady",
        type: "pattern",
        confidence: "high",
        message:
          "Views have stayed fairly steady over the last month — no major swings up or down.",
        trendData,
      });
    }
  }

  if (
    healthScore.label === "At Risk" ||
    healthScore.label === "Needs Attention"
  ) {
    insights.push({
      id: "recommendation-consistency",
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
