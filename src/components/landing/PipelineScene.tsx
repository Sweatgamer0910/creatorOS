"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, Edges, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useLandingScrollStore, clamp01 } from "@/lib/landing-scroll-store";

const AMBER = "#F5A623";
const DIM = "#2A2E36";
const STAGE_COUNT = 6;
const RING_SPACING = 7;
const START_Z = 8;

// The camera dolly crosses the tile's own Z=0 plane once, during stage
// 2's window (targetZ = START_Z - progress·(STAGE_COUNT-1)·RING_SPACING
// hits 0 around progress ≈ 0.229, inside stage 2's [0.1, 0.3) active
// range) — getting as close as ~1 world unit from a 1.22-radius object.
// At that range the tile's angular size (2·atan(1.22/1) ≈ 101°) exceeds
// the camera's entire 55° vertical FOV outright — it's geometrically
// bigger than the whole viewport, regardless of which face its own
// self-spin happens to present. That's what let it blot out Nova at
// stage 2 even though her actual world-space clearance (checked in
// NovaController.tsx) stayed comfortably above MIN_CLEARANCE the whole
// time — the two objects were never close to each other, the TILE was
// just momentarily too close to the CAMERA. Shrinking the tile as the
// camera nears it keeps its on-screen footprint bounded no matter the
// approach distance, without touching the dolly's timing/path at all.
const TILE_SAFE_DISTANCE = 4; // full size at/beyond this camera distance
const TILE_MIN_SCALE = 0.22; // floor at the closest approach (~1 unit)

// The scale floor above bounds size, but not the on-screen SIZE/DISTANCE
// ratio that actually determines apparent footprint — a fixed minimum
// scale still blows up once distance keeps shrinking past where the floor
// was tuned for. Fully bounding that ratio geometrically would mean the
// tile visibly shrinks for most of its on-screen life, not just the brief
// close pass — a worse tradeoff than just handling the true danger band
// directly. Fading opacity out as the camera gets very close sidesteps
// this: even at a split-second where the geometry is still large, a
// near-transparent tile doesn't visually block Nova the way an opaque one
// does — same principle as camera clip planes, applied as a fade instead
// of a hard cut.
//
// TILE_FADE_DISTANCE is *derived* from where the scale floor itself
// engages (distance = TILE_SAFE_DISTANCE·TILE_MIN_SCALE, the point past
// which shrinking stops helping), with margin — not an independent
// constant. An earlier version picked 0.6 by eye, disconnected from where
// the scale floor actually kicks in (0.88): live QA found a real gap
// between those two thresholds where the scale had already stopped
// shrinking but the fade hadn't meaningfully started yet, still reading
// as ~90% opaque. Deriving one from the other closes that gap by
// construction and can't drift apart again the way two independently
// hand-tuned numbers did here.
const TILE_FADE_DISTANCE = TILE_SAFE_DISTANCE * TILE_MIN_SCALE * 1.2;
const TILE_FADE_FLOOR = 0.08; // never fully vanishes (would read as a pop)

// Frame-rate-independent smoothing: alpha = 1 - e^(-RATE·dt) converges on
// the target at the same real-world speed at 30, 60, or 144Hz, where the
// old fixed per-frame lerp factor (0.06/frame) settled visibly faster on
// high-refresh displays and sluggishly on throttled ones. RATE 3.7/s is
// the same effective speed the old constant gave at 60fps, so the approved
// feel is preserved — it's the cross-refresh-rate consistency that's new.
// This exponential-decay form also inherently gives the "momentum and
// settle" behavior: a fast flick overshoots the raw scroll value and the
// camera glides in with an ease-out tail rather than snapping.
const SMOOTHING_RATE = 3.7;
export function frameAlpha(delta: number) {
  return 1 - Math.exp(-SMOOTHING_RATE * delta);
}

