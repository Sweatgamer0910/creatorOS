"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { easing } from "@/lib/design-tokens";

// Ported verbatim from the approved prototype (creatoros-landing.html) —
// copy, structure, and CTAs are not up for reinterpretation here. The
// prototype's WebGL canvas (rings/tile/particles/Nova) now lives in
// LandingScene.tsx, mounted once behind the whole page rather than
// per-section, so this component is DOM-only.
//
// Entrance motion added on top of that untouched copy/structure: a
// staggered blur-to-focus reveal (badge -> headline -> subtext -> CTAs),
// using the same technique documented in the Remotion motion kit
// (creatoros-motion-kit README §5b) so the first thing a visitor sees
// feels like the same product as the marketing videos.
//
// This can't use a plain initial/animate pair on mount: there's a known
// Framer Motion + Next.js 16/Turbopack/React 19 bug where a motion
// element that's freshly mounted on first paint renders pre-settled at
// its final state instead of animating from `initial` (see
// InsightList.tsx and PageTransition.tsx for two other places this bit
// us). The one mechanism proven to actually animate in this app is a
// `key` change on an already-mounted AnimatePresence, so — same as
// InsightList — this renders a static "loading" (held-hidden) pass
// first, then flips to a "content" key one tick later via an effect.
export default function Hero() {
  const reducedMotion = usePrefersReducedMotion();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRevealed(true);
  }, []);

  const wrapperStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.12, delayChildren: 0.05 },
    },
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.7, ease: easing.premiumOut },
    },
  };

  const headlineReveal: Variants = {
    hidden: { opacity: 0, y: 20, filter: "blur(14px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.9, ease: easing.premiumOut },
    },
  };

  const ctaReveal: Variants = {
    hidden: { opacity: 0, y: 12, scale: 0.96, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: easing.overshoot },
    },
  };

  const heroContent = (
    <>
      <motion.span
        variants={fadeUp}
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
      </motion.span>

      <motion.h1
        variants={headlineReveal}
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
      </motion.h1>

      <motion.p
        variants={fadeUp}
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
      </motion.p>

      <motion.div
        variants={ctaReveal}
        style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}
      >
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
      </motion.div>
    </>
  );

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
      {reducedMotion ? (
        <div style={wrapperStyle}>{heroContent}</div>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          {!revealed ? (
            <motion.div
              key="loading"
              style={wrapperStyle}
              variants={container}
              initial="hidden"
              animate="hidden"
            >
              {heroContent}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              style={wrapperStyle}
              variants={container}
              initial="hidden"
              animate="visible"
            >
              {heroContent}
            </motion.div>
          )}
        </AnimatePresence>
      )}

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
