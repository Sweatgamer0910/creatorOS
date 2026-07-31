import { ChannelAnalytics } from "@/lib/analytics";
import { computeViewsGrowth } from "@/lib/analytics/viewsGrowth";
import { HealthScore, HealthScoreType, HealthScoreConfidence } from "./types";

export function computeHealthScore(data: ChannelAnalytics): HealthScore {
  const { isTrendReliable, growthRate } = computeViewsGrowth(data.last30Days);

  let score: number;
  let label: HealthScore["label"];
  let summary: string;
  let type: HealthScoreType;
  let confidence: HealthScoreConfidence;

  if (!isTrendReliable) {
    // Not enough view volume yet (new channel, or a week with ~0 views) for
    // a percentage growth rate to mean anything — showing a confident
    // Excellent/At Risk label here would be presenting noise as a verdict.
    // This is a Fact about data volume (there isn't enough history yet),
    // not a Pattern about the channel's trajectory — same distinction
    // coach.ts draws for its "insufficient trend data" insight, which it
    // also assigns type "pattern" at high confidence because it's
    // reporting an observed measurement gap, not a guess. Kept as "fact"
    // here since the score/label pair themselves are a placeholder, not a
    // measured trend claim.
    score = 50;
    label = "Insufficient Data";
    summary = `There isn't enough view history yet to measure a real trend. Once views build up over a couple of weeks, this score will start reflecting actual growth or decline instead of a placeholder.`;
    type = "fact";
    confidence = "high";
  } else if (growthRate! > 0.15) {
    // Growth/decline verdicts below are Pattern at high confidence: each
    // is a directly measured comparison of two real 7-day view windows,
    // not speculation about *why* it happened (that's coach.ts's job, via
    // its separate exploratory Hypothesis insight — see
    // hypothesis-decline-reason in coach.ts). The mild "worth reviewing…"
    // phrasing on the decline branches below is advisory framing on top
    // of a still-factual, still-measured pattern, not a causal guess in
    // its own right — it doesn't attribute the decline to any specific
    // cause the way coach.ts's Hypothesis insight does.
    score = 85;
    label = "Excellent";
    summary = `Views grew significantly over the last 30 days, up roughly ${Math.round(growthRate! * 100)}% comparing the most recent week to the first. This is a strong sign of consistent momentum.`;
    type = "pattern";
    confidence = "high";
  } else if (growthRate! > -0.05) {
    score = 65;
    label = "Good";
    summary = `Views have stayed relatively stable over the last 30 days. No major growth or decline detected — a healthy, steady baseline.`;
    type = "pattern";
    confidence = "high";
  } else if (growthRate! > -0.2) {
    score = 45;
    label = "Needs Attention";
    summary = `Views have declined somewhat over the last 30 days, down roughly ${Math.abs(Math.round(growthRate! * 100))}%. Worth reviewing recent upload frequency or content style changes.`;
    type = "pattern";
    confidence = "high";
  } else {
    score = 25;
    label = "At Risk";
    summary = `Views have dropped significantly over the last 30 days, down roughly ${Math.abs(Math.round(growthRate! * 100))}%. This is a meaningful decline worth investigating soon.`;
    type = "pattern";
    confidence = "high";
  }

  return {
    score,
    label,
    summary,
    isEstimate: true,
    type,
    confidence,
  };
}
