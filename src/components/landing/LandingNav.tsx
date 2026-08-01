"use client";

import Image from "next/image";
import Link from "next/link";
import { useIsNarrowViewport } from "@/hooks/useIsNarrowViewport";

// Scrolls smoothly to a section per click, instead of relying on a
// document-wide `html { scroll-behavior: smooth }` — see the comment in
// globals.css for why that global mode was removed.
function handleAnchorClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
  e.preventDefault();
  const target = document.getElementById(id);
  if (!target) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  target.scrollIntoView({
    behavior: reducedMotion ? "auto" : "smooth",
    block: "start",
  });
}

export default function LandingNav() {
  // Below this width, the logo + wordmark + Login + Sign up buttons don't
  // all fit in one row at the desktop padding/sizing — on a 320-360px
  // phone (the narrow end of what's still common) that pushed the Sign up
  // button's edge past the viewport instead of wrapping, since this nav has
  // no flex-wrap and every child has a fixed size. Same underlying overflow
  // pattern as the "link to idea" dropdown bug, different screen. Fixed by
  // trimming to logo-only + tighter button padding below the breakpoint,
  // not by wrapping — a nav bar that wraps to two rows reads as broken, a
  // nav bar that just gets more compact doesn't.
  const isNarrow = useIsNarrowViewport();

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: isNarrow ? "16px 16px" : "20px 32px",
        background: "rgba(3,3,4,0.55)",
        backdropFilter: "blur(16px) saturate(140%)",
        WebkitBackdropFilter: "blur(16px) saturate(140%)",
        borderBottom: "1px solid rgba(245,243,238,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: 18,
          letterSpacing: "-0.01em",
          color: "#F5F3EE",
        }}
      >
        <Image
          src="/logo.png"
          alt="CreatorOS"
          width={26}
          height={26}
          priority
          style={{
            borderRadius: 7,
            boxShadow: "0 0 18px rgba(245,166,35,0.4)",
            flexShrink: 0,
          }}
        />
        {/* Wordmark text drops below the breakpoint — the logo image gets
            alt="CreatorOS" above (was alt="") so the brand name is still
            present for screen readers even without the visible text. */}
        {!isNarrow && "CreatorOS"}
      </div>
      <div
        className="hidden sm:flex"
        style={{ gap: 32, fontSize: 14, color: "#9AA0AC" }}
      >
        {/* The 5-card scatter/converge sequence is what visitors actually
            mean by "the product" — the ring/tile pipeline section above it
            is more of a process illustration. */}
        <a
          href="#workspace-assembly-track"
          className="glow-text"
          onClick={(e) => handleAnchorClick(e, "workspace-assembly-track")}
        >
          Product
        </a>
        <a
          href="#features"
          className="glow-text"
          onClick={(e) => handleAnchorClick(e, "features")}
        >
          Features
        </a>
        <a
          href="#confidence"
          className="glow-text"
          onClick={(e) => handleAnchorClick(e, "confidence")}
        >
          How AI works here
        </a>
        <Link href="/channel-health" className="glow-text">
          Free Health Check
        </Link>
      </div>
      <div style={{ display: "flex", gap: isNarrow ? 6 : 10 }}>
        <Link
          href="/login"
          className="glow-interactive"
          style={{
            fontSize: 13,
            fontWeight: 600,
            padding: isNarrow ? "8px 12px" : "9px 18px",
            borderRadius: 8,
            border: "1px solid rgba(245,243,238,0.14)",
            color: "#F5F3EE",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="glow-interactive"
          style={{
            fontSize: 13,
            fontWeight: 600,
            padding: isNarrow ? "8px 12px" : "9px 18px",
            borderRadius: 8,
            background: "#F5A623",
            color: "#030304",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Sign up
        </Link>
      </div>
    </nav>
  );
}
