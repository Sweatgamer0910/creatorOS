import { describe, it, expect } from "vitest";
import { computeHealthScore } from "./scorer";
import type { ChannelAnalytics, DailyDataPoint } from "@/lib/analytics";

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

const flat30 = Array(30).fill(100);
const rising30 = [
  ...Array(7).fill(100),
  ...Array(16).fill(100),
  ...Array(7).fill(200),
];
const fallingModerate30 = [
  ...Array(7).fill(100),
  ...Array(16).fill(100),
  ...Array(7).fill(88),
];
const fallingSharp30 = [
  ...Array(7).fill(100),
  ...Array(16).fill(100),
  ...Array(7).fill(50),
];
const tinyViews30 = Array(30).fill(0);

describe("computeHealthScore labels", () => {
  it("labels a strong upward trend Excellent", () => {
    const result = computeHealthScore(makeAnalytics(rising30));
    expect(result.label).toBe("Excellent");
  });

  it("labels a flat trend Good", () => {
    const result = computeHealthScore(makeAnalytics(flat30));
    expect(result.label).toBe("Good");
  });

  it("labels a moderate decline Needs Attention", () => {
    const result = computeHealthScore(makeAnalytics(fallingModerate30));
    expect(result.label).toBe("Needs Attention");
  });

  it("labels a sharp decline At Risk", () => {
    const result = computeHealthScore(makeAnalytics(fallingSharp30));
    expect(result.label).toBe("At Risk");
  });

  it("labels near-zero view volume Insufficient Data", () => {
    const result = computeHealthScore(makeAnalytics(tinyViews30));
    expect(result.label).toBe("Insufficient Data");
  });
});

describe("computeHealthScore type/confidence labeling", () => {
  it("labels Insufficient Data as a Fact at high confidence — a statement about data volume, not a trend claim", () => {
    const result = computeHealthScore(makeAnalytics(tinyViews30));
    expect(result.type).toBe("fact");
    expect(result.confidence).toBe("high");
  });

  it("labels a measured growth trend (Excellent) as a Pattern at high confidence", () => {
    const result = computeHealthScore(makeAnalytics(rising30));
    expect(result.type).toBe("pattern");
    expect(result.confidence).toBe("high");
  });

  it("labels a steady trend (Good) as a Pattern at high confidence", () => {
    const result = computeHealthScore(makeAnalytics(flat30));
    expect(result.type).toBe("pattern");
    expect(result.confidence).toBe("high");
  });

  it("labels a measured decline (Needs Attention / At Risk) as a Pattern at high confidence, not a Hypothesis", () => {
    const needsAttention = computeHealthScore(makeAnalytics(fallingModerate30));
    expect(needsAttention.type).toBe("pattern");
    expect(needsAttention.confidence).toBe("high");

    const atRisk = computeHealthScore(makeAnalytics(fallingSharp30));
    expect(atRisk.type).toBe("pattern");
    expect(atRisk.confidence).toBe("high");
  });

  it("every branch returns a type and confidence", () => {
    const cases = [
      rising30,
      flat30,
      fallingModerate30,
      fallingSharp30,
      tinyViews30,
    ];
    for (const views of cases) {
      const result = computeHealthScore(makeAnalytics(views));
      expect(["fact", "pattern", "recommendation", "hypothesis"]).toContain(
        result.type,
      );
      expect(["high", "medium", "exploratory"]).toContain(result.confidence);
    }
  });
});
