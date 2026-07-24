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
      <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 24,
          fontWeight: 700,
          marginTop: 4,
        }}
      >
        {animated.toLocaleString()}
      </div>
    </InteractiveCard>
  );
}
