"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useLandingScrollStore } from "@/lib/landing-scroll-store";
import NovaMascot from "./NovaMascot";
import { MODEL_HALF_WIDTH, MODEL_HALF_HEIGHT, MODEL_HALF_DEPTH } from "./novaGeometry";

const STAGE_COUNT = 6;
const DAMPING = 0.06; // same per-frame lerp factor the old Hero3D CameraRig used

// She reads as a mascot cameo, not a second hero object — smaller than her
// original 1:1 scale, which (see below) was large enough at her original
// close camera-following distance to overlap the tile and stage cards.
const BASE_SCALE = 0.65;

// --- Nova/tile clearance math ---
// First attempt at this fix only checked *world-space distance* between
// Nova and the tile and missed a more basic constraint: whether the
// resulting offset even stays inside the camera's view frustum. At a
// close camera-following depth, the frustum's cross-section is narrow, so
// an X offset picked purely to "clear the tile" can land at or past the
// edge of frame — which is a worse problem than the overlap it was
// trying to fix. This time depth is pushed back and the safe-X ceiling is
// computed from the actual camera FOV/aspect at runtime (frustumHalfWidth
// below) rather than eyeballed, so it can't silently drift back off-frame
// on some other aspect ratio.
const CAMERA_VFOV_DEG = 55; // must match LandingScene's <Canvas camera={{ fov: 55 }}>
const TILE_RADIUS = 1.22; // tile is ~1.5×1.9×0.22, this is its half-diagonal (rotates continuously, so worst-case radius from origin, not a face measurement)
// Nova's own half-diagonal, from her real rendered dimensions (novaGeometry
// scaled by this controller's own BASE_SCALE) rather than a hand-copied
// number — she used to be a primitive body with a different (smaller)
// footprint; this is what silently broke the previous clearance fix when
// the model was swapped to a real GLB without updating this file too.
const NOVA_HALF_WIDTH = MODEL_HALF_WIDTH * BASE_SCALE;
const NOVA_HALF_HEIGHT = MODEL_HALF_HEIGHT * BASE_SCALE;
const NOVA_HALF_DEPTH = MODEL_HALF_DEPTH * BASE_SCALE;
const NOVA_RADIUS = Math.sqrt(
  NOVA_HALF_WIDTH ** 2 + NOVA_HALF_HEIGHT ** 2 + NOVA_HALF_DEPTH ** 2,
);
const MIN_CLEARANCE = TILE_RADIUS + NOVA_RADIUS + 0.35; // + margin

// Visible half-width of the frustum at a given depth from camera, derived
// from the actual vertical FOV + current aspect (horizontal FOV isn't set
// directly — R3F derives it from vertical FOV × aspect).
function frustumHalfWidth(depth: number, aspect: number) {
  const vFovRad = THREE.MathUtils.degToRad(CAMERA_VFOV_DEG);
  const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * aspect);
  return depth * Math.tan(hFovRad / 2);
}

// Depth chosen so that, even at a conservative near-square aspect (~1:1,
// roughly what an 900px-wide browser window looks like — narrower than
// that and the whole 3D scene is disabled below the 760px breakpoint
// anyway), 80% of the frustum's half-width at this depth still clears
// MIN_CLEARANCE with real margin, not just barely:
//   frustumHalfWidth(5.4, 1) ≈ 2.81 → 80% ≈ 2.25 (the ceiling DESIRED_LATERAL
//   must stay under)
//   sqrt(2.2² + 0.35²) ≈ 2.23 > MIN_CLEARANCE (1.22 + NOVA_RADIUS + 0.35,
//   NOVA_RADIUS now computed from her real GLB dimensions above ≈ 0.50,
//   so MIN_CLEARANCE ≈ 2.07 — this resting case only carries ~8% margin on
//   its own, which is fine: it's the CROSSING_Y_BULGE below, not this
//   resting offset, that does the real work near the tile)
const PIPELINE_DEPTH = -5.4;
const DESIRED_LATERAL = 2.2;
const LATERAL_Y = -0.35;
const FRUSTUM_SAFETY = 0.8; // stay within 80% of the frustum edge, not grazing it

const HERO_OFFSET = new THREE.Vector3(DESIRED_LATERAL, -0.6, PIPELINE_DEPTH);
const HERO_ROTATION = -0.35;

// One offset per pipeline stage, alternating sides — even stage indices
// (stages 1, 3, 5) mirror the prototype's default card-on-left layout, so
// Nova sits on the right; odd indices (stages 2, 4, 6) mirror the
// nth-child(even) card-on-right layout, so she moves to the left.
const PIPELINE_OFFSETS: THREE.Vector3[] = Array.from(
  { length: STAGE_COUNT },
  (_, i) =>
    new THREE.Vector3(
      i % 2 === 0 ? DESIRED_LATERAL : -DESIRED_LATERAL,
      LATERAL_Y,
      PIPELINE_DEPTH,
    ),
);
const PIPELINE_ROTATIONS = PIPELINE_OFFSETS.map((_, i) =>
  i % 2 === 0 ? -0.4 : 0.4,
);

