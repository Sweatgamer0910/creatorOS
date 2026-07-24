export type ConfidenceLevel = "high" | "medium" | "exploratory";
export type InsightType = "fact" | "pattern" | "recommendation" | "hypothesis";

export interface CoachInsight {
  // Stable per-rule-branch key (e.g. "pattern-trend-up"), not a hash of
  // `message` — the message text has a moving percentage in it, so a
  // content hash would make "the same kind of insight" look new every
  // single day. Used to track what's already been shown (see
  // src/hooks/useNewInsightIds.ts) and to look up a deep-link action (see
  // src/app/coach/insightActions.ts).
  id: string;
  type: InsightType;
  confidence: ConfidenceLevel;
  message: string;
  evidence?: string;
  // Real daily series backing a trend claim (e.g. the 30 days of views a
  // "views are up" Pattern insight is based on) — never synthetic, only
  // set when there's an actual number series behind the claim.
  trendData?: number[];
}

export interface CoachResponse {
  insights: CoachInsight[];
  isRuleBased: true; // will become false when real AI is wired in
}
