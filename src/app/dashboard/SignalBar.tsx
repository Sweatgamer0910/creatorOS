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
    <div className="flex items-end gap-[3px] h-8">
      {Array.from({ length: SEGMENTS }).map((_, i) => {
        const isFilled = i < filledSegments;
        const height = 10 + (i / SEGMENTS) * 22;

        return (
          // Opacity intentionally left out of this entry animation - the
          // same Framer Motion + Turbopack "freshly-mounted element can get
          // stuck at `initial` instead of reaching `animate`" race fixed
          // repeatedly elsewhere (PageTransition.tsx, VersionHistoryPanel.tsx,
          // NotchNav.tsx). Here it would have been worse than usual: all 20
          // bars share this same animation, so a stuck transition wouldn't
          // cost one cosmetic detail, it would make the entire health-score
          // visualization disappear. scaleY alone (from transformOrigin:
          // "bottom") still gives the "bars grow up from the baseline" reveal.
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
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
