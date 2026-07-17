"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// Ported verbatim from the approved prototype (creatoros-landing.html) —
// copy, structure, and CTAs are not up for reinterpretation here. The
// prototype's WebGL canvas (rings/tile/particles/Nova) now lives in
// LandingScene.tsx, mounted once behind the whole page rather than
// per-section, so this component is DOM-only.
export default function Hero() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "120px 32px 80px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#F5A623",
          marginBottom: 24,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#F5A623",
            boxShadow: "0 0 8px rgba(245,166,35,0.55)",
          }}
        />
        AI operating system for YouTube creators
      </span>

      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: "clamp(40px, 7vw, 92px)",
          lineHeight: 1.02,
          letterSpacing: "-0.03em",
          maxWidth: 920,
          marginBottom: 28,
          color: "#F5F3EE",
        }}
      >
        One system for
        <br />
        every stage of <span style={{ color: "#F5A623" }}>the channel</span>.
      </h1>

      <p
        style={{
          fontSize: "clamp(15px,2vw,19px)",
          color: "#9AA0AC",
          maxWidth: 560,
          marginBottom: 40,
        }}
      >
        CreatorOS unifies planning, production, publishing, and analytics
        into a single premium workspace — so the next video is always
        obvious, not overwhelming.
      </p>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/signup"
          className="glow-interactive"
          style={{
            padding: "14px 26px",
            background: "#F5A623",
            color: "#030304",
            fontWeight: 600,
            fontSize: 15,
            borderRadius: 10,
            boxShadow: "0 0 0 1px rgba(245,166,35,0.4), 0 8px 24px -8px rgba(245,166,35,0.55)",
            textDecoration: "none",
          }}
        >
          Sign up
        </Link>
        <Link
          href="/login"
          className="glow-interactive"
          style={{
            padding: "14px 26px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(245,243,238,0.08)",
            color: "#F5F3EE",
            fontWeight: 500,
            fontSize: 15,
            borderRadius: 10,
            backdropFilter: "blur(8px)",
            textDecoration: "none",
          }}
        >
          Log in
        </Link>
      </div>

      <div
        style={{
          marginTop: 64,
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.1em",
          color: "#5B6270",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <motion.span
          style={{
            width: 1,
            height: 34,
            background: "linear-gradient(to bottom, #F5A623, transparent)",
          }}
          animate={reducedMotion ? undefined : { opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
        SCROLL
      </div>
    </section>
  );
}
