"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Shadow } from "@react-three/drei";
import * as THREE from "three";
import { MODEL_SCALE, MODEL_HALF_WIDTH, MODEL_HALF_HEIGHT, MODEL_HALF_DEPTH } from "./novaGeometry";

const AMBER = "#F5A623";

// Nova's own shadcn/ui preset is *also* called "Nova" — unrelated
// coincidence, not a conflict, but if you're debugging this component and
// see "Nova" somewhere unexpected, that's probably why.

// Real sculpted/textured model (Higgsfield image concept → Tripo3D
// image/text-to-3D), replacing the earlier primitive-built (RoundedBox
// body + torus eye + swept-tube antenna) placeholder. The GLB shipped from
// generation at 40MB (720k verts, three 2048px textures) — optimized
// offline via `gltf-transform optimize` (simplify → weld → quantize →
// WebP-recompress) down to ~590KB / 18.7k verts / 512px textures before
// landing in `public/models/`. KHR_mesh_quantization + EXT_texture_webp are
// both natively supported by three.js's GLTFLoader (three ^0.185), so this
// needs no DRACOLoader/MeshoptDecoder wiring — deliberately, given this
// codebase's documented history (see docs/03-engineering/hero-film.md) of
// real-time WebGL smoothness risk being the reason past hero attempts got
// pulled. Re-run the same optimize pass (see that doc, or ask for the
// command again) if this model is ever regenerated.
const MODEL_URL = "/models/nova.glb";

// Dimensions (MODEL_SCALE, MODEL_HALF_WIDTH/HEIGHT/DEPTH) come from
// novaGeometry.ts, shared with NovaController.tsx's clearance math — see
// that file for why this is centralized rather than hardcoded per-file.
// If Nova reads too big/small once you see her live, adjust MODEL_SCALE
// there; everything below (ring, glow, shadow) derives from it plus the
// model's own bbox, not separately hand-tuned numbers, so it stays
// proportional automatically, and NovaController's clearance math stays
// correct automatically too.
const RING_Y = -MODEL_HALF_HEIGHT - 0.04;
const RING_INNER = MODEL_HALF_WIDTH * 1.35;
const RING_OUTER = RING_INNER + 0.03;

/**
 * Nova's 3D form — geometry/materials (now: a loaded GLB) and her own idle
 * animation only. No scroll or path logic lives here; a parent
 * (NovaController) drives this component's position/rotation every frame.
 */
export default function NovaMascot({
  positionRef,
  rotationRef,
  scaleRef,
  visibleRef,
  animate = true,
}: {
  // Refs, not plain values: NovaController mutates these every frame
  // inside its own useFrame without ever calling setState (a 60fps render
  // loop has no business going through React's render cycle). Reading
  // `.current` here inside this component's *own* useFrame sees the
  // latest value regardless — a plain prop would only ever reflect
  // whatever it was at NovaMascot's last render, which after mount is
  // never again, since nothing above it re-renders either.
  positionRef: React.RefObject<THREE.Vector3>;
  rotationRef: React.RefObject<number>;
  scaleRef?: React.RefObject<number>;
  visibleRef?: React.RefObject<boolean>;
  animate?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const hoverRingRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  const { scene } = useGLTF(MODEL_URL);
  // Clone rather than mutate the cached scene directly — useGLTF's cache is
  // shared across every mount, and this component is meant to become
  // reusable on future feature pages (per the brief this was built
  // against), so more than one instance may exist at once. Mutating a
  // shared Object3D's transform from multiple mounts would fight itself.
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = false;
        mesh.receiveShadow = false;
      }
    });
    return clone;
  }, [scene]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.copy(positionRef.current);
      groupRef.current.rotation.y = rotationRef.current;
      const s = scaleRef?.current ?? 1;
      groupRef.current.scale.setScalar(s);
      groupRef.current.visible = visibleRef?.current ?? true;
    }
    if (!animate) return;

    const t = state.clock.elapsedTime;

    // Idle life: a slow float + slower yaw wobble layered on top of
    // NovaController's own scroll-driven position/rotation (applied to
    // groupRef above), not replacing it — this is what makes her read as
    // alive rather than a rigid object rigidly welded to a moving anchor,
    // and is new relative to the old primitive build (which only pulsed
    // material emissive, never actually moved on her own).
    if (modelRef.current) {
      modelRef.current.position.y = Math.sin(t * 1.1) * 0.045;
      modelRef.current.rotation.y = Math.sin(t * 0.6) * 0.05;
    }

    // Chest/eye glow: same breathing-pulse rhythm the old primitive build
    // used on its eye's emissive material (matches the SVG's nova-pulse
    // animation elsewhere in the brand). Implemented here as a point light
    // playing off the GLB's own baked amber highlights, since the model
    // ships as one merged mesh/material rather than discrete named parts
    // a material property could target directly.
    const pulse = 0.7 + Math.sin(t * 2.3) * 0.3;
    if (glowRef.current) glowRef.current.intensity = 1.1 * pulse;

    // Ground ring: gentle scale breathing under her, unchanged from the
    // old build.
    if (hoverRingRef.current) {
      const s = 1 + Math.sin(t * 1.4) * 0.06;
      hoverRingRef.current.scale.set(s, 1, s);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Floor contact shadow — cheap, no real-time shadow map needed for
          a single small character. */}
      <Shadow
        position={[0, RING_Y - 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[MODEL_HALF_WIDTH * 2.7, MODEL_HALF_WIDTH * 2.1, 1]}
        opacity={0.35}
        color="#000000"
      />

      <mesh ref={hoverRingRef} position={[0, RING_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[RING_INNER, RING_OUTER, 32]} />
        <meshBasicMaterial color={AMBER} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      <pointLight
        ref={glowRef}
        position={[0, MODEL_HALF_HEIGHT * 0.2, MODEL_HALF_DEPTH * 1.1]}
        color={AMBER}
        intensity={1.1}
        distance={1.5}
      />

      <primitive ref={modelRef} object={model} scale={MODEL_SCALE} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
