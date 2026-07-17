"use client";

import { useSyncExternalStore } from "react";

// Same breakpoint the approved landing prototype uses to fall back to a
// static, non-3D layout (mobile-fallback CSS in creatoros-landing.html).
const QUERY = "(max-width: 760px)";

function subscribe(callback: () => void) {
  const mediaQueryList = window.matchMedia(QUERY);
  mediaQueryList.addEventListener("change", callback);
  return () => mediaQueryList.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function useIsNarrowViewport() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
