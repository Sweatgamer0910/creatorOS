import { ChannelAnalytics } from "@/lib/analytics";
import { HealthScore } from "./types";
import { computeHealthScore } from "./scorer";

export async function getHealthScore(
  data: ChannelAnalytics,
): Promise<HealthScore> {
  return computeHealthScore(data);
}

export type { HealthScore } from "./types";
