"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";

export default function Spinner({
  size = 24,
  variant = "accent",
}: {
  size?: number;
  variant?: "accent" | "dark";
}) {
  const color = variant === "dark" ? "#0e1116" : "var(--color-accent)";

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: "2px solid transparent",
          borderTopColor: color,
          borderRightColor: color,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Play
          size={size * 0.38}
          fill={color}
          color={color}
          style={{ marginLeft: size * 0.03 }}
        />
      </div>
    </div>
  );
}
