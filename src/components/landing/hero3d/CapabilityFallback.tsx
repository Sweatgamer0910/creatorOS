"use client";

// Static/lightweight fallback for devices that fail the WebGL capability
// probe — a CSS-only glow, no Canvas ever mounted, so we never pay for a
// WebGL context init just to tear it down.
export default function CapabilityFallback({
  reducedMotion,
}: {
  reducedMotion: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "min(60vw, 520px)",
          height: "min(60vw, 520px)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(245,166,35,0.35) 0%, rgba(45,212,191,0.12) 45%, transparent 70%)",
          filter: "blur(40px)",
          animation: reducedMotion
            ? "none"
            : "creatoros-fallback-pulse 6s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes creatoros-fallback-pulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.08); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
