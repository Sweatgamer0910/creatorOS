import { create } from "zustand";

// Raw (undamped) scroll progress values shared across the landing page's
// WebGL canvas (PipelineScene, NovaMascot/useNovaPath) and any DOM
// consumers (WorkspaceAssembly). Kept raw here deliberately — each
// consumer damps toward these values in its own per-frame loop (useFrame
// for 3D, a rAF loop for DOM), rather than damping once globally, so a 3D
// scene's damping curve doesn't have to match a DOM section's. This is
// the same pattern already used by TiltCard's spring values and the old
// Hero3D CameraRig's per-frame lerp — nothing scroll-driven in this app
// snaps straight to a raw scroll read.
//
// - globalProgress: 0-1 across the whole document, drives NovaMascot's
//   single continuous path (hero -> pipeline stages -> assembly rest).
// - pipelineProgress: 0-1 local to just the #pipeline-track section,
//   drives the ring/camera/tile scene and stage-card active states.
// - assemblyProgress: 0-1 local to just the #workspace-assembly-track
//   section, drives the panel scatter/converge and text beats.
// Which side of a track the viewport currently sits on — lets a consumer
// (mainly useNovaPath) tell "haven't reached the pipeline section yet" apart
// from "scrolled exactly to its first frame," which trackProgress() alone
// can't distinguish (both read as progress 0).
export type TrackPhase = "before" | "during" | "after";

interface LandingScrollState {
  globalProgress: number;
  pipelineProgress: number;
  pipelinePhase: TrackPhase;
  assemblyProgress: number;
  assemblyPhase: TrackPhase;
  setProgress: (values: {
    globalProgress: number;
    pipelineProgress: number;
    pipelinePhase: TrackPhase;
    assemblyProgress: number;
    assemblyPhase: TrackPhase;
  }) => void;
}

export const useLandingScrollStore = create<LandingScrollState>((set) => ({
  globalProgress: 0,
  pipelineProgress: 0,
  pipelinePhase: "before",
  assemblyProgress: 0,
  assemblyPhase: "before",
  setProgress: (values) => set(values),
}));

export function trackPhase(el: Element | null): TrackPhase {
  if (!el) return "before";
  const rect = el.getBoundingClientRect();
  if (rect.top > 0) return "before";
  if (rect.bottom < 0) return "after";
  return "during";
}

export function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

// Progress of `el` scrolling through the viewport, 0 at the moment its top
// reaches the top of the viewport, 1 once its bottom has scrolled fully
// past — i.e. "how far through this section's own scroll range are we."
// Same formula the approved prototype uses for both its pipeline-track and
// assembly-track sections.
export function trackProgress(el: Element | null): number {
  if (!el) return 0;
  const rect = el.getBoundingClientRect();
  const total = rect.height - window.innerHeight;
  if (total <= 0) return 0;
  return clamp01(-rect.top / total);
}
