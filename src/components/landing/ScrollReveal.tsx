"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { easing } from "@/lib/design-tokens";

// Shared scroll-triggered reveal for landing sections below the fold —
// same blur-to-focus + premiumOut technique as Hero.tsx's load-in, applied
// on viewport entry instead of on mount. Deliberately uses `whileInView`
// rather than a mount-triggered `animate` (like Hero.tsx needs the
// loading/content key-swap workaround for): whileInView's animation only
// fires once IntersectionObserver reports the element in view, well after
// mount, which sidesteps the Framer Motion + Turbopack "freshly-mounted
// element renders pre-settled" bug entirely — proven live already by
// Manifesto.tsx, which has shipped this exact pattern without issue.
// `viewport={{ once: true }}` so a section never re-hides on scroll back up.
export default function ScrollReveal({
  children,
  delay = 0,
  amount = 0.35,
  y = 20,
  blur = 10,
  duration = 0.7,
  className,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  amount?: number;
  y?: number;
  blur?: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y, filter: `blur(${blur}px)` }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount }}
      transition={{ duration, ease: easing.premiumOut, delay }}
    >
      {children}
    </motion.div>
  );
}
