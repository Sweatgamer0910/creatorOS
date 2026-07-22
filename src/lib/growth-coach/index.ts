import { ChannelAnalytics } from "@/lib/analytics";
import { HealthScore } from "@/lib/health-score";
import { CoachResponse } from "./types";
import { computeCoachResponse } from "./coach";

export async function getCoachResponse(
  data: ChannelAnalytics,
  healthScore: HealthScore,
): Promise<CoachResponse> {
  return computeCoachResponse(data, healthScore);
}

export type {
  CoachResponse,
  CoachInsight,
  ConfidenceLevel,
  InsightType,
} from "./types";
