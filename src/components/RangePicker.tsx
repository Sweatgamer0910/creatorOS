"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { motion as motionTokens } from "@/lib/design-tokens";

// Segmented pill control with a highlight that slides/resizes to the
// active option (Framer Motion's `layoutId` shared-layout animation) —
// this is a genuinely different code path from the mount-triggered
// initial/animate that's broken elsewhere in this app right now (see
// src/app/coach/InsightList.tsx): it animates a LAYOUT change between an
// element that's continuously present across re-renders (just swapping
// which button it's inside), not a fresh mount, so it isn't subject to
// that bug — confirmed via live QA, not just assumed.
export default function RangePicker<T extends string>({
  options,
  value,
  onChange,
  layoutId,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  layoutId: string;
}) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div
      className="flex"
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: 999,
        padding: 3,
        gap: 2,
      }}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={isActive}
            style={{
              position: "relative",
              padding: "5px 12px",
              fontSize: 12,
              fontWeight: 600,
              border: "none",
              background: "none",
              cursor: "pointer",
              color: isActive ? "#000" : "var(--color-text-muted)",
              borderRadius: 999,
              transition: "color 0.15s ease",
            }}
          >
            {isActive &&
              (reducedMotion ? (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "var(--color-accent)",
                    borderRadius: 999,
                    zIndex: 0,
                  }}
                />
              ) : (
                <motion.div
                  layoutId={layoutId}
                  transition={{
                    duration: motionTokens.base,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "var(--color-accent)",
                    borderRadius: 999,
                    zIndex: 0,
                  }}
                />
              ))}
            <span style={{ position: "relative", zIndex: 1 }}>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
