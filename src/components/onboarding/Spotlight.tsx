import type { Rect } from "@/lib/onboarding/positioning";

const PADDING = 8;

// A single div sized to the target rect (plus padding), dimming everything
// else in one paint via a giant box-shadow spread — cheaper and simpler
// than an SVG mask, and well-supported. Purely visual and non-interactive
// (pointer-events: none) — the real page underneath stays fully usable
// during the tour (hover, click, navigate) rather than being gated behind
// a blocker, so the tour reads as a guide, not a modal.
export default function Spotlight({ rect }: { rect: Rect }) {
  return (
    <div
      style={{
        position: "fixed",
        top: rect.top - PADDING,
        left: rect.left - PADDING,
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
        borderRadius: 16,
        pointerEvents: "none",
        zIndex: 301,
        transition:
          "top 0.3s ease, left 0.3s ease, width 0.3s ease, height 0.3s ease",
        boxShadow: [
          "0 0 0 9999px rgba(3,3,4,0.82)",
          "0 0 0 2px rgba(255,255,255,0.85)",
          "0 0 32px 6px rgba(var(--glow-amber-rgb), 0.55)",
        ].join(", "),
      }}
    />
  );
}
