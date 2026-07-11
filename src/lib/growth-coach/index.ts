import { ChannelAnalytics } from "@/lib/analytics";
import { HealthScore } from "@/lib/health-score";
import { CoachResponse } from "./types";
import { getMockCoachResponse } from "./mockCoach";

const USE_MOCK_COACH = process.env.NEXT_PUBLIC_USE_MOCK_COACH !== "false";

export async function getCoachResponse(
  data: ChannelAnalytics,
  healthScore: HealthScore,
): Promise<CoachResponse> {
  if (USE_MOCK_COACH) {
    return getMockCoachResponse(data, healthScore);
  }

  // Real Claude-powered coach goes here later
  throw new Error("Real AI coach not implemented yet");
}

export type {
  CoachResponse,
  CoachInsight,
  ConfidenceLevel,
  InsightType,
} from "./types";
