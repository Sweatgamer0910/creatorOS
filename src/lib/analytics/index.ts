import { ChannelAnalytics } from "./types";
import { getMockAnalytics } from "./mockProvider";

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_ANALYTICS !== "false";

export async function getChannelAnalytics(
  scenario: "growing" | "declining" | "new" = "growing",
): Promise<ChannelAnalytics> {
  if (USE_MOCK_DATA) {
    return getMockAnalytics(scenario);
  }

  // Real YouTube API implementation goes here later
  throw new Error("Real YouTube provider not implemented yet");
}

export type { ChannelAnalytics, ChannelStats, DailyDataPoint } from "./types";
