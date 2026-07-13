// CreatorOS Design Tokens
// Single source of truth for spacing, typography, and radius scales.
// Never use arbitrary values outside these scales in new components.

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
