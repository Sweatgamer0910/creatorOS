import { InsightType, ConfidenceLevel } from "@/lib/growth-coach/types";

// Deliberately its own label set, NOT the real Health Score's
// Excellent/Good/Needs Attention/At Risk (src/lib/health-score/types.ts) —
// this preview runs on public data only (no OAuth, no private analytics),
// so its verdict is a meaningfully weaker signal and shouldn't look
// interchangeable with the real score a signed-up user gets.
export type PreviewLabel =
  | "Strong Public Signals"
  | "Steady"
  | "Room To Grow"
  | "Insufficient Data";

export interface PreviewInsight {
  type: InsightType;
  confidence: ConfidenceLevel;
  message: string;
}

export interface ChannelHealthPreview {
  channelTitle: string;
  channelThumbnail: string | null;
  channelUrl: string;
  subscriberCount: number | null; // null when the channel hides this
  viewCount: number;
  videoCount: number;
  score: number; // 0-100
  label: PreviewLabel;
  insights: PreviewInsight[];
}
