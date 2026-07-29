import { ChannelAnalytics } from "@/lib/analytics";
import { computeViewsGrowth } from "@/lib/analytics/viewsGrowth";
import { HealthScore } from "./types";

export function computeHealthScore(data: ChannelAnalytics): HealthScore {
  const { isTrendReliable, growthRate } = computeViewsGrowth(data.last30Days);

  let score: number;
  let label: HealthScore["label"];
  let summary: string;

  if (!isTrendReliable) {
    // Not enough view volume yet (new channel, or a week with ~0 views) for
    // a percentage growth rate to mean anything — showing a confident
    // Excellent/At Risk label here would be presenting noise as a verdict.
    score = 50;
    label = "Insufficient Data";
    summary = `There isn't enough view history yet to measure a real trend. Once views build up over a couple of weeks, this score will start reflecting actual growth or decline instead of a placeholder.`;
  } else if (growthRate! > 0.15) {
    score = 85;
    label = "Excellent";
    summary = `Views grew significantly over the last 30 days, up roughly ${Math.round(growthRate! * 100)}% comparing the most recent week to the first. This is a strong sign of consistent momentum.`;
  } else if (growthRate! > -0.05) {
    score = 65;
    label = "Good";
    summary = `Views have stayed relatively stable over the last 30 days. No major growth or decline detected — a healthy, steady baseline.`;
  } else if (growthRate! > -0.2) {
    score = 45;
    label = "Needs Attention";
    summary = `Views have declined somewhat over the last 30 days, down roughly ${Math.abs(Math.round(growthRate! * 100))}%. Worth reviewing recent upload frequency or content style changes.`;
  } else {
    score = 25;
    label = "At Risk";
    summary = `Views have dropped significantly over the last 30 days, down roughly ${Math.abs(Math.round(growthRate! * 100))}%. This is a meaningful decline worth investigating soon.`;
  }

  return {
    score,
    label,
    summary,
    isEstimate: true,
  };
}
