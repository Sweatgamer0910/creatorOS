"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export default function TiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 18, mass: 0.5 };

  const rotateX = useSpring(
    useTransform(y, [-0.5, 0.5], [10, -10]),
    springConfig,
  );
  const rotateY = useSpring(
    useTransform(x, [-0.5, 0.5], [-10, 10]),
    springConfig,
  );

  const glowX = useSpring(
    useTransform(x, [-0.5, 0.5], ["-20%", "120%"]),
    springConfig,
  );
  const glowY = useSpring(
    useTransform(y, [-0.5, 0.5], ["-20%", "120%"]),
    springConfig,
  );

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (prefersReducedMotion) return;
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;
    x.set((e.clientX - bounds.left) / bounds.width - 0.5);
    y.set((e.clientY - bounds.top) / bounds.height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        transformPerspective: 800,
        position: "relative",
        willChange: "transform",
        backfaceVisibility: "hidden",
      }}
      className={className}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          borderRadius: "inherit",
          pointerEvents: "none",
        }}
      >
        <motion.div
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            left: glowX,
            top: glowY,
            translateX: "-50%",
            translateY: "-50%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(245,166,35,0.25) 0%, transparent 70%)",
            filter: "blur(20px)",
            willChange: "transform",
          }}
        />
      </div>
      {children}
    </motion.div>
  );
}
