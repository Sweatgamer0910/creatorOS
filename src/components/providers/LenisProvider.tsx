"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
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
  // Lenis's `root` mode takes over wheel input for the whole document —
  // only the landing page's GSAP-pinned scroll sections need that. Mounting
  // it app-wide meant every other page's nested scrollable elements (e.g.
  // Script Studio's section textareas) silently lost mouse-wheel scrolling,
  // since the root Lenis instance was capturing the wheel event before it
  // could reach them. Same underlying bug class as the `scroll-behavior:
  // smooth` fix in globals.css — a document-wide scroll mode swallowing
  // wheel events meant for a nested scroller.
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  const lenisRef = useRef<LenisRef>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Single shared rAF loop: GSAP drives Lenis, Lenis reports back to
  // ScrollTrigger, so pinned/scrubbed sections never drift out of sync
  // with the smoothed scroll position.
  useEffect(() => {
    if (!isLandingPage) return;
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, [isLandingPage]);

  useEffect(() => {
    if (!isLandingPage) return;
    const lenis = lenisRef.current?.lenis;
    if (!lenis) return;
    function onScroll() {
      ScrollTrigger.update();
    }
    lenis.on("scroll", onScroll);
    return () => lenis.off("scroll", onScroll);
  }, [isLandingPage, prefersReducedMotion]);

  if (!isLandingPage) {
    return <>{children}</>;
  }

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