// How far into the assembly section the pipeline scene takes to fully
// dissolve (fraction of assembly progress). The old behavior was a hard
// visibility cut once assembly ended; this crossfades the rings/tile/glow
// out underneath the panels scattering in, so one section resolves into
// the next instead of two unrelated scenes butting up against each other.
const DISSOLVE_SPAN = 0.35;

function usePlayIconTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = AMBER;
    ctx.beginPath();
    ctx.moveTo(96, 74);
    ctx.lineTo(96, 182);
    ctx.lineTo(186, 128);
    ctx.closePath();
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
  }, []);
}

function useGlowTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, "rgba(245,166,35,0.55)");
    grad.addColorStop(1, "rgba(245,166,35,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(canvas);
  }, []);
}

/** The rounded video-clip tile with its amber edge outline and play icon — the "every video is one tracked object" symbol from the hero/pipeline. */
function VideoTile({
  reducedMotion,
  fadeRef,
  cameraZRef,
}: {
  reducedMotion: boolean;
  fadeRef: React.RefObject<number>;
  cameraZRef: React.RefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const iconMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const currentScale = useRef(1);
  const playIconTex = usePlayIconTexture();

  useFrame((_state, delta) => {
    const distance = Math.abs(cameraZRef.current);

    // Fades out on top of (not instead of) the scale-down below — the
    // scale floor alone still let the tile fill most of the frame in the
    // narrow band where distance keeps shrinking past what the floor was
    // tuned for; a near-transparent tile in that band doesn't visually
    // block Nova even in the split-second it's still geometrically large.
    // Squared, not linear: a linear ramp is still ~90% opaque at 90% of
    // the fade distance, which is exactly the "barely started fading"
    // gap live QA caught — squaring drops it much faster as distance
    // actually gets dangerous, while staying at 1 (unchanged) outside the
    // fade zone either way.
    const fadeRatio = THREE.MathUtils.clamp(
      distance / TILE_FADE_DISTANCE,
      0,
      1,
    );
    const proximityFade = Math.max(fadeRatio * fadeRatio, TILE_FADE_FLOOR);
    if (bodyMatRef.current) {
      bodyMatRef.current.opacity = 0.96 * fadeRef.current * proximityFade;
    }
    if (iconMatRef.current) {
      iconMatRef.current.opacity = fadeRef.current * proximityFade;
    }

    if (groupRef.current) {
      const targetScale = THREE.MathUtils.clamp(
        distance / TILE_SAFE_DISTANCE,
        TILE_MIN_SCALE,
        1,
      );
      // Damped like everything else scroll-driven in this scene — a hard
      // snap here would read as a pop right when it matters most (the
      // closest approach, exactly where attention is already on the tile).
      currentScale.current +=
        (targetScale - currentScale.current) * frameAlpha(delta);
      groupRef.current.scale.setScalar(currentScale.current);
    }

    if (reducedMotion || !groupRef.current) return;
    groupRef.current.rotation.x += delta * 0.15;
    groupRef.current.rotation.y += delta * 0.22;
  });

  return (
    <group ref={groupRef}>
      <RoundedBox args={[1.5, 1.9, 0.22]} radius={0.22} smoothness={4}>
        {/* Physical material instead of the old flat meshBasicMaterial —
            dark lacquered surface with a clearcoat so the key/rim lights
            in LandingScene actually shape it (specular sweep across the
            face as it rotates) rather than rendering an unlit silhouette. */}
        <meshPhysicalMaterial
          ref={bodyMatRef}
          color="#171B22"
          roughness={0.32}
          metalness={0.55}
          clearcoat={0.7}
          clearcoatRoughness={0.25}
          transparent
          opacity={0.96}
        />
        <Edges color={AMBER} threshold={20} />
      </RoundedBox>
      <mesh position={[0, 0, 0.15]}>
        <planeGeometry args={[0.85, 0.85]} />
        <meshBasicMaterial
          ref={iconMatRef}
          map={playIconTex}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function GlowSprite({
  cameraZRef,
  fadeRef,
}: {
  cameraZRef: React.RefObject<number>;
  fadeRef: React.RefObject<number>;
}) {
  const spriteRef = useRef<THREE.Sprite>(null);
  const glowTex = useGlowTexture();

  useFrame(() => {
    // Fixed distance ahead of the camera — at the prototype's original 1.5
    // units, a 6-unit sprite filled the whole 55°-FOV frame with flat
    // amber (the wash bug QA caught); pushed back + shrunk it reads as a
    // halo behind the tile instead.
    if (spriteRef.current) {
      spriteRef.current.position.z = cameraZRef.current - 3.5;
      (spriteRef.current.material as THREE.SpriteMaterial).opacity =
        0.5 * fadeRef.current;
    }
  });

  return (
    <sprite ref={spriteRef} scale={[2.4, 2.4, 1]}>
      <spriteMaterial
        map={glowTex}
        transparent
        opacity={0.5}
        depthWrite={false}
      />
    </sprite>
  );
}

function Rings({
  activeIndexRef,
  fadeRef,
}: {
  activeIndexRef: React.RefObject<number>;
  fadeRef: React.RefObject<number>;
}) {
  const ringRefs = useRef<THREE.Mesh[]>([]);

  useFrame((_state, delta) => {
    const alpha = frameAlpha(delta);
    ringRefs.current.forEach((ring, i) => {
      if (!ring) return;
      const active = i === activeIndexRef.current;
      const mat = ring.material as THREE.MeshBasicMaterial;
      mat.color.set(active ? AMBER : DIM);
      const targetOpacity = (active ? 0.95 : 0.35) * fadeRef.current;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, alpha);
    });
  });

  return (
    <>
      {Array.from({ length: STAGE_COUNT }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) ringRefs.current[i] = el;
          }}
          position={[0, 0, -i * RING_SPACING - 4]}
          rotation={[Math.PI / 2 + (i % 2 === 0 ? 0.15 : -0.15), 0, 0]}
        >
          <torusGeometry args={[2.4, 0.012, 8, 64]} />
          {/* Rings stay meshBasic deliberately: a 12mm-thick unlit torus
              reads as self-luminous neon either way, and 6 of them re-lit
              per frame is exactly the kind of cost the 60fps budget
              doesn't need to spend. Depth comes from the scene fog (they
              recede into atmosphere), not from surface shading. */}
          <meshBasicMaterial color={DIM} transparent opacity={0.5} />
        </mesh>
      ))}
    </>
  );
}

