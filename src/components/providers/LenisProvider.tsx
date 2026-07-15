"use client";

import { useEffect, useRef } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<LenisRef>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Single shared rAF loop: GSAP drives Lenis, Lenis reports back to
  // ScrollTrigger, so pinned/scrubbed sections never drift out of sync
  // with the smoothed scroll position.
  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    if (!lenis) return;
    function onScroll() {
      ScrollTrigger.update();
    }
    lenis.on("scroll", onScroll);
    return () => lenis.off("scroll", onScroll);
  }, [prefersReducedMotion]);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,
        // Reduced motion: disable wheel smoothing and snap lerp to 1 so
        // scroll behaves natively instead of with inertial lag.
        smoothWheel: !prefersReducedMotion,
        lerp: prefersReducedMotion ? 1 : 0.1,
      }}
    >
      {children}
    </ReactLenis>
  );
}
