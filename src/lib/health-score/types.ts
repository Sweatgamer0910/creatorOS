// Mirrors CoachInsight's labeling shape (src/lib/growth-coach/types.ts) —
// every AI-generated insight in the product, present or future, carries a
// type and a confidence tier. Health Score is a single insight rather
// than a list, so these live as top-level fields instead of nesting a
// CoachInsight, but the vocabulary and meaning are identical:
// Fact/Pattern/Recommendation/Hypothesis, High/Medium/Exploratory.
export type HealthScoreType =
  "fact" | "pattern" | "recommendation" | "hypothesis";
export type HealthScoreConfidence = "high" | "medium" | "exploratory";

export interface HealthScore {
  score: number; // 0-100
  label:
    "Excellent" | "Good" | "Needs Attention" | "At Risk" | "Insufficient Data";
  summary: string;
  isEstimate: true;
  type: HealthScoreType;
  confidence: HealthScoreConfidence;
}