function AmbientParticles({ fadeRef }: { fadeRef: React.RefObject<number> }) {
  // Math.random() can't run during render (or inside useMemo, which the
  // compiler's purity check treats the same way) — generated in an effect
  // and stored via state instead, same pattern Starfield.tsx already uses.
  const [positions, setPositions] = useState<Float32Array | null>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);

  useEffect(() => {
    const count = window.innerWidth < 700 ? 200 : 500;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 2] = (Math.random() - 0.5) * STAGE_COUNT * RING_SPACING - 20;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPositions(arr);
  }, []);

  useFrame(() => {
    if (matRef.current) matRef.current.opacity = 0.6 * fadeRef.current;
  });

  if (!positions) return null;

  return (
    <Points positions={positions}>
      <PointMaterial
        ref={matRef}
        color="#5B6270"
        size={0.03}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </Points>
  );
}

/**
 * The pipeline section's 3D backdrop: a camera that dollies through 6
 * amber rings (one per stage) as the user scrolls #pipeline-track, with
 * the video-clip tile floating at the origin and ambient particles
 * throughout. Ported from the approved prototype's vanilla Three.js scene
 * into R3F — same visual language (ring highlighting, tile rotation,
 * camera-follow glow sprite), driven by the shared landing-scroll-store
 * instead of a raw window.scroll listener.
 */
