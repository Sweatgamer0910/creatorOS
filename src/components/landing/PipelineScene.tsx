"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, Edges, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useLandingScrollStore } from "@/lib/landing-scroll-store";

const AMBER = "#F5A623";
const DIM = "#2A2E36";
const STAGE_COUNT = 6;
const RING_SPACING = 7;
const START_Z = 8;
const DAMPING = 0.06;

// The play-icon texture drawn once onto a canvas and reused as a
// MeshBasicMaterial map — same approach the prototype used, ported from
// raw <canvas> calls to a memoized CanvasTexture.
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
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
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
function VideoTile({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const playIconTex = usePlayIconTexture();

  useFrame((_state, delta) => {
    if (reducedMotion || !groupRef.current) return;
    groupRef.current.rotation.x += delta * 0.15;
    groupRef.current.rotation.y += delta * 0.22;
  });

  return (
    <group ref={groupRef}>
      <RoundedBox args={[1.5, 1.9, 0.22]} radius={0.22} smoothness={4}>
        <meshBasicMaterial color="#171B22" transparent opacity={0.94} />
        <Edges color={AMBER} threshold={20} />
      </RoundedBox>
      <mesh position={[0, 0, 0.15]}>
        <planeGeometry args={[0.85, 0.85]} />
        <meshBasicMaterial map={playIconTex} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

function GlowSprite({ cameraZRef }: { cameraZRef: React.RefObject<number> }) {
  const spriteRef = useRef<THREE.Sprite>(null);
  const glowTex = useGlowTexture();

  useFrame(() => {
    // Stays a fixed distance ahead of the camera, further back than the
    // original prototype's 1.5 units — at 1.5, a 6-unit-wide sprite this
    // close to a 55°-FOV camera filled the entire frame with a flat wash
    // of amber (the visual bug QA caught). Pushed back + shrunk so it
    // reads as a soft glow accent behind the tile, not a full-screen tint.
    if (spriteRef.current) spriteRef.current.position.z = cameraZRef.current - 3.5;
  });

  return (
    <sprite ref={spriteRef} scale={[2.4, 2.4, 1]}>
      <spriteMaterial map={glowTex} transparent opacity={0.5} depthWrite={false} />
    </sprite>
  );
}

function Rings({ activeIndexRef }: { activeIndexRef: React.RefObject<number> }) {
  const ringRefs = useRef<THREE.Mesh[]>([]);

  useFrame(() => {
    ringRefs.current.forEach((ring, i) => {
      if (!ring) return;
      const active = i === activeIndexRef.current;
      const mat = ring.material as THREE.MeshBasicMaterial;
      mat.color.set(active ? AMBER : DIM);
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, active ? 0.95 : 0.35, 0.15);
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
          <meshBasicMaterial color={DIM} transparent opacity={0.5} />
        </mesh>
      ))}
    </>
  );
}

function AmbientParticles() {
  // Math.random() can't run during render (or inside useMemo, which the
  // compiler's purity check treats the same way) — generated in an effect
  // and stored via state instead, same pattern Starfield.tsx already uses
  // for its randomized star positions.
  const [positions, setPositions] = useState<Float32Array | null>(null);

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

  if (!positions) return null;

  return (
    <Points positions={positions}>
      <PointMaterial color="#5B6270" size={0.03} transparent opacity={0.6} sizeAttenuation />
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
export default function PipelineScene({ reducedMotion }: { reducedMotion: boolean }) {
  const { camera } = useThree();
  // Indirection so the mutations below target `cameraRef.current` rather
  // than the `camera` binding useThree() returned directly — same
  // assign-to-a-ref-first pattern this codebase already established for
  // every other case of "needs to mutate a hook-returned object every
  // frame" (R3F's camera control is inherently imperative; there's no
  // non-mutating way to move a camera).
  const cameraRef = useRef(camera);
  const currentZ = useRef(START_Z);
  const activeIndex = useRef(0);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    cameraRef.current = camera;
    cameraRef.current.position.z = START_Z;
  }, [camera]);

  useFrame(() => {
    const { pipelineProgress, assemblyPhase } = useLandingScrollStore.getState();
    const targetZ = START_Z - pipelineProgress * (STAGE_COUNT - 1) * RING_SPACING;
    currentZ.current = reducedMotion
      ? targetZ
      : currentZ.current + (targetZ - currentZ.current) * DAMPING;
    cameraRef.current.position.z = currentZ.current;
    activeIndex.current = Math.round(pipelineProgress * (STAGE_COUNT - 1));

    // The camera holds at its final dollied position for the rest of the
    // page once the pipeline+assembly sections are behind it (nothing
    // moves it further) — without this, the rings/tile/glow stayed
    // permanently in frame, overlapping every DOM section all the way
    // down to the footer. Hidden outright rather than faded: by the time
    // assemblyPhase flips to "after" the converged dashboard panels and
    // beat text have already faded out, so there's nothing left drawing
    // attention to this layer when it disappears.
    if (groupRef.current) groupRef.current.visible = assemblyPhase !== "after";
  });

  return (
    <group ref={groupRef}>
      <VideoTile reducedMotion={reducedMotion} />
      <GlowSprite cameraZRef={currentZ} />
      <Rings activeIndexRef={activeIndex} />
      <AmbientParticles />
    </group>
  );
}
