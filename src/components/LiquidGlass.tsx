"use client";

import { glass } from "@/lib/design-tokens";

// Reusable Liquid Glass material wrapper — see the `glass` token block in
// design-tokens.ts for the full rationale. Three stacked layers, same
// structure most CSS recreations of Apple's material use (main element for
// layout, a blurred/tinted backdrop layer, and a sheen layer for the
// specular highlight):
//   1. This element itself — layout only, participates in normal flow.
//   2. `::backdrop` layer (a real element, not a pseudo-element, so it
//      works via inline styles) — the heavy blur/saturate + tint + the
//      inset highlight that reads as a glass edge catching light.
//   3. Sheen layer — a soft diagonal gradient in `overlay` blend mode, the
//      part that makes it read as glass rather than just "blurry dark
//      panel." Pointer-events none, purely decorative.
// Content renders in a fourth, un-styled layer on top so children never
// need to know this wrapper exists.
export default function LiquidGlass({
  children,
  radius = 20,
  hover = false,
  className,
  style,
}: {
  children: React.ReactNode;
  radius?: number;
  /** Use the slightly brighter/denser hover tint (e.g. for a pressed or
   *  active state) instead of the resting tint. */
  hover?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        borderRadius: radius,
        isolation: "isolate",
        ...style,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          backdropFilter: glass.backdrop,
          WebkitBackdropFilter: glass.backdrop,
          backgroundColor: hover ? glass.surfaceHover : glass.surface,
          boxShadow: `inset 0 1px 0 ${glass.borderTop}, inset 0 -1px 0 ${glass.borderBottom}, ${glass.shadow}`,
          zIndex: 0,
          transition: "background-color 0.2s ease",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          background: glass.sheen,
          mixBlendMode: "overlay",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <div style={{ position: "relative", zIndex: 2, height: "100%" }}>
        {children}
      </div>
    </div>
  );
}
