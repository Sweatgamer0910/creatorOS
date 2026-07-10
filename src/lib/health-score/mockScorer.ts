import { ChannelAnalytics } from "@/lib/analytics";
import { HealthScore } from "./types";

export function getMockHealthScore(data: ChannelAnalytics): HealthScore {
  const recent = data.last30Days.slice(-7);
  const earlier = data.last30Days.slice(0, 7);

  const recentAvgViews =
    recent.reduce((sum, d) => sum + d.views, 0) / recent.length;
  const earlierAvgViews =
    earlier.reduce((sum, d) => sum + d.views, 0) / earlier.length;

  const growthRate = (recentAvgViews - earlierAvgViews) / earlierAvgViews;

  let score: number;
  let label: HealthScore["label"];
  let summary: string;

  if (growthRate > 0.15) {
    score = 85;
    label = "Excellent";
    summary = `Views grew significantly over the last 30 days, up roughly ${Math.round(growthRate * 100)}% comparing the most recent week to the first. This is a strong sign of consistent momentum.`;
  } else if (growthRate > -0.05) {
    score = 65;
    label = "Good";
    summary = `Views have stayed relatively stable over the last 30 days. No major growth or decline detected — a healthy, steady baseline.`;
  } else if (growthRate > -0.2) {
    score = 45;
    label = "Needs Attention";
    summary = `Views have declined somewhat over the last 30 days, down roughly ${Math.abs(Math.round(growthRate * 100))}%. Worth reviewing recent upload frequency or content style changes.`;
  } else {
    score = 25;
    label = "At Risk";
    summary = `Views have dropped significantly over the last 30 days, down roughly ${Math.abs(Math.round(growthRate * 100))}%. This is a meaningful decline worth investigating soon.`;
  }

  return {
    score,
    label,
    summary,
    isEstimate: true,
  };
}
