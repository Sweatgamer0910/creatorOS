"use client";

import InteractiveCard from "@/components/ui/InteractiveCard";
import { useCountUp } from "@/hooks/useCountUp";

export default function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const animated = useCountUp(value);

  return (
    <InteractiveCard className="p-4">
      <div className="text-[13px] text-[var(--color-text-muted)]">{label}</div>
      <div className="font-mono mt-1 text-2xl font-bold">
        {animated.toLocaleString()}
      </div>
    </InteractiveCard>
  );
}
