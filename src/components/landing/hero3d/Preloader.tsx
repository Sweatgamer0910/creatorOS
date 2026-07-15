"use client";

import { useEffect, useRef, useState } from "react";

// The particle field builds its geometry procedurally and loads no external
// textures/models, so there's nothing for drei's useProgress()/loading
// manager to report — it would never reach 100 and the preloader would never
// resolve. The only real readiness signals here are canvas creation plus a
// small minimum-visible floor so it doesn't just flash once and disappear.
const MIN_VISIBLE_MS = 400;

export default function Preloader({
  canvasReady,
  reducedMotion,
}: {
  canvasReady: boolean;
  reducedMotion: boolean;
}) {
  const [minFloorPassed, setMinFloorPassed] = useState(false);
  const mountedAt = useRef<number | null>(null);

  useEffect(() => {
    if (mountedAt.current === null) mountedAt.current = Date.now();
    const elapsed = Date.now() - mountedAt.current;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
    const timer = setTimeout(() => setMinFloorPassed(true), remaining);
    return () => clearTimeout(timer);
  }, []);

  const isDone = canvasReady && minFloorPassed;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#050505",
        opacity: isDone ? 0 : 1,
        pointerEvents: isDone ? "none" : "auto",
        transition: reducedMotion
          ? "opacity 0.15s linear"
          : "opacity 0.6s ease",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.12)",
          borderTopColor: "var(--color-accent)",
          animation: reducedMotion ? "none" : "creatoros-spin 0.9s linear infinite",
        }}
      />
      <style>{`
        @keyframes creatoros-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