export default function PipelineScene({
  reducedMotion,
}: {
  reducedMotion: boolean;
}) {
  const { camera } = useThree();
  // Indirection so the mutations below target `cameraRef.current` rather
  // than the `camera` binding useThree() returned directly — same
  // assign-to-a-ref-first pattern this codebase already established for
  // every other case of "needs to mutate a hook-returned object every
  // frame" (R3F's camera control is inherently imperative).
  const cameraRef = useRef(camera);
  const currentZ = useRef(START_Z);
  const parallax = useRef(new THREE.Vector2(0, 0));
  const activeIndex = useRef(0);
  const fade = useRef(1);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    cameraRef.current = camera;
    cameraRef.current.position.z = START_Z;
  }, [camera]);

  useFrame((state, delta) => {
    const { pipelineProgress, assemblyPhase, assemblyProgress } =
      useLandingScrollStore.getState();
    const alpha = frameAlpha(delta);

    const targetZ =
      START_Z - pipelineProgress * (STAGE_COUNT - 1) * RING_SPACING;
    currentZ.current = reducedMotion
      ? targetZ
      : currentZ.current + (targetZ - currentZ.current) * alpha;
    cameraRef.current.position.z = currentZ.current;

    // Pointer parallax — a small damped camera drift toward the cursor.
    // Cheap (no extra draws) and the single biggest "this is a real 3D
    // space, not a video" cue, because near rings/particles shift against
    // far ones. Skipped under reduced motion; scroll still works.
    //
    // Deliberately translation-only — no camera.lookAt()/rotation here.
    // This used to re-aim the camera after each translation, which caused
    // the Nova/tile overlap bug: Nova's position (NovaController.tsx) is a
    // raw, unrotated offset added to camera.position, so she inherits this
    // translation but NOT a rotation, while the tile sits fixed at world
    // origin near the old lookAt target and stayed visually anchored to
    // screen-center regardless of it — the two drifted apart on screen in
    // a way neither of NovaController's clearance checks could detect
    // (both are rotation-blind). A translating, non-rotating camera still
    // produces real depth-parallax on its own (near objects shift more
    // than far ones per unit of translation) — the rotation was adding a
    // uniform, depth-independent pan on top, which is what actually broke
    // things. Keep this rotation-free: every camera-relative computation
    // elsewhere in this scene (Nova's offset, the glow sprite's depth, the
    // rim/fill lights in LandingScene.tsx) assumes the camera never
    // rotates off the -Z axis.
    if (!reducedMotion) {
      parallax.current.x +=
        (state.pointer.x * 0.28 - parallax.current.x) * alpha;
      parallax.current.y +=
        (state.pointer.y * 0.16 - parallax.current.y) * alpha;
      cameraRef.current.position.x = parallax.current.x;
      cameraRef.current.position.y = parallax.current.y;
    }

    activeIndex.current = Math.round(pipelineProgress * (STAGE_COUNT - 1));

    // Dissolve into the assembly section instead of the old hard
    // visibility cut: fades over the first DISSOLVE_SPAN of assembly
    // progress, right underneath the panels scattering in, then the group
    // is culled entirely once invisible (and for the whole rest of the
    // page) so it costs nothing behind the manifesto/features/confidence
    // sections.
    const targetFade =
      assemblyPhase === "before"
        ? 1
        : assemblyPhase === "during"
          ? 1 - clamp01(assemblyProgress / DISSOLVE_SPAN)
          : 0;
    fade.current = reducedMotion
      ? targetFade
      : fade.current + (targetFade - fade.current) * alpha;
    if (groupRef.current) groupRef.current.visible = fade.current > 0.01;
  });

  return (
    <group ref={groupRef}>
      <VideoTile
        reducedMotion={reducedMotion}
        fadeRef={fade}
        cameraZRef={currentZ}
      />
      <GlowSprite cameraZRef={currentZ} fadeRef={fade} />
      <Rings activeIndexRef={activeIndex} fadeRef={fade} />
      <AmbientParticles fadeRef={fade} />
    </group>
  );
}
