"use client";

import { useEffect, useState } from "react";

// Mirrors the exact capability check three.js's WebGLRenderer makes
// internally. If this returns false, mounting <Canvas> would otherwise
// throw "THREE.WebGLRenderer: Error creating WebGL context" — seen live in
// production (Sentry JAVASCRIPT-NEXTJS-2: 51 events in the first 21 hours,
// unhandled, no fallback existed before this hook). WebGL can be
// unavailable for reasons that have nothing to do with device age — GPU
// driver crashes, WebGL disabled via browser flags/extensions, some
// remote-desktop and virtualized environments, and locked-down corporate
// machines all hit this in the wild.
function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

/**
 * Client-only WebGL capability check, same SSR-safe shape as
 * useIsNarrowViewport: defaults to `true` (render the real scene) until the
 * check runs on mount, so the vast majority of visitors who do support
 * WebGL never see a flash of the fallback. Only covers context-creation
 * failure, not context loss after a successful creation (a rarer, separate
 * failure mode — GPU reset mid-session — not addressed here).
 */
export function useWebGLSupported() {
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(supportsWebGL());
  }, []);

  return supported;
}
