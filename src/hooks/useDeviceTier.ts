"use client";

import { useSyncExternalStore } from "react";

export type DeviceTier = "unsupported" | "low" | "medium" | "high";

export interface TierBudget {
  tier: DeviceTier;
  particleCount: number;
  bloom: boolean;
  dprCap: number;
  /** False until the real probe has run once on the client. */
  isProbed: boolean;
}

const BUDGETS: Record<
  Exclude<DeviceTier, "unsupported">,
  Omit<TierBudget, "isProbed">
> = {
  low: { tier: "low", particleCount: 1800, bloom: false, dprCap: 1 },
  medium: { tier: "medium", particleCount: 5000, bloom: true, dprCap: 1.5 },
  high: { tier: "high", particleCount: 12000, bloom: true, dprCap: 2 },
};

function probeDeviceTier(): DeviceTier {
  if (typeof window === "undefined") return "medium";

  const canvas = document.createElement("canvas");
  const gl =
    (canvas.getContext("webgl2") as WebGL2RenderingContext | null) ||
    (canvas.getContext("webgl") as WebGLRenderingContext | null);

  if (!gl) return "unsupported";

  const isCoarsePointer = window.matchMedia?.("(pointer: coarse)").matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  // deviceMemory is Chromium-only; treat its absence as "unknown, assume mid-tier"
  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;

  let rendererHint = "";
  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
  if (debugInfo) {
    rendererHint = String(
      gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
    ).toLowerCase();
  }
  const looksLikeSoftwareRenderer =
    rendererHint.includes("swiftshader") || rendererHint.includes("llvmpipe");

  // This probe canvas is throwaway — never attached to the DOM, never
  // rendered again. Without explicitly releasing its WebGL context, it
  // sits alive until garbage collection gets around to it. Each Fast
  // Refresh reload re-runs this probe (the cached result lives in module
  // scope, which HMR resets), so repeated edits during development can
  // leak enough contexts to hit the browser's live-context ceiling —
  // forcing it to kill an older context out from under the hero canvas.
  gl.getExtension("WEBGL_lose_context")?.loseContext();

  if (looksLikeSoftwareRenderer) return "low";
  if (isCoarsePointer && (memory ?? 4) <= 4) return "low";
  if (isCoarsePointer) return "medium";
  if (cores <= 4 || (memory !== undefined && memory <= 4)) return "medium";

  return "high";
}

const SERVER_SNAPSHOT: TierBudget = {
  ...BUDGETS.medium,
  isProbed: false,
};

// The probe result never changes within a session, so it's cached in a
// module-level snapshot — useSyncExternalStore requires getSnapshot to
// return a referentially stable value when nothing has changed.
let cachedSnapshot: TierBudget | null = null;

function subscribe() {
  return () => {};
}

function getSnapshot(): TierBudget {
  if (!cachedSnapshot) {
    const tier = probeDeviceTier();
    cachedSnapshot =
      tier === "unsupported"
        ? { tier: "unsupported", particleCount: 0, bloom: false, dprCap: 1, isProbed: true }
        : { ...BUDGETS[tier], isProbed: true };
  }
  return cachedSnapshot;
}

function getServerSnapshot(): TierBudget {
  return SERVER_SNAPSHOT;
}

export function useDeviceTier(): TierBudget {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
