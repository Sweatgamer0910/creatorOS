import { ChannelAnalytics } from "@/lib/analytics";
import { HealthScore } from "./types";
import { getMockHealthScore } from "./mockScorer";

const USE_MOCK_SCORING =
  process.env.NEXT_PUBLIC_USE_MOCK_HEALTH_SCORE !== "false";

export async function getHealthScore(
  data: ChannelAnalytics,
): Promise<HealthScore> {
  if (USE_MOCK_SCORING) {
    return getMockHealthScore(data);
  }

  // Real Claude-powered scoring goes here later
  throw new Error("Real AI health scoring not implemented yet");
}

export type { HealthScore } from "./types";
