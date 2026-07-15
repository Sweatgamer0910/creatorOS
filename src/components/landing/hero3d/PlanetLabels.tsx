"use client";

import { RefObject, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { getAnchorWorldPosition, type PLANET_BONES, type PlanetAnchor } from "./Orrery";

// Only the app's real, shipped features get a planet — not the aspirational
// Handbook feature list. Uranus and Neptune (the two bones with no entry
// here) stay part of the model but unlabeled: there's no 7th/8th built
// feature to honestly attach to them. Ordered innermost → outermost,
// roughly matching how often a creator touches each one day to day.
const PLANET_FEATURES: Partial<Record<keyof typeof PLANET_BONES, string>> = {
  mercury: "Dashboard",
  venus: "Analytics",
  earth: "AI Growth Coach",
  mars: "Idea Lab",
  jupiter: "Script Studio",
  saturn: "Pipeline",
};

function PlanetLabel({
  anchor,
  label,
  isVisibleRef,
  reducedMotion,
}: {
  anchor: PlanetAnchor;
  label: string;
  isVisibleRef: RefObject<boolean>;
  reducedMotion: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const worldPos = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!isVisibleRef.current || !groupRef.current) return;
    getAnchorWorldPosition(anchor, worldPos.current);
    groupRef.current.position.copy(worldPos.current);
  });

  return (
    <group ref={groupRef}>
      <Html center occlude={false} zIndexRange={[1, 0]}>
        <div
          style={{
            pointerEvents: "none",
            whiteSpace: "nowrap",
            padding: "4px 10px",
            borderRadius: 999,
            fontSize: 11,
            fontFamily: "var(--font-body)",
            color: "rgba(255,255,255,0.85)",
            backgroundColor: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.12)",
            transform: "translateY(18px)",
            transition: reducedMotion ? "none" : "opacity 0.3s ease",
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

export default function PlanetLabels({
  anchors,
  isVisibleRef,
  reducedMotion,
}: {
  anchors: Partial<Record<keyof typeof PLANET_BONES, PlanetAnchor>>;
  isVisibleRef: RefObject<boolean>;
  reducedMotion: boolean;
}) {
  return (
    <>
      {(Object.keys(PLANET_FEATURES) as Array<keyof typeof PLANET_FEATURES>)
        .filter((key) => anchors[key])
        .map((key) => (
          <PlanetLabel
            key={key}
            anchor={anchors[key]!}
            label={PLANET_FEATURES[key]!}
            isVisibleRef={isVisibleRef}
            reducedMotion={reducedMotion}
          />
        ))}
    </>
  );
}
