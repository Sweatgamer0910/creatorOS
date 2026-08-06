// CreatorOS Design Tokens
// Single source of truth for spacing, typography, and radius scales.
// Never use arbitrary values outside these scales in new components.

import type { CSSProperties } from "react";

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  "2xl": 40,
  "3xl": 48,
  "4xl": 64,
  "5xl": 80,
  "6xl": 96,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  full: 999,
} as const;

export const typeScale = {
  display: {
    fontSize: "clamp(40px, 6vw, 68px)",
    lineHeight: 1.1,
    fontWeight: 700,
  },
  h1: { fontSize: 32, lineHeight: 1.2, fontWeight: 700 },
  h2: { fontSize: 24, lineHeight: 1.25, fontWeight: 600 },
  h3: { fontSize: 18, lineHeight: 1.3, fontWeight: 600 },
  bodyLarge: { fontSize: 18, lineHeight: 1.6, fontWeight: 400 },
  body: { fontSize: 14, lineHeight: 1.6, fontWeight: 400 },
  caption: { fontSize: 13, lineHeight: 1.5, fontWeight: 400 },
  muted: { fontSize: 12, lineHeight: 1.5, fontWeight: 400 },
} as const;

export const motion = {
  fast: 0.15,
  base: 0.2,
  slow: 0.25,
} as const;

// Cubic-bezier curves shared with the Remotion motion-graphics kit
// (creatoros-motion-kit/src/theme.ts) so in-app/landing-page motion and
// marketing-video motion read as the same product. premiumOut is the
// general-purpose deceleration curve for content settling into place;
// overshoot adds a small bounce past the resting value before settling
// back — used sparingly, for elements that should feel like they "land"
// (e.g. a CTA button on entrance), not for anything that repeats or
// loops; soft is a gentler symmetric ease for ambient/background motion.
export const easing = {
  premiumOut: [0.16, 1, 0.3, 1],
  overshoot: [0.34, 1.56, 0.64, 1],
  soft: [0.25, 0.1, 0.25, 1],
} as const;

// The two card surface treatments (Card.tsx's `variant`, and GlassPanel,
// which reuses `flat` without rendering Card itself). Lives here — a plain
// module with no "use client" — rather than in Card.tsx itself: Card.tsx
// IS a Client Component (it has onClick/onKeyDown), and a Server Component
// importing a named non-component export from a "use client" module gets
// a client-reference stub instead of the real value in Next's RSC bundler,
// not the plain object. That silently produced `undefined` wherever a
// Server Component (like GlassPanel, and the page.tsx that renders it)
// tried to read `cardSurfaceStyle.flat` — the object spread of `undefined`
// is a silent no-op, so the card rendered with none of its background/
// border styling and no error anywhere. Plain data modules don't have
// this problem in either direction.
export const cardSurfaceStyle: Record<"flat" | "glass", CSSProperties> = {
  // Not a flat fill anymore — a very subtle top-to-bottom gradient plus an
  // inset top highlight, the same "catches light at the edge" cue the
  // Liquid Glass material uses, just without the blur (these sit over a
  // solid page background, not other content, so there's nothing to
  // refract). The read this is going for: a card looks like a distinct
  // physical surface with a top edge facing the light, not a rectangle of
  // flat color — the difference is subtle at a glance and exactly the kind
  // of detail that makes native Apple UI feel like it was milled rather
  // than drawn.
  flat: {
    backgroundImage:
      "linear-gradient(180deg, var(--color-surface-hover) 0%, var(--color-surface) 100%)",
    border: "1px solid var(--color-border)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
  },
  glass: {
    backgroundColor: "rgba(18, 20, 25, 0.58)",
    backdropFilter: "blur(28px) saturate(190%)",
    WebkitBackdropFilter: "blur(28px) saturate(190%)",
    border: "1px solid rgba(255, 255, 255, 0.10)",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(255,255,255,0.04), 0 24px 60px -16px rgba(0,0,0,0.55)",
  },
};

// Liquid Glass — the floating-chrome material used for nav, modals,
// popovers, and tooltips across the app, modeled on Apple's iOS 26/macOS
// Tahoe "Liquid Glass" material (WWDC 2025): a translucent surface that
// catches light at its edges rather than a flat frosted panel, and on
// Linear's own 2026 adaptation of it for a floating tab bar (semi-
// transparent, reacts to what's behind it, active state reads as a glass
// capsule rather than a flat fill). True optical refraction (SVG
// feDisplacementMap warping the backdrop) is Chrome-only today and too
// expensive to keep animated at 60fps in something that moves with the
// mouse every frame (the nav's magnification dock), so this fakes the same
// *read* with plain CSS that works everywhere: heavy blur+saturate,
// asymmetric inset highlight (bright top edge / soft bottom edge, like
// light catching a curved glass rim), and a faint diagonal sheen layer.
// See components/LiquidGlass.tsx for the reusable layered wrapper that
// applies these.
export const glass = {
  backdrop: "blur(28px) saturate(190%)",
  surface: "rgba(18, 20, 25, 0.58)",
  surfaceHover: "rgba(26, 29, 36, 0.68)",
  borderTop: "rgba(255,255,255,0.16)",
  borderBottom: "rgba(255,255,255,0.04)",
  sheen:
    "linear-gradient(128deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.02) 24%, rgba(255,255,255,0) 45%)",
  shadow: "0 24px 60px -16px rgba(0,0,0,0.55), 0 2px 10px -2px rgba(0,0,0,0.35)",
} as const;
