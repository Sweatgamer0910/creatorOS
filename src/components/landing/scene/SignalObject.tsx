"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MotionValue } from "framer-motion";
import * as THREE from "three";

export default function SignalObject({
  scrollProgress,
}: {
  scrollProgress: MotionValue<number>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!meshRef.current || !wireRef.current) return;

    const progress = scrollProgress.get();

    meshRef.current.rotation.y += delta * 0.15;
    meshRef.current.rotation.x = progress * Math.PI * 1.5;
    wireRef.current.rotation.y = meshRef.current.rotation.y;
    wireRef.current.rotation.x = meshRef.current.rotation.x;

    const scale = 1 + progress * 0.6;
    meshRef.current.scale.setScalar(scale);
    wireRef.current.scale.setScalar(scale * 1.15);
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshStandardMaterial
          color="#f5a623"
          emissive="#f5a623"
          emissiveIntensity={0.4}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>
      <mesh ref={wireRef}>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshBasicMaterial
          color="#2dd4bf"
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  );
}
