"use client";

import { RefObject, useCallback, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { MotionValue } from "framer-motion";
import * as THREE from "three";
import ContentField from "./ContentField";
import Orrery, {
  PLANET_BONES,
  getAnchorWorldPosition,
  type PlanetAnchor,
} from "./Orrery";
import PlanetLabels from "./PlanetLabels";

type Anchors = Partial<Record<keyof typeof PLANET_BONES, PlanetAnchor>>;

// Each hero chapter flies the camera to the planet carrying that chapter's
// feature (see PlanetLabels' PLANET_FEATURES — Venus/Analytics, Earth/AI
// Growth Coach, Saturn/Pipeline match the three chapters by name). The
// offset is the camera's position *relative to the live planet position*
// (not an absolute point), since the planet itself keeps moving as the
// orrery's scroll-scrubbed animation advances.
const cameraWaypoints: {
  planet: keyof typeof PLANET_BONES;
  offset: [number, number, number];
  fov: number;
}[] = [
  { planet: "venus", offset: [1.4, 0.6, 2.8], fov: 36 },
  { planet: "earth", offset: [-1.1, 0.7, 2.6], fov: 34 },
  { planet: "saturn", offset: [1.5, -0.4, 2.8], fov: 38 },
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

const ORIGIN = new THREE.Vector3(0, 0, 0);

// Flies the camera to each chapter's target planet as the user scrolls,
// instead of panning through fixed points in empty space. The target
// itself moves (the orrery's scroll-scrubbed clip keeps the planet
// orbiting), so the target position is recomputed live every frame rather
// than cached.
function CameraRig({
  scrollProgress,
  reducedMotion,
  isVisibleRef,
  anchors,
}: {
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
  isVisibleRef: RefObject<boolean>;
  anchors: Anchors;
}) {
  const targetA = useRef(new THREE.Vector3());
  const targetB = useRef(new THREE.Vector3());
  const blendedTarget = useRef(new THREE.Vector3());
  const lookAtPoint = useRef(new THREE.Vector3());

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

    const anchorA = anchors[a.planet];
    const anchorB = anchors[b.planet];
    if (anchorA) getAnchorWorldPosition(anchorA, targetA.current);
    else targetA.current.copy(ORIGIN);
    if (anchorB) getAnchorWorldPosition(anchorB, targetB.current);
    else targetB.current.copy(ORIGIN);

    blendedTarget.current.lerpVectors(targetA.current, targetB.current, blend);

    const parallaxStrength = reducedMotion ? 0 : 0.35;
    const offsetX =
      THREE.MathUtils.lerp(a.offset[0], b.offset[0], blend) +
      pointer.x * parallaxStrength;
    const offsetY =
      THREE.MathUtils.lerp(a.offset[1], b.offset[1], blend) +
      pointer.y * parallaxStrength * 0.6;
    const offsetZ = THREE.MathUtils.lerp(a.offset[2], b.offset[2], blend);

    const targetX = blendedTarget.current.x + offsetX;
    const targetY = blendedTarget.current.y + offsetY;
    const targetZ = blendedTarget.current.z + offsetZ;

    // Lerp toward target every frame instead of snapping — mouse parallax
    // and the planet-to-planet fly should feel like drift, never a jump cut.
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

    lookAtPoint.current.lerp(blendedTarget.current, lerpFactor);
    camera.lookAt(lookAtPoint.current);

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
  const [anchors, setAnchors] = useState<
    Partial<Record<keyof typeof PLANET_BONES, PlanetAnchor>>
  >({});
  const handleAnchorsReady = useCallback(
    (a: Partial<Record<keyof typeof PLANET_BONES, PlanetAnchor>>) =>
      setAnchors(a),
    [],
  );

  return (
    <Canvas
      camera={{ position: [0, 0, 5.2], fov: 40 }}
      dpr={[1, dprCap]}
      onCreated={onCreated}
      gl={{ antialias: false, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.35} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      {/* Rim light behind/above the orrery — classic product-render
          separation from the black background. */}
      <pointLight position={[-3, 2, -4]} intensity={1.2} color="#fff4e0" />
      <Environment preset="city" />
      <FogRig
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
        isVisibleRef={isVisibleRef}
      />
      <CameraRig
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
        isVisibleRef={isVisibleRef}
        anchors={anchors}
      />
      <Orrery
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
        isVisibleRef={isVisibleRef}
        onAnchorsReady={handleAnchorsReady}
      />
      <PlanetLabels
        anchors={anchors}
        isVisibleRef={isVisibleRef}
        reducedMotion={reducedMotion}
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
            intensity={0.4}
            luminanceThreshold={0.5}
            luminanceSmoothing={0.4}
            mipmapBlur
          />
        </EffectComposer>
      )}
    </Canvas>
  );
}
