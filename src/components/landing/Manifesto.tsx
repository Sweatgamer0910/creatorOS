"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// Exact copy from the approved prototype — 4 lines, deliberately no
// section title.
const LINES: [string, string][] = [
  ["Clarity ", "cleverness."],
  ["Speed ", "chaos."],
  ["Automation ", "explanation."],
  ["Trust ", "hype."],
];
const CONNECTORS = ["over", "without", "with", "over"];

export default function Manifesto() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section style={{ padding: "180px 32px", display: "flex", justifyContent: "center" }}>
      <div style={{ maxWidth: 820, display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
        {LINES.map(([before, after], i) => (
          <motion.div
            key={i}
            initial={reducedMotion ? undefined : { opacity: 0 }}
            whileInView={reducedMotion ? undefined : { opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.4, delay: i * 0.12 }}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(24px,4vw,42px)",
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: "#F5F3EE",
              padding: "14px 0",
              borderBottom: "1px solid rgba(245,243,238,0.08)",
            }}
          >
            {before}
            <span style={{ color: "#F5A623" }}>{CONNECTORS[i]}</span> {after}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
