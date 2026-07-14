"use client";

import { Canvas } from "@react-three/fiber";
import { MotionValue } from "framer-motion";
import SignalObject from "./SignalObject";

export default function Scene({
  scrollProgress,
}: {
  scrollProgress: MotionValue<number>;
}) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#f5a623" />
      <pointLight position={[-5, -3, 3]} intensity={0.8} color="#2dd4bf" />
      <SignalObject scrollProgress={scrollProgress} />
    </Canvas>
  );
}
