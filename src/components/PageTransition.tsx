"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { motion as motionTokens } from "@/lib/design-tokens";

const DRILL_ROOT = "/ideas";
const DRILL_PREFIX = "/series";

function isDrillPath(path: string) {
  return path === DRILL_ROOT || path.startsWith(DRILL_PREFIX);
}

// Depth within the Idea Lab -> Series drill relationship: /ideas is the
// root, /series is one level in, /series/[id] is two levels in. Comparing
// depth between the previous and next path is what gives the transition
// its direction (forward = deeper, back = shallower).
function drillDepth(path: string) {
  if (path === DRILL_ROOT) return 0;
  if (path.startsWith(DRILL_PREFIX)) return path === DRILL_PREFIX ? 1 : 2;
  return 0;
}

export type Variant = "drillForward" | "drillBack" | "lateral";

// Exported for unit testing (src/components/PageTransition.test.ts) — pure
// and route-name-driven, so it's the correctness-critical piece to pin
// down precisely; the live/visual animation mechanics are separate.
export function classify(previous: string | null, next: string): Variant {
  if (previous === null || previous === next) return "lateral";
  if (isDrillPath(previous) && isDrillPath(next)) {
    const prevDepth = drillDepth(previous);
    const nextDepth = drillDepth(next);
    if (nextDepth > prevDepth) return "drillForward";
    if (nextDepth < prevDepth) return "drillBack";
    return "lateral"; // same depth, different path (e.g. two series detail pages)
  }
  return "lateral";
}

const DRILL_DISTANCE = 24;
const LATERAL_DISTANCE = 8;

const OFFSETS: Record<Variant, { axis: "x" | "y"; offset: number }> = {
  drillForward: { axis: "x", offset: DRILL_DISTANCE },
  drillBack: { axis: "x", offset: -DRILL_DISTANCE },
  lateral: { axis: "y", offset: LATERAL_DISTANCE },
};

// Variants as functions of the CURRENT variant key (Framer Motion's
// `custom` mechanism), not fixed objects — this is what makes the exit
// animation correct. AnimatePresence propagates a fresh `custom` value to
// an already-exiting child on every re-render, but a plain object passed
// via the `exit` prop is frozen at whatever it was when that child first
// mounted. Without this, the outgoing page's exit direction reflected how
// IT entered, not the direction of the transition actually happening —
// caught by live QA, not by the (still-necessary) unit tests on classify().
const pageVariants: Variants = {
  initial: (variantKey: Variant) => {
    const { axis, offset } = OFFSETS[variantKey];
    return { opacity: 0, [axis]: offset };
  },
  animate: { opacity: 1, x: 0, y: 0 },
  exit: (variantKey: Variant) => {
    const { axis, offset } = OFFSETS[variantKey];
    return { opacity: 0, [axis]: -offset };
  },
};

// Pure rendering given an explicit pathname pair — split out from
// PageTransition so it can be driven directly (e.g. in QA/testing) without
// needing a real router. This is the actual animation implementation;
// PageTransition below just supplies it with real router state.
export function TransitionFrame({
  pathname,
  previousPathname,
  reducedMotion,
  children,
}: {
  pathname: string;
  previousPathname: string | null;
  reducedMotion: boolean;
  children: React.ReactNode;
}) {
  if (reducedMotion) {
    return <>{children}</>;
  }

  const variantKey = classify(previousPathname, pathname);

  return (
    <AnimatePresence mode="wait" initial={false} custom={variantKey}>
      <motion.div
        key={pathname}
        custom={variantKey}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: motionTokens.base, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// The app's one route-transition system — every app page (not the landing
// page, which has its own bespoke entrance) gets a lateral fade+shift on
// navigation, except the Idea Lab <-> Series relationship, which gets a
// directional drill in/out so Series reads as nested inside Idea Lab
// rather than a generic page swap. This is the first transition system in
// the app; the drill variant is the new standard for any future nested
// sub-section (see the plan/decisions log for the reasoning).
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();

  // Storing the previous pathname to derive the transition direction from —
  // React's own sanctioned pattern for "remember a prior prop value,"
  // calling setState directly during render rather than reading/writing a
  // ref (which isn't safe to access during render).
  const [tracked, setTracked] = useState<{
    current: string;
    previous: string | null;
  }>(() => ({ current: pathname, previous: null }));

  if (pathname !== tracked.current) {
    setTracked({ current: pathname, previous: tracked.current });
  }

  return (
    <TransitionFrame
      pathname={pathname}
      previousPathname={tracked.previous}
      reducedMotion={reducedMotion}
    >
      {children}
    </TransitionFrame>
  );
}
