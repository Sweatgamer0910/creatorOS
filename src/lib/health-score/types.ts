export interface HealthScore {
  score: number; // 0-100
  label:
    "Excellent" | "Good" | "Needs Attention" | "At Risk" | "Insufficient Data";
  summary: string;
  isEstimate: true;
}
