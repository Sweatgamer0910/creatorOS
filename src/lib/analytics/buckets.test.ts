import { describe, it, expect } from "vitest";
import { bucketData, formatDateRange } from "./buckets";
import type { DailyDataPoint } from "./types";

function makeDays(n: number, startOffset = 0): DailyDataPoint[] {
  const out: DailyDataPoint[] = [];
  const base = new Date("2026-01-01T00:00:00");
  for (let i = 0; i < n; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i + startOffset);
    out.push({
      date: d.toISOString().split("T")[0],
      views: 100 + i,
      subscribersGained: 1,
      watchTimeMinutes: 10,
    });
  }
  return out;
}

describe("bucketData", () => {
  it("returns one bucket per day for a 7-day range", () => {
    const buckets = bucketData(makeDays(30), "7d");
    expect(buckets).toHaveLength(7);
    // Each daily bucket's views should match the raw day exactly (no
    // aggregation happened).
    expect(buckets[0].views).toBe(123); // day index 23 of 30 (100 + 23)
  });

  it("returns one bucket per day for a 30-day range", () => {
    const buckets = bucketData(makeDays(60), "30d");
    expect(buckets).toHaveLength(30);
  });

  it("groups a 90-day range into weekly buckets", () => {
    const buckets = bucketData(makeDays(90), "90d");
    // 90 days / 7 = 12 full weeks + 1 partial (6 days) = 13 buckets
    expect(buckets).toHaveLength(13);
    // Every bucket's views should be the sum of its (up to 7) days, never
    // a single raw day's value pretending to represent a week.
    const totalAcrossBuckets = buckets.reduce((s, b) => s + b.views, 0);
    const totalAcrossDays = makeDays(90)
      .slice(-90)
      .reduce((s, d) => s + d.views, 0);
    expect(totalAcrossBuckets).toBe(totalAcrossDays);
  });

  it("groups a 1-year range into real calendar months, not arbitrary 30-day chunks", () => {
    const buckets = bucketData(makeDays(365), "1y");
    // Real months in a 365-day span starting 2026-01-01 (through
    // 2026-12-31/2027-01-01ish) land on 12 or 13 distinct calendar months.
    expect(buckets.length).toBeGreaterThanOrEqual(12);
    expect(buckets.length).toBeLessThanOrEqual(13);
    expect(buckets[0].label).toBe("Jan");
  });

  it("sums (not averages) metrics within a bucket", () => {
    const days = makeDays(7);
    const buckets = bucketData(days, "90d"); // 7 days all fall in one weekly bucket
    expect(buckets).toHaveLength(1);
    const expectedSum = days.reduce((s, d) => s + d.views, 0);
    expect(buckets[0].views).toBe(expectedSum);
  });

  it("returns an empty array for empty input", () => {
    expect(bucketData([], "7d")).toEqual([]);
    expect(bucketData([], "1y")).toEqual([]);
  });

  it("handles fewer days than the requested range without crashing", () => {
    const buckets = bucketData(makeDays(3), "90d");
    expect(buckets).toHaveLength(1);
    expect(buckets[0].startDate).toBe(makeDays(3)[0].date);
  });
});

describe("formatDateRange", () => {
  it("formats a same-year range without repeating the year twice", () => {
    const label = formatDateRange(makeDays(7), "7d");
    expect(label).toMatch(/^Jan \d+ – Jan \d+, 2026$/);
  });

  it("returns an empty string for empty input", () => {
    expect(formatDateRange([], "7d")).toBe("");
  });
});
