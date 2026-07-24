// Deep-link destinations for recommendation insights, keyed by their
// stable id (src/lib/growth-coach/coach.ts) — kept out of coach.ts on
// purpose, since where a recommendation sends you is a presentation
// decision, not the rule-based business logic that generates it.
export const insightActions: Record<string, { label: string; href: string }> = {
  "recommendation-momentum": {
    label: "Capture your next idea",
    href: "/ideas",
  },
  "recommendation-consistency": {
    label: "Check your pipeline",
    href: "/pipeline",
  },
};
