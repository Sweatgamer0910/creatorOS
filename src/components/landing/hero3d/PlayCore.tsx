"use client";

import { RefObject, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MotionValue } from "framer-motion";
import * as THREE from "three";

const CHAPTER_COUNT = 3;

const CHAPTER_COLORS = [
  new THREE.Color("#f5a623"),
  new THREE.Color("#2dd4bf"),
  new THREE.Color("#a884fa"),
];

// A rounded play-triangle — CreatorOS is a video/creator platform, so the
// hero's stable anchor should read as unmistakably "video," not an abstract
// blob. Built from a THREE.Shape (three arced corners) and extruded so it
// has real depth and can pick up specular highlights + transmission.
function buildPlayShape() {
  const shape = new THREE.Shape();
  const r = 0.16; // corner rounding radius
  const points: [number, number][] = [
    [-0.62, 0.75],
    [0.95, 0],
    [-0.62, -0.75],
  ];

  for (let i = 0; i < points.length; i++) {
    const prev = points[(i - 1 + points.length) % points.length];
    const curr = points[i];
    const next = points[(i + 1) % points.length];

    const toPrev = new THREE.Vector2(
      prev[0] - curr[0],
      prev[1] - curr[1],
    ).normalize();
    const toNext = new THREE.Vector2(
      next[0] - curr[0],
      next[1] - curr[1],
    ).normalize();

    const start = new THREE.Vector2(
      curr[0] + toPrev.x * r,
      curr[1] + toPrev.y * r,
    );
    const end = new THREE.Vector2(
      curr[0] + toNext.x * r,
      curr[1] + toNext.y * r,
    );

    if (i === 0) shape.moveTo(start.x, start.y);
    else shape.lineTo(start.x, start.y);
    shape.quadraticCurveTo(curr[0], curr[1], end.x, end.y);
  }
  shape.closePath();

  return shape;
}

export default function PlayCore({
  scrollProgress,
  reducedMotion,
  isVisibleRef,
}: {
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
  isVisibleRef: RefObject<boolean>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const currentColor = useRef(new THREE.Color("#f5a623"));

  const { geometry, material } = useMemo(() => {
    const shape = buildPlayShape();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.42,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 6,
      curveSegments: 24,
    });
    geo.center();
    // Scaled down so it reads as a hero centerpiece without crowding the
    // text column at the tighter camera waypoints.
    geo.scale(0.52, 0.52, 0.52);
    geo.computeVertexNormals();

    const mat = new THREE.MeshPhysicalMaterial({
      color: "#f5a623",
      emissive: "#f5a623",
      emissiveIntensity: 0.35,
      roughness: 0.12,
      metalness: 0.05,
      transmission: 0.75,
      thickness: 1.2,
      ior: 1.45,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.4,
    });

    return { geometry: geo, material: mat };
  }, []);

  useEffect(() => {
    materialRef.current = material;
    return () => {
      geometry.dispose();
      material.dispose();
      materialRef.current = null;
    };
  }, [geometry, material]);

  useFrame((state, delta) => {
    const mat = materialRef.current;
    if (!isVisibleRef.current || !mat || !meshRef.current) return;

    const progress = THREE.MathUtils.clamp(scrollProgress.get(), 0, 1);
    const rawChapterFloat = progress * (CHAPTER_COUNT - 1);
    const chapterFloat = reducedMotion
      ? Math.round(rawChapterFloat)
      : rawChapterFloat;
    const chapterIndex = Math.floor(chapterFloat);
    const chapterBlend = chapterFloat - chapterIndex;

    const colorA = CHAPTER_COLORS[Math.min(chapterIndex, CHAPTER_COUNT - 1)];
    const colorB = CHAPTER_COLORS[
      Math.min(chapterIndex + 1, CHAPTER_COUNT - 1)
    ];
    currentColor.current.lerpColors(colorA, colorB, chapterBlend);

    mat.color.copy(currentColor.current);
    mat.emissive.copy(currentColor.current);
    if (glowRef.current) glowRef.current.color.copy(currentColor.current);

    if (!reducedMotion) {
      meshRef.current.rotation.y += delta * 0.22;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group position={[0.35, 0, -0.3]}>
      <pointLight ref={glowRef} position={[0, 0, 0.6]} intensity={1.6} distance={5} />
      <mesh ref={meshRef} geometry={geometry} material={material} />
    </group>
  );
}
