"use client";

import { RefObject, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MotionValue } from "framer-motion";
import * as THREE from "three";
import { buildFormations } from "./formations";

const VERTEX_SHADER = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform float uIdle;

  attribute vec3 aPosA;
  attribute vec3 aPosB;
  attribute vec3 aPosC;
  attribute float aSeed;
  attribute float aSize;

  varying float vMix;
  varying float vSeed;

  void main() {
    float t = clamp(uProgress, 0.0, 1.0) * 2.0;
    vec3 target;
    float localMix;
    if (t < 1.0) {
      target = mix(aPosA, aPosB, t);
      localMix = t;
    } else {
      target = mix(aPosB, aPosC, t - 1.0);
      localMix = 1.0 + (t - 1.0);
    }

    vec3 pos = target;

    // Gentle per-point idle drift, GPU-only — skipped under reduced motion.
    float drift = uIdle;
    pos.x += sin(uTime * 0.6 + aSeed) * 0.045 * drift;
    pos.y += cos(uTime * 0.5 + aSeed * 1.3) * 0.045 * drift;
    pos.z += sin(uTime * 0.4 + aSeed * 0.7) * 0.045 * drift;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    // Calibrated for a ~4-5 unit camera distance — points should read as
    // small glowing dots, not overlapping discs that wash the frame white.
    gl_PointSize = uSize * aSize * uPixelRatio * (4.0 / -mvPosition.z);

    vMix = localMix;
    vSeed = aSeed;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;

  varying float vMix;
  varying float vSeed;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;

    float glow = smoothstep(0.5, 0.0, dist);
    glow = pow(glow, 1.6);

    vec3 color;
    if (vMix < 1.0) {
      color = mix(uColorA, uColorB, vMix);
    } else {
      color = mix(uColorB, uColorC, vMix - 1.0);
    }

    float twinkle = 0.85 + 0.15 * sin(vSeed * 3.0);
    gl_FragColor = vec4(color * glow * twinkle, glow);
  }
`;

interface ContentFieldProps {
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
  isVisibleRef: RefObject<boolean>;
  particleCount: number;
}

export default function ContentField({
  scrollProgress,
  reducedMotion,
  isVisibleRef,
  particleCount,
}: ContentFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  const { geometry, material } = useMemo(() => {
    const { posA, posB, posC, seed, size } = buildFormations(particleCount);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(posA.slice(), 3));
    geo.setAttribute("aPosA", new THREE.BufferAttribute(posA, 3));
    geo.setAttribute("aPosB", new THREE.BufferAttribute(posB, 3));
    geo.setAttribute("aPosC", new THREE.BufferAttribute(posC, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));

    const dpr =
      typeof window !== "undefined"
        ? Math.min(window.devicePixelRatio, 2)
        : 1;

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uPixelRatio: { value: dpr },
        uSize: { value: 3.8 },
        uIdle: { value: reducedMotion ? 0 : 1 },
        // Desaturated versions of the chapter accent colors — this field is
        // now ambient starfield dust around the orrery, not a competing
        // centerpiece, so it reads as background depth rather than a bright
        // colored halo.
        uColorA: { value: new THREE.Color("#8a6a45") },
        uColorB: { value: new THREE.Color("#4a8a83") },
        uColorC: { value: new THREE.Color("#6f5f8a") },
      },
    });

    return { geometry: geo, material: mat };
  }, [particleCount, reducedMotion]);

  useEffect(() => {
    materialRef.current = material;
    return () => {
      geometry.dispose();
      material.dispose();
      materialRef.current = null;
    };
  }, [geometry, material]);

  useFrame((state) => {
    const mat = materialRef.current;
    if (!isVisibleRef.current || !mat) return;

    mat.uniforms.uProgress.value = THREE.MathUtils.clamp(
      scrollProgress.get(),
      0,
      1,
    );

    if (!reducedMotion) {
      mat.uniforms.uTime.value = state.clock.elapsedTime;
    }

    if (pointsRef.current) {
      pointsRef.current.rotation.y += reducedMotion ? 0 : 0.0006;
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}
