"use client";

import { motion } from "framer-motion";

export default function Spinner({ size = 24 }: { size?: number }) {
  const rings = 3;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {Array.from({ length: rings }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            borderRadius: "50%",
            border: "1.5px solid var(--color-accent)",
          }}
          initial={{ width: size * 0.25, height: size * 0.25, opacity: 0.8 }}
          animate={{
            width: size,
            height: size,
            opacity: 0,
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeOut",
          }}
        />
      ))}
      <div
        style={{
          width: size * 0.22,
          height: size * 0.22,
          borderRadius: "50%",
          backgroundColor: "var(--color-accent)",
        }}
      />
    </div>
  );
}
