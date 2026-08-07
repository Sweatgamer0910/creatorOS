"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { motion as motionTokens, easing } from "@/lib/design-tokens";
import { useIsNarrowViewport } from "@/hooks/useIsNarrowViewport";

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
  // Touch targets everywhere this control appears (Analytics/Coach chart
  // filters) were sized for a mouse cursor — 5px/12px padding at 12px font
  // is roughly a 24px tall hit target, well under the ~40px comfortable
  // minimum for a fingertip. Bumped on narrow viewports only; desktop's
  // denser, mouse-precise sizing is unchanged.
  const isNarrow = useIsNarrowViewport();

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
              padding: isNarrow ? "10px 14px" : "5px 12px",
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
                  // Same bespoke pre-design-tokens bezier as PageTransition.tsx
                  // had, same fix: this pill settling into its new position
                  // is exactly the "content settling into place" moment
                  // easing.premiumOut was built for.
                  transition={{
                    duration: motionTokens.base,
                    ease: easing.premiumOut,
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
