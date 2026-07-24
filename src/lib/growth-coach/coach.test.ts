import { describe, it, expect } from "vitest";
import { computeCoachResponse } from "./coach";
import type { ChannelAnalytics, DailyDataPoint } from "@/lib/analytics";
import type { HealthScore } from "@/lib/health-score";

function makeAnalytics(dailyViews: number[]): ChannelAnalytics {
  const last30Days: DailyDataPoint[] = dailyViews.map((views, i) => ({
    date: `2026-01-${String(i + 1).padStart(2, "0")}`,
    views,
    subscribersGained: 1,
    watchTimeMinutes: 10,
  }));
  return {
    channelTitle: "Test Channel",
    currentStats: {
      subscriberCount: 1000,
      viewCount: 50000,
      videoCount: 20,
      watchTimeMinutes: 100000,
    },
    last30Days,
    history: last30Days,
  };
}

function makeHealthScore(label: HealthScore["label"], score = 60): HealthScore {
  return { score, label, summary: "test", isEstimate: true };
}

const flat30 = Array(30).fill(100);
const rising30 = [
  ...Array(7).fill(100),
  ...Array(16).fill(100),
  ...Array(7).fill(200),
];
const falling30 = [
  ...Array(7).fill(200),
  ...Array(16).fill(100),
  ...Array(7).fill(100),
];

describe("computeCoachResponse ids", () => {
  it("always includes fact-overview", () => {
    const res = computeCoachResponse(
      makeAnalytics(flat30),
      makeHealthScore("Good"),
    );
    expect(res.insights.some((i) => i.id === "fact-overview")).toBe(true);
  });

  it("assigns pattern-trend-up and recommendation-momentum for a rising trend", () => {
    const res = computeCoachResponse(
      makeAnalytics(rising30),
      makeHealthScore("Good"),
    );
    const ids = res.insights.map((i) => i.id);
    expect(ids).toContain("pattern-trend-up");
    expect(ids).toContain("recommendation-momentum");
    expect(ids).not.toContain("pattern-trend-down");
    expect(ids).not.toContain("hypothesis-decline-reason");
  });

  it("assigns pattern-trend-down and hypothesis-decline-reason for a falling trend", () => {
    const res = computeCoachResponse(
      makeAnalytics(falling30),
      makeHealthScore("Good"),
    );
    const ids = res.insights.map((i) => i.id);
    expect(ids).toContain("pattern-trend-down");
    expect(ids).toContain("hypothesis-decline-reason");
    expect(ids).not.toContain("pattern-trend-up");
  });

  it("assigns pattern-trend-steady for a flat trend", () => {
    const res = computeCoachResponse(
      makeAnalytics(flat30),
      makeHealthScore("Good"),
    );
    const ids = res.insights.map((i) => i.id);
    expect(ids).toContain("pattern-trend-steady");
  });

  it("assigns recommendation-consistency only for At Risk / Needs Attention", () => {
    const atRisk = computeCoachResponse(
      makeAnalytics(flat30),
      makeHealthScore("At Risk"),
    );
    expect(atRisk.insights.map((i) => i.id)).toContain(
      "recommendation-consistency",
    );

    const needsAttention = computeCoachResponse(
      makeAnalytics(flat30),
      makeHealthScore("Needs Attention"),
    );
    expect(needsAttention.insights.map((i) => i.id)).toContain(
      "recommendation-consistency",
    );

    const good = computeCoachResponse(
      makeAnalytics(flat30),
      makeHealthScore("Good"),
    );
    expect(good.insights.map((i) => i.id)).not.toContain(
      "recommendation-consistency",
    );

    const excellent = computeCoachResponse(
      makeAnalytics(flat30),
      makeHealthScore("Excellent"),
    );
    expect(excellent.insights.map((i) => i.id)).not.toContain(
      "recommendation-consistency",
    );
  });

  it("ids stay stable across two calls with different underlying numbers but the same trend shape", () => {
    // Same shape (rising), different magnitudes — the id shouldn't depend on
    // the exact percentage change, only which branch fired.
    const a = computeCoachResponse(
      makeAnalytics(rising30),
      makeHealthScore("Good"),
    );
    const bigger = rising30.map((v, i) => (i >= 23 ? v * 3 : v));
    const b = computeCoachResponse(
      makeAnalytics(bigger),
      makeHealthScore("Good"),
    );
    expect(a.insights.find((i) => i.type === "pattern")?.id).toBe(
      b.insights.find((i) => i.type === "pattern")?.id,
    );
  });
});

describe("computeCoachResponse trendData", () => {
  it("attaches real trendData to trend-based pattern insights", () => {
    const analytics = makeAnalytics(rising30);
    const res = computeCoachResponse(analytics, makeHealthScore("Good"));
    const pattern = res.insights.find((i) => i.id === "pattern-trend-up");
    expect(pattern?.trendData).toEqual(
      analytics.last30Days.map((d) => d.views),
    );
  });

  it("does not attach trendData to non-trend insights (fact, recommendation)", () => {
    const res = computeCoachResponse(
      makeAnalytics(rising30),
      makeHealthScore("Good"),
    );
    const fact = res.insights.find((i) => i.id === "fact-overview");
    const recommendation = res.insights.find(
      (i) => i.id === "recommendation-momentum",
    );
    expect(fact?.trendData).toBeUndefined();
    expect(recommendation?.trendData).toBeUndefined();
  });

  it("handles empty last30Days without crashing", () => {
    const analytics = makeAnalytics([]);
    const res = computeCoachResponse(analytics, makeHealthScore("Good"));
    expect(res.insights.some((i) => i.id === "fact-overview")).toBe(true);
    // No trend branch should fire with no data to compare.
    expect(res.insights.some((i) => i.type === "pattern")).toBe(false);
  });
});
