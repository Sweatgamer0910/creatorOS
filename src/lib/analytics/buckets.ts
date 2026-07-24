import { DailyDataPoint } from "./types";

export type RangePreset = "7d" | "30d" | "90d" | "1y";

export const RANGE_DAYS: Record<RangePreset, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

export const RANGE_LABELS: Record<RangePreset, string> = {
  "7d": "7D",
  "30d": "30D",
  "90d": "90D",
  "1y": "1Y",
};

export const RANGE_WINDOW_NAMES: Record<RangePreset, string> = {
  "7d": "1 week",
  "30d": "30 days",
  "90d": "90 days",
  "1y": "1 year",
};

export interface ChartBucket {
  label: string;
  startDate: string;
  endDate: string;
  views: number;
  subscribersGained: number;
  watchTimeMinutes: number;
}

function formatShortDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMonthLabel(yyyymm: string): string {
  const d = new Date(`${yyyymm}-01T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short" });
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function summarize(group: DailyDataPoint[], label: string): ChartBucket {
  return {
    label,
    startDate: group[0].date,
    endDate: group[group.length - 1].date,
    views: group.reduce((sum, d) => sum + d.views, 0),
    subscribersGained: group.reduce((sum, d) => sum + d.subscribersGained, 0),
    watchTimeMinutes: group.reduce((sum, d) => sum + d.watchTimeMinutes, 0),
  };
}

// Matches bucket granularity to the selected range so the chart always
// shows a readable, human-scaled number of points instead of either one
// lonely dot (a too-short range) or hundreds of crammed-together daily
// dots (a too-long one): 7D/30D stay one point per day (the data is daily
// to begin with), 90D groups into weekly buckets (~13 points), and 1Y
// groups into real calendar months (~12 points) — never invented data,
// always a sum of the real days in that bucket.
export function bucketData(
  data: DailyDataPoint[],
  range: RangePreset,
): ChartBucket[] {
  const windowed = data.slice(-RANGE_DAYS[range]);
  if (windowed.length === 0) return [];

  if (range === "7d" || range === "30d") {
    return windowed.map((d) => ({
      label: formatShortDate(d.date),
      startDate: d.date,
      endDate: d.date,
      views: d.views,
      subscribersGained: d.subscribersGained,
      watchTimeMinutes: d.watchTimeMinutes,
    }));
  }

  if (range === "90d") {
    return chunk(windowed, 7).map((group) =>
      summarize(group, formatShortDate(group[0].date)),
    );
  }

  // 1y: group by actual calendar month, not an arbitrary 30-day chunk, so
  // the labels ("Jan", "Feb", ...) mean what they say.
  const byMonth = new Map<string, DailyDataPoint[]>();
  for (const d of windowed) {
    const key = d.date.slice(0, 7); // YYYY-MM
    const existing = byMonth.get(key);
    if (existing) existing.push(d);
    else byMonth.set(key, [d]);
  }
  return [...byMonth.values()].map((group) =>
    summarize(group, formatMonthLabel(group[0].date.slice(0, 7))),
  );
}

// "Jan 1 – Jan 30, 2026" style range description for the "what am I
// looking at" indicator — derived from the actual windowed data, not the
// bucket labels, so it's accurate even when buckets are aggregated.
export function formatDateRange(
  data: DailyDataPoint[],
  range: RangePreset,
): string {
  const windowed = data.slice(-RANGE_DAYS[range]);
  if (windowed.length === 0) return "";

  const start = new Date(`${windowed[0].date}T00:00:00`);
  const end = new Date(`${windowed[windowed.length - 1].date}T00:00:00`);
  const sameYear = start.getFullYear() === end.getFullYear();

  const startLabel = start.toLocaleDateString(
    "en-US",
    sameYear
      ? { month: "short", day: "numeric" }
      : { month: "short", day: "numeric", year: "numeric" },
  );
  const endLabel = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startLabel} – ${endLabel}`;
}