// PIPELINE_OFFSETS alternates sign every stage (+DESIRED_LATERAL,
// -DESIRED_LATERAL, ...), so the linear lerp between consecutive stage
// waypoints necessarily passes through X=0 at the midpoint of every
// transition — right where the tile sits (world origin). No resting-offset
// tuning fixes that; the crossing itself needs its own detour.
//
// First cut at this tied the detour to the stage-transition's own localT
// (bulge peaking at localT=0.5). That turned out to be the wrong signal:
// the *actual* danger moment is whenever Nova's world Z happens to line up
// with the tile's (world z=0) — which for the first transition lands at
// progress≈7.7%, not the transition's geometric midpoint (progress=10%
// there), and X isn't necessarily near 0 at that exact instant either. The
// two near-misses were close enough to produce a visible dip in clearance
// but not aligned enough for a localT-keyed bulge to fully cover it.
//
// Keyed to actual world-Z distance from the tile instead — self-correcting
// regardless of which stage transition is active — and sized to clear
// MIN_CLEARANCE from Y alone (i.e. even in the worst case where X also
// happens to be 0 at the same instant, not relying on X to help):
//   at zDiff=0: bulge=CROSSING_Y_BULGE, need (LATERAL_Y + bulge) > MIN_CLEARANCE
//   at intermediate zDiff, need sqrt((LATERAL_Y+bulge)² + zDiff²) > MIN_CLEARANCE
// Checked numerically across zDiff 0→SAFE_Z_RANGE in ~0.25 steps; a linear
// falloff has a dip around the midpoint (bulge and zDiff both moderate,
// their quadrature sum dips below threshold), so both constants carry real
// margin rather than just clearing the zDiff=0 case.
const CROSSING_Y_BULGE = 3.5;
const SAFE_Z_RANGE = 3.5;

// Matches the prototype's assembly-section path: rolls in from off-screen
// left, travels across, and settles beside the last-resolved panel
// (Channel Health — the workspace's "everything is now assembled" beat).
const ASSEMBLY_START_OFFSET = new THREE.Vector3(-3.4, -1.2, -2.4);
const ASSEMBLY_END_OFFSET = new THREE.Vector3(2.3, -0.9, -2.2);
const ASSEMBLY_RANGE: [number, number] = [0.1, 0.92];

const ENTRANCE_START_OFFSET = new THREE.Vector3(1.7, 5.5, -2.6);
const ENTRANCE_DURATION = 1.3; // seconds

function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/**
 * Owns Nova's single continuous path across the whole landing page: a
 * mount-triggered entrance flight into the hero resting spot, then a
 * per-frame damped follow of a scroll-driven target computed from the
 * shared landing-scroll-store. Renders NovaMascot — all the actual
 * geometry/materials live there, this component only ever hands it a
 * position + rotation.
 */
