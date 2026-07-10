export interface HealthScore {
  score: number; // 0-100
  label: "Excellent" | "Good" | "Needs Attention" | "At Risk";
  summary: string;
  isEstimate: true;
}
