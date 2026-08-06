"use client";

import InteractiveCard from "@/components/ui/InteractiveCard";
import { useCountUp } from "@/hooks/useCountUp";

export default function StatCard({
  label,
  value,
  caption,
}: {
  label: string;
  value: number;
  /** Optional small muted note under the number — for cases like a 0
   *  lifetime total sitting next to a chart that already shows activity
   *  (see page.tsx: YouTube's channel statistics and Analytics API are
   *  separate, differently-cached data sources, so a brand-new/tiny
   *  channel can legitimately show 0 here for a bit while the chart below
   *  already has a data point). Explaining the gap beats hiding or
   *  fudging it, in keeping with the rest of the app's fact/pattern/
   *  confidence labeling. */
  caption?: string;
}) {
  const animated = useCountUp(value);

  return (
    <InteractiveCard className="p-4">
      <div className="text-[13px] text-[var(--color-text-muted)]">{label}</div>
      <div className="font-mono mt-1 text-2xl font-bold">
        {animated.toLocaleString()}
      </div>
      {caption && (
        <div
          className="mt-1"
          style={{ fontSize: 11, color: "var(--color-text-muted)", lineHeight: 1.4 }}
        >
          {caption}
        </div>
      )}
    </InteractiveCard>
  );
}