export default function NovaController({
  reducedMotion,
}: {
  reducedMotion: boolean;
}) {
  const { camera, size } = useThree();
  const currentPos = useRef(new THREE.Vector3().addVectors(camera.position, HERO_OFFSET));
  const currentRotation = useRef(HERO_ROTATION);
  const currentScale = useRef(reducedMotion ? 0.01 : BASE_SCALE);
  const currentVisible = useRef(true);
  const elapsedRef = useRef(0);
  const entranceDoneRef = useRef(false);
  const targetOffset = useRef(new THREE.Vector3());

  useFrame((_state, delta) => {
    elapsedRef.current += delta;

    // --- Entrance: only runs once, before any scroll-driven behavior.
    // Reduced motion skips the flight (no travel, no rotation) but still
    // gets a brief scale-in rather than an instant hard pop — a plain
    // opacity/scale fade isn't the kind of motion prefers-reduced-motion
    // is meant to suppress. ---
    if (!entranceDoneRef.current) {
      const duration = reducedMotion ? 0.3 : ENTRANCE_DURATION;
      const t = Math.min(elapsedRef.current / duration, 1);

      if (reducedMotion) {
        currentPos.current.copy(camera.position).add(HERO_OFFSET);
        currentRotation.current = HERO_ROTATION;
        currentScale.current = t;
      } else {
        const eased = easeOutBack(t);
        const flightOffset = new THREE.Vector3().lerpVectors(
          ENTRANCE_START_OFFSET,
          HERO_OFFSET,
          eased,
        );
        currentPos.current.copy(camera.position).add(flightOffset);
        currentRotation.current = HERO_ROTATION;
        currentScale.current = BASE_SCALE;
      }

      if (t >= 1) entranceDoneRef.current = true;
      return;
    }

    // --- Scroll-driven target, resolved from the store's current phase ---
    const { pipelinePhase, pipelineProgress, assemblyPhase, assemblyProgress } =
      useLandingScrollStore.getState();

    let targetRotation = HERO_ROTATION;

    if (pipelinePhase === "before") {
      targetOffset.current.copy(HERO_OFFSET);
      targetRotation = HERO_ROTATION;
    } else if (pipelinePhase === "during") {
      const stagePos = pipelineProgress * (STAGE_COUNT - 1);
      const index = Math.min(Math.floor(stagePos), STAGE_COUNT - 2);
      const localT = stagePos - index;
      targetOffset.current.lerpVectors(
        PIPELINE_OFFSETS[index],
        PIPELINE_OFFSETS[index + 1],
        localT,
      );
      targetRotation =
        PIPELINE_ROTATIONS[index] +
        (PIPELINE_ROTATIONS[index + 1] - PIPELINE_ROTATIONS[index]) * localT;
    } else if (assemblyPhase === "before") {
      // Pipeline finished, assembly not yet reached — hold at the last
      // pipeline offset (camera itself is also holding here).
      targetOffset.current.copy(PIPELINE_OFFSETS[STAGE_COUNT - 1]);
      targetRotation = PIPELINE_ROTATIONS[STAGE_COUNT - 1];
    } else if (assemblyPhase === "during") {
      const t = Math.min(
        Math.max(
          (assemblyProgress - ASSEMBLY_RANGE[0]) /
            (ASSEMBLY_RANGE[1] - ASSEMBLY_RANGE[0]),
          0,
        ),
        1,
      );
      targetOffset.current.lerpVectors(ASSEMBLY_START_OFFSET, ASSEMBLY_END_OFFSET, t);
      targetRotation = -0.2 + t * 0.2;
    } else {
      // assemblyPhase === "after" — her path ends here.
      targetOffset.current.copy(ASSEMBLY_END_OFFSET);
      targetRotation = 0;
    }

    // Hides for the rest of the page once assembly is fully behind us —
    // same reasoning as PipelineScene's own visibility toggle: without
    // this she'd float, camera-locked, over the manifesto/feature-grid/
    // confidence/CTA sections for the remainder of a very long page,
    // which reads as a stray object rather than a mascot with a defined
    // path. Her path was only ever specified to end at the assembly rest
    // spot, not to continue indefinitely.
    currentVisible.current = assemblyPhase !== "after";

    // Arcs her up through Y whenever her world Z is actually close to the
    // tile's (world z=0) — see CROSSING_Y_BULGE/SAFE_Z_RANGE derivation
    // above. Computed from real position, not transition timing, so it's
    // naturally inert (zDanger→0) everywhere the tile isn't actually
    // nearby, including the whole assembly/manifesto/etc. tail of the page.
    const novaWorldZ = camera.position.z + targetOffset.current.z;
    const zDanger = THREE.MathUtils.clamp(
      1 - Math.abs(novaWorldZ) / SAFE_Z_RANGE,
      0,
      1,
    );
    targetOffset.current.y += zDanger * CROSSING_Y_BULGE;

    // Hard safety clamp: whatever the lateral offset math above landed on,
    // never let it exceed what's actually still inside the frustum at the
    // current depth + aspect. This is what actually prevents her from
    // drifting off-frame on a narrower/more-square viewport (the thing the
    // old width-based multiplier was trying, and failing, to do — it
    // scaled the offset *up* on narrow aspects instead of checking it was
    // still on-screen at all).
    const depth = Math.abs(targetOffset.current.z);
    const maxX = frustumHalfWidth(depth, size.width / size.height) * FRUSTUM_SAFETY;
    targetOffset.current.x = THREE.MathUtils.clamp(targetOffset.current.x, -maxX, maxX);

    const targetPos = new THREE.Vector3().addVectors(camera.position, targetOffset.current);

    if (process.env.NODE_ENV === "development" && pipelinePhase === "during") {
      // Turns the MIN_CLEARANCE derivation above from a comment someone
      // could invalidate by tweaking a constant into a guard that actually
      // catches it — checks live distance from Nova's target position to
      // the tile at world origin against the same threshold the offsets
      // were sized to clear.
      const distanceToTile = targetPos.length();
      if (distanceToTile < MIN_CLEARANCE) {
        console.warn(
          `[NovaController] clearance from tile is ${distanceToTile.toFixed(2)}, below the ${MIN_CLEARANCE.toFixed(2)} minimum — Nova and the tile may visually overlap at this scroll position.`,
        );
      }
    }

    if (reducedMotion) {
      // No damped travel, no continuous rolling — snap straight to
      // wherever she belongs for the current section.
      currentPos.current.copy(targetPos);
      currentRotation.current = targetRotation;
    } else {
      currentPos.current.lerp(targetPos, DAMPING);
      currentRotation.current +=
        (targetRotation - currentRotation.current) * DAMPING;
    }
  });

  return (
    <NovaMascot
      positionRef={currentPos}
      rotationRef={currentRotation}
      scaleRef={currentScale}
      visibleRef={currentVisible}
      animate={!reducedMotion}
    />
  );
}
