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
  flat: {
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-border)",
  },
  glass: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
};
