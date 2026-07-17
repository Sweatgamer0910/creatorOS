"use client";

import { Canvas } from "@react-three/fiber";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useIsNarrowViewport } from "@/hooks/useIsNarrowViewport";
import PipelineScene from "./PipelineScene";
import NovaController from "./NovaController";

/**
 * The one WebGL context for the whole landing page — fixed full-viewport,
 * sitting behind every section (z-index 0, same as the prototype's
 * `#webgl-canvas`). Holds the pipeline ring/tile scene and Nova, sharing a
 * single camera so Nova's camera-relative offsets (see NovaController)
 * and the pipeline's scroll-driven dolly stay in the same coordinate
 * space without any extra syncing.
 *
 * Below 760px (the prototype's own mobile-fallback breakpoint) this
 * doesn't mount at all — a static gradient (see the CSS fallback in
 * page.tsx) stands in instead, matching how the prototype collapses to a
 * stacked non-3D layout on small screens rather than risking a heavy
 * scene on likely lower-powered hardware.
 */
export default function LandingScene() {
  const reducedMotion = usePrefersReducedMotion();
  const isNarrow = useIsNarrowViewport();

  if (isNarrow) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 55, near: 0.1, far: 200 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 4, 5]} intensity={1.1} color="#FFF3DE" />
        <pointLight position={[-4, -2, 2]} intensity={0.3} color="#F5A623" />
        <PipelineScene reducedMotion={reducedMotion} />
        <NovaController reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
