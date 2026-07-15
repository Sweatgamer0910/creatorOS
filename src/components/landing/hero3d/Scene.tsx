"use client";

import { RefObject, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { MotionValue } from "framer-motion";
import * as THREE from "three";
import ContentField from "./ContentField";
import PlayCore from "./PlayCore";

const cameraWaypoints: { position: [number, number, number]; fov: number }[] =
  [
    { position: [0, 0, 5.2], fov: 40 }, // Real analytics — wide establishing shot
    { position: [1.1, 0.25, 4], fov: 36 }, // AI Growth Coach — push in
    { position: [-1.2, -0.15, 4.8], fov: 42 }, // Content pipeline — pull back, new angle
  ];

const FOG_COLORS = [
  new THREE.Color("#1a0f00"),
  new THREE.Color("#001a17"),
  new THREE.Color("#140a24"),
];

// Tints the scene's own fog per chapter — a subtle environment color-grade
// shift, like changing the lighting on a movie set between scenes, layered
// underneath the more visible CSS background wash in Hero3D.tsx.
function FogRig({
  scrollProgress,
  reducedMotion,
  isVisibleRef,
}: {
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
  isVisibleRef: RefObject<boolean>;
}) {
  const currentColor = useRef(new THREE.Color("#050505"));
  const fogRef = useRef<THREE.Fog | null>(null);

  useFrame(({ scene }) => {
    if (!fogRef.current) {
      fogRef.current = new THREE.Fog("#050505", 4, 9);
      scene.fog = fogRef.current;
    }
    if (!isVisibleRef.current) return;

    const progress = THREE.MathUtils.clamp(scrollProgress.get(), 0, 1);
    const rawChapterFloat = progress * (FOG_COLORS.length - 1);
    const chapterFloat = reducedMotion
      ? Math.round(rawChapterFloat)
      : rawChapterFloat;
    const i = Math.floor(chapterFloat);
    const blend = chapterFloat - i;
    const a = FOG_COLORS[Math.min(i, FOG_COLORS.length - 1)];
    const b = FOG_COLORS[Math.min(i + 1, FOG_COLORS.length - 1)];

    currentColor.current.lerpColors(a, b, blend);
    fogRef.current.color.copy(currentColor.current);
  });

  return null;
}

function CameraRig({
  scrollProgress,
  reducedMotion,
  isVisibleRef,
}: {
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
  isVisibleRef: RefObject<boolean>;
}) {
  useFrame(({ camera, pointer }) => {
    if (!isVisibleRef.current) return;

    const progress = THREE.MathUtils.clamp(scrollProgress.get(), 0, 1);
    const rawChapterFloat = progress * (cameraWaypoints.length - 1);
    const chapterFloat = reducedMotion
      ? Math.round(rawChapterFloat)
      : rawChapterFloat;
    const i = Math.floor(chapterFloat);
    const blend = chapterFloat - i;
    const a = cameraWaypoints[Math.min(i, cameraWaypoints.length - 1)];
    const b = cameraWaypoints[Math.min(i + 1, cameraWaypoints.length - 1)];

    const parallaxStrength = reducedMotion ? 0 : 0.35;
    const targetX =
      THREE.MathUtils.lerp(a.position[0], b.position[0], blend) +
      pointer.x * parallaxStrength;
    const targetY =
      THREE.MathUtils.lerp(a.position[1], b.position[1], blend) +
      pointer.y * parallaxStrength * 0.6;
    const targetZ = THREE.MathUtils.lerp(a.position[2], b.position[2], blend);

    // Lerp toward target every frame instead of snapping — mouse parallax
    // should feel like drift, never a jump cut.
    const lerpFactor = reducedMotion ? 1 : 0.06;
    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      targetX,
      lerpFactor,
    );
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      targetY,
      lerpFactor,
    );
    camera.position.z = THREE.MathUtils.lerp(
      camera.position.z,
      targetZ,
      lerpFactor,
    );
    camera.lookAt(0, 0, 0);

    if (camera instanceof THREE.PerspectiveCamera) {
      const targetFov = THREE.MathUtils.lerp(a.fov, b.fov, blend);
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, lerpFactor);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

export default function Scene({
  scrollProgress,
  reducedMotion,
  isVisibleRef,
  particleCount,
  bloom,
  dprCap,
  onCreated,
}: {
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
  isVisibleRef: RefObject<boolean>;
  particleCount: number;
  bloom: boolean;
  dprCap: number;
  onCreated?: () => void;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.2], fov: 40 }}
      dpr={[1, dprCap]}
      onCreated={onCreated}
      gl={{ antialias: false, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.25} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#ffffff" />
      <Environment preset="night" />
      <FogRig
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
        isVisibleRef={isVisibleRef}
      />
      <CameraRig
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
        isVisibleRef={isVisibleRef}
      />
      <PlayCore
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
        isVisibleRef={isVisibleRef}
      />
      <ContentField
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
        isVisibleRef={isVisibleRef}
        particleCount={particleCount}
      />
      {bloom && (
        <EffectComposer>
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.3}
            luminanceSmoothing={0.4}
            mipmapBlur
          />
        </EffectComposer>
      )}
    </Canvas>
  );
}
