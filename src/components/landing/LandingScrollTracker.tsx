"use client";

import { useEffect } from "react";
import {
  useLandingScrollStore,
  trackProgress,
  trackPhase,
  clamp01,
} from "@/lib/landing-scroll-store";

// Mounted once at the top of the landing page. No visual output — just
// reads scroll position on every frame a scroll/resize event fires
// (rAF-throttled so rapid scroll events don't queue up multiple reads per
// frame) and pushes the three raw progress values every WebGL/DOM consumer
// on the page reads from. See landing-scroll-store.ts for why these stay
// raw (undamped) here.
export default function LandingScrollTracker() {
  useEffect(() => {
    let queued = false;

    function measure() {
      queued = false;
      const globalTotal = document.documentElement.scrollHeight - window.innerHeight;
      const globalProgress =
        globalTotal > 0 ? clamp01(window.scrollY / globalTotal) : 0;

      const pipelineEl = document.getElementById("pipeline-track");
      const assemblyEl = document.getElementById("workspace-assembly-track");

      useLandingScrollStore.getState().setProgress({
        globalProgress,
        pipelineProgress: trackProgress(pipelineEl),
        pipelinePhase: trackPhase(pipelineEl),
        assemblyProgress: trackProgress(assemblyEl),
        assemblyPhase: trackPhase(assemblyEl),
      });
    }

    function onScrollOrResize() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(measure);
    }

    measure();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  return null;
}
