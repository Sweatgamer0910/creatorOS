"use client";

import { motion } from "framer-motion";

const SEGMENTS = 20;

export default function SignalBar({ score }: { score: number }) {
  const filledSegments = Math.round((score / 100) * SEGMENTS);

  const color =
    score >= 75
      ? "var(--color-accent-teal)"
      : score >= 50
        ? "var(--color-accent)"
        : "#e35d5d";

  return (
    <div className="flex items-end gap-[3px] h-10">
      {Array.from({ length: SEGMENTS }).map((_, i) => {
        const isFilled = i < filledSegments;
        const height = 12 + (i / SEGMENTS) * 28;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: i * 0.02, duration: 0.3 }}
            style={{
              height,
              width: 5,
              borderRadius: 2,
              backgroundColor: isFilled ? color : "var(--color-border)",
              transformOrigin: "bottom",
            }}
          />
        );
      })}
    </div>
  );
}
