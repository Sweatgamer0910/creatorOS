export type ConfidenceLevel = "high" | "medium" | "exploratory";
export type InsightType = "fact" | "pattern" | "recommendation" | "hypothesis";

export interface CoachInsight {
  type: InsightType;
  confidence: ConfidenceLevel;
  message: string;
  evidence?: string;
}

export interface CoachResponse {
  insights: CoachInsight[];
  isRuleBased: true; // will become false when real AI is wired in
}
