import { DailyDataPoint } from "./types";

// A brand-new/tiny channel can have single-digit daily views. A jump from
// 1 view to 2 views is a "100% increase" in percentage terms but tells you
// nothing real about channel health — and if the earlier week had zero
// views, the division is 0/0 (NaN) or x/0 (Infinity), either of which can
// silently trip a scoring branch (e.g. Infinity > 0.15 is true, producing
// a false "Excellent"). This floor keeps both the Health Score and the
// Growth Coach from reporting that kind of noise as a confirmed trend.
export const MIN_AVG_VIEWS_FOR_RELIABLE_TREND = 1;

export interface ViewsGrowth {
  recentAvg: number;
  earlierAvg: number;
  // True once there's at least one day of history on each side of the
  // 7-day comparison window (independent of whether the trend is reliable).
  hasWindowData: boolean;
  // True when there's enough view volume in the earlier window for a
  // percentage change to actually mean something.
  isTrendReliable: boolean;
  // Only populated when isTrendReliable is true.
  growthRate: number | null;
}

export function computeViewsGrowth(last30Days: DailyDataPoint[]): ViewsGrowth {
  const recent = last30Days.slice(-7);
  const earlier = last30Days.slice(0, 7);

  const hasWindowData = recent.length > 0 && earlier.length > 0;

  const recentAvg = hasWindowData
    ? recent.reduce((sum, d) => sum + d.views, 0) / recent.length
    : 0;
  const earlierAvg = hasWindowData
    ? earlier.reduce((sum, d) => sum + d.views, 0) / earlier.length
    : 0;

  const isTrendReliable =
    hasWindowData && earlierAvg >= MIN_AVG_VIEWS_FOR_RELIABLE_TREND;

  return {
    recentAvg,
    earlierAvg,
    hasWindowData,
    isTrendReliable,
    growthRate: isTrendReliable ? (recentAvg - earlierAvg) / earlierAvg : null,
  };
}
