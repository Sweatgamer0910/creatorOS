import { ChannelAnalytics, DailyDataPoint } from "./types";

function generateDailyData(
  days: number,
  trend: "growing" | "declining" | "flat",
): DailyDataPoint[] {
  const data: DailyDataPoint[] = [];
  let baseViews = trend === "declining" ? 800 : 200;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    if (trend === "growing") baseViews *= 1.02;
    if (trend === "declining") baseViews *= 0.98;

    const noise = 0.8 + Math.random() * 0.4;
    const views = Math.round(baseViews * noise);

    data.push({
      date: date.toISOString().split("T")[0],
      views,
      subscribersGained: Math.round(views * 0.02),
      watchTimeMinutes: Math.round(views * 4.5),
    });
  }

  return data;
}

const scenarios: Record<string, ChannelAnalytics> = {
  growing: {
    channelTitle: "Demo Channel (Growing)",
    currentStats: {
      subscriberCount: 12400,
      viewCount: 890000,
      videoCount: 47,
      watchTimeMinutes: 2100000,
    },
    last30Days: generateDailyData(30, "growing"),
  },
  declining: {
    channelTitle: "Demo Channel (Declining)",
    currentStats: {
      subscriberCount: 45000,
      viewCount: 3200000,
      videoCount: 120,
      watchTimeMinutes: 8900000,
    },
    last30Days: generateDailyData(30, "declining"),
  },
  new: {
    channelTitle: "Demo Channel (Brand New)",
    currentStats: {
      subscriberCount: 12,
      viewCount: 340,
      videoCount: 2,
      watchTimeMinutes: 890,
    },
    last30Days: generateDailyData(30, "flat"),
  },
};

export function getMockAnalytics(
  scenario: "growing" | "declining" | "new" = "growing",
): ChannelAnalytics {
  return scenarios[scenario];
}
