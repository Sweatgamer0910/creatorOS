"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface Star {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

export default function Starfield() {
  const [stars, setStars] = useState<Star[]>([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const generated = Array.from({ length: 120 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      delay: Math.random() * 4,
      duration: 2 + Math.random() * 3,
    }));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStars(generated);
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {stars.map((star, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            borderRadius: "50%",
            backgroundColor: "#fff",
            opacity: prefersReducedMotion ? 0.6 : undefined,
          }}
          animate={
            prefersReducedMotion ? undefined : { opacity: [0.2, 1, 0.2] }
          }
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
