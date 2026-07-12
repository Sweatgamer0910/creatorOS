"use client";

import { motion } from "framer-motion";

function Orb({
  size,
  color,
  style,
  xRange,
  yRange,
  duration,
}: {
  size: number;
  color: string;
  style: React.CSSProperties;
  xRange: number[];
  yRange: number[];
  duration: number;
}) {
  return (
    <motion.div
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 55%)`,
        willChange: "transform",
        backfaceVisibility: "hidden",
        transform: "translateZ(0)",
        ...style,
      }}
      animate={{ x: xRange, y: yRange }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export default function AuroraBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        zIndex: 0,
        pointerEvents: "none",
        backgroundColor: "#000000",
      }}
    >
      <div style={{ position: "absolute", inset: 0, filter: "blur(90px)" }}>
        <Orb
          size={550}
          color="rgba(245,166,35,0.55)"
          style={{ top: "-10%", left: "-5%" }}
          xRange={[0, 70, 0]}
          yRange={[0, 40, 0]}
          duration={16}
        />
        <Orb
          size={450}
          color="rgba(45,212,191,0.45)"
          style={{ top: "20%", right: "-8%" }}
          xRange={[0, -60, 0]}
          yRange={[0, 60, 0]}
          duration={20}
        />
        <Orb
          size={400}
          color="rgba(245,166,35,0.35)"
          style={{ bottom: "-10%", left: "30%" }}
          xRange={[0, 40, 0]}
          yRange={[0, -30, 0]}
          duration={18}
        />
      </div>

      {/* Subtle grain texture for depth, prevents flat/banded gradient look */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
