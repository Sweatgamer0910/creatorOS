import { describe, it, expect } from "vitest";
import { computePreview } from "./scorer";
import type { RawChannel, RecentUpload } from "./youtube";

function makeChannel(overrides: Partial<RawChannel["statistics"]> = {}, publishedAt = "2020-01-01T00:00:00Z"): RawChannel {
  return {
    id: "UCabcdefghijklmnopqrstuv",
    snippet: {
      title: "Test Channel",
      publishedAt,
      thumbnails: { default: { url: "https://example.com/thumb.jpg" } },
    },
    statistics: {
      subscriberCount: "10000",
      viewCount: "500000",
      videoCount: "50",
      ...overrides,
    },
    contentDetails: { relatedPlaylists: { uploads: "UUabcdefghijklmnopqrstuv" } },
  };
}

function uploadsEveryNDays(count: number, n: number, avgViews = 5000): RecentUpload[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    publishedAt: new Date(now - i * n * 86_400_000).toISOString(),
    viewCount: avgViews,
  }));
}

describe("computePreview", () => {
  it("returns Insufficient Data for channels with too few public uploads", () => {
    const result = computePreview(makeChannel({ videoCount: "1" }), []);
    expect(result.label).toBe("Insufficient Data");
    expect(result.score).toBe(50);
  });

  it("rewards a regular, recent upload cadence with a higher score", () => {
    const result = computePreview(makeChannel(), uploadsEveryNDays(10, 7));
    expect(result.score).toBeGreaterThanOrEqual(65);
    expect(result.label).not.toBe("Insufficient Data");
    expect(result.insights.some((i) => i.type === "pattern")).toBe(true);
  });

  it("flags an irregular, stale cadence with a lower score and a hypothesis insight", () => {
    const now = Date.now();
    const irregular: RecentUpload[] = [
      { publishedAt: new Date(now - 45 * 86_400_000).toISOString(), viewCount: 500 },
      { publishedAt: new Date(now - 70 * 86_400_000).toISOString(), viewCount: 4000 },
      { publishedAt: new Date(now - 75 * 86_400_000).toISOString(), viewCount: 300 },
      { publishedAt: new Date(now - 140 * 86_400_000).toISOString(), viewCount: 6000 },
    ];
    const result = computePreview(makeChannel(), irregular);
    expect(result.score).toBeLessThan(60);
    expect(result.insights.some((i) => i.type === "hypothesis")).toBe(true);
    expect(result.insights.some((i) => i.type === "recommendation")).toBe(true);
  });

  it("treats a hidden subscriber count as null rather than 0", () => {
    const result = computePreview(
      makeChannel({ hiddenSubscriberCount: true, subscriberCount: undefined }),
      uploadsEveryNDays(5, 7),
    );
    expect(result.subscriberCount).toBeNull();
  });

  it("every insight carries a valid type and confidence label", () => {
    const result = computePreview(makeChannel(), uploadsEveryNDays(10, 10));
    const validTypes = ["fact", "pattern", "recommendation", "hypothesis"];
    const validConfidence = ["high", "medium", "exploratory"];
    for (const insight of result.insights) {
      expect(validTypes).toContain(insight.type);
      expect(validConfidence).toContain(insight.confidence);
    }
  });
});
