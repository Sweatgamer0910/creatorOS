"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

// Plain requestAnimationFrame interpolation, not Framer Motion — sidesteps
// the mount-animation bug documented in src/app/coach/InsightList.tsx
// (any freshly-mounted `motion` element renders pre-settled in this app
// right now) since this never touches Framer Motion at all.
export function useCountUp(target: number, durationMs = 600): number {
  const reducedMotion = usePrefersReducedMotion();
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(target);
      return;
    }

    const start = performance.now();

    function tick(now: number) {
      // Clamped to >= 0: the first rAF callback's timestamp can arrive
      // fractionally before `start` (captured via a separate
      // performance.now() call), which would otherwise make `progress`
      // briefly negative and flash a negative number for one frame.
      const progress = Math.min(Math.max((now - start) / durationMs, 0), 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      setValue(Math.round(target * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [target, durationMs, reducedMotion]);

  return value;
}
