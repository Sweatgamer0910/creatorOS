"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useIsNarrowViewport } from "@/hooks/useIsNarrowViewport";
import PipelineScene from "./PipelineScene";
import NovaController from "./NovaController";

/**
 * Fill + rim lights that travel with the camera as it dollies through the
 * ring tunnel. The key light stays a directional (infinite — lights the
 * whole tunnel identically at any depth), but point lights pinned at
 * world positions only illuminate the first few meters of a 40-unit dolly
 * path: by mid-scroll, Nova and the tile would fall back to
 * ambient-only flatness. Following the camera keeps the three-point setup
 * intact for the entire ride.
 */
function CameraLights() {
  const rimRef = useRef<THREE.PointLight>(null);
  const fillRef = useRef<THREE.PointLight>(null);

  useFrame(({ camera }) => {
    // Rim: past the subject relative to the camera, upper-left — pulls an
    // amber edge highlight that separates dark objects from the black fog.
    if (rimRef.current)
      rimRef.current.position.set(-3, 2.5, camera.position.z - 9);
    // Fill: just behind-right of the camera, cool and dim — lifts the
    // shadow side a step so shading rolls off instead of clipping black.
    if (fillRef.current)
      fillRef.current.position.set(3, -1.5, camera.position.z + 2);
  });

  return (
    <>
      <pointLight ref={rimRef} color="#F5A623" intensity={2.4} distance={22} />
      <pointLight ref={fillRef} color="#5B6270" intensity={0.7} distance={16} />
    </>
  );
}

/**
 * Compiles every material/shader in the scene once at mount, instead of
 * letting three.js compile each lazily the first time its object enters
 * the frustum mid-scroll. Measured cost of not doing this: frame spikes
 * up to ~900ms on the first slow scroll through the pipeline (Nova's GLB
 * material + the tile's clearcoat physical material compiling on entry),
 * gone entirely on warm passes. One compile hit at mount — while the
 * visitor is still reading the hero headline — is the right place to pay
 * it.
 */
function PrecompileShaders() {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    gl.compile(scene, camera);
  }, [gl, scene, camera]);

  return null;
}

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
        {/* Atmosphere: everything recedes into the page's OLED black with
            camera distance — this is what makes the far rings read as
            deep space rather than dim lines painted on a flat backdrop,
            and it moves with the dolly for free (fog is camera-relative). */}
        <fog attach="fog" args={["#030304", 5, 30]} />
        {/* Three-point rig: warm directional key (infinite, so it holds up
            across the whole dolly path), plus the camera-following amber
            rim + cool fill above. Ambient dropped from 0.5 so the key/rim
            contrast actually shows on the tile's clearcoat. */}
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[3, 4, 5]}
          intensity={1.2}
          color="#FFF3DE"
        />
        <CameraLights />
        <PipelineScene reducedMotion={reducedMotion} />
        <NovaController reducedMotion={reducedMotion} />
        <PrecompileShaders />
      </Canvas>
    </div>
  );
}
