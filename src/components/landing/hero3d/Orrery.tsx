"use client";

import { RefObject, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { MotionValue } from "framer-motion";
import * as THREE from "three";
import { SkeletonUtils, type GLTF } from "three-stdlib";

type ActionName = "Neptune 1 Min Orbit" | "Earth 1 Min Orbit";

interface GLTFAction extends THREE.AnimationClip {
  name: ActionName;
}

type GLTFResult = GLTF & {
  animations: GLTFAction[];
};

const MODEL_URL = "/models/hero-object-transformed.glb";

// Both clips drive every planet bone's rotation (and some scale) — they're
// two different orbital-speed presets baked into the source model, not
// separate per-planet animations. "Earth 1 Min Orbit" is used here: Earth
// completing one lap in the clip's duration reads as a natural pace at hero
// scale, and ties thematically to Earth being the channel's "home."
const CLIP_NAME: ActionName = "Earth 1 Min Orbit";

// Real bone names in the source rig — verified directly against the glb,
// not assumed. Each has a "_end_0XX" child bone (an FBX end-effector marker
// with no geometry) that we don't need to reference.
export const PLANET_BONES = {
  mercury: "Mercury_08",
  venus: "Venus_07",
  earth: "Earth_06",
  mars: "Mars_05",
  jupiter: "Jupiter_04",
  saturn: "Saturn_03",
  uranus: "Uranus_02",
  neptune: "Neptune_01",
} as const;

export interface PlanetAnchor {
  skinnedMesh: THREE.SkinnedMesh;
  vertexIndices: number[];
}

const anchorSample = new THREE.Vector3();

// Shared by PlanetLabels (UI anchoring) and Scene's CameraRig (camera
// targeting) — averages the live skinned position of an anchor's sample
// vertices into world space. Both need "where is this planet right now,"
// not the bone's own transform (see the pivot-vs-sphere note above).
export function getAnchorWorldPosition(
  anchor: PlanetAnchor,
  target: THREE.Vector3,
): THREE.Vector3 {
  target.set(0, 0, 0);
  for (const vertexIndex of anchor.vertexIndices) {
    anchor.skinnedMesh.getVertexPosition(vertexIndex, anchorSample);
    target.add(anchorSample);
  }
  target.divideScalar(anchor.vertexIndices.length);
  anchor.skinnedMesh.localToWorld(target);
  return target;
}

const SUN_BONE_NAME = "Sun_09";
// Bones whose skinned geometry should stay visible — every planet plus the
// sun. Everything else (the stand's base disc, the telescoping column, and
// the thin connecting arms — all weighted primarily to each bone near its
// own pivot) gets cut out of the mesh entirely, not just hidden.
const SPHERE_BONE_NAMES: string[] = [
  ...Object.values(PLANET_BONES),
  SUN_BONE_NAME,
];

// Vertices weighted to a given bone span the whole arm/pole (near the
// pivot) through to the sphere at the tip — same bone weighting throughout,
// so keeping "any weighted vertex" keeps the arm too. A pure distance-from-
// pivot cutoff doesn't cleanly separate them either: a thin connecting rod
// often runs right up to (or through) the sphere, so its tip vertices sit
// at nearly the same pivot-distance as the sphere's own surface.
//
// What actually distinguishes them is *density*: a tessellated sphere
// packs many vertices into a small volume, while a thin pole/arm has few
// vertices spread along a line. For each bone's candidate vertices, find
// each one's distance to its nearest neighbor, use the median of those as
// a local "unit spacing," then keep only vertices with several *other*
// candidates within a few units of that spacing — a density filter, not a
// position filter.
//
// This mesh was meshopt-simplified (see the gltfjsx --transform step
// below), and simplification wasn't uniform — the sun kept a lot of detail,
// the smaller planets got reduced much harder. A threshold tight enough to
// fully exclude a thin rod cuts into the smaller planets' sparser spheres
// before it finishes excluding the rod; a threshold loose enough to keep
// every planet's sphere intact leaves a thin rod remnant under each one.
// Chose the latter deliberately — a stray thin line is a much smaller
// defect than a missing planet, and there's no single threshold that
// avoids both given how differently each bone's geometry was simplified.
const DENSITY_RADIUS_MULTIPLIER = 4;
const DENSITY_MIN_NEIGHBORS = 6;

function classifyByDensity(positions: THREE.Vector3[]): boolean[] {
  const n = positions.length;
  const keep = new Array<boolean>(n).fill(false);
  if (n < DENSITY_MIN_NEIGHBORS + 1) return keep;

  const nearestDist = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let best = Infinity;
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const d = positions[i].distanceToSquared(positions[j]);
      if (d < best) best = d;
    }
    nearestDist[i] = Math.sqrt(best);
  }

  const sorted = Array.from(nearestDist).sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const radius = median * DENSITY_RADIUS_MULTIPLIER;
  const radiusSq = radius * radius;

  for (let i = 0; i < n; i++) {
    let neighbors = 0;
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      if (positions[i].distanceToSquared(positions[j]) <= radiusSq) {
        neighbors++;
        if (neighbors >= DENSITY_MIN_NEIGHBORS) break;
      }
    }
    keep[i] = neighbors >= DENSITY_MIN_NEIGHBORS;
  }

  return keep;
}

// Rebuilds the mesh's triangle index to drop every triangle touching the
// stand/arms, keeping only the planet + sun spheres. Runs once, off the
// pose active when the effect fires (bind pose) — safe, since the density
// classification only depends on relative vertex spacing, not on which way
// the bone is currently rotated.
function buildSphereOnlyGeometry(
  mesh: THREE.SkinnedMesh,
): THREE.BufferGeometry | null {
  const geometry = mesh.geometry;
  const skinIndex = geometry.attributes.skinIndex;
  const skinWeight = geometry.attributes.skinWeight;
  const index = geometry.index;
  if (!skinIndex || !skinWeight || !index) return null;

  const keepBoneIndices = new Set<number>();
  for (const name of SPHERE_BONE_NAMES) {
    const bone = mesh.skeleton.getBoneByName(name);
    if (!bone) continue;
    const boneIndex = mesh.skeleton.bones.indexOf(bone);
    if (boneIndex !== -1) keepBoneIndices.add(boneIndex);
  }

  // Pass 1: primary bone per vertex, grouped into per-bone vertex lists.
  const vertexCount = geometry.attributes.position.count;
  const primaryBone = new Int32Array(vertexCount).fill(-1);
  const verticesByBone = new Map<number, number[]>();
  const positionsByBone = new Map<number, THREE.Vector3[]>();

  for (let i = 0; i < vertexCount; i++) {
    let bestSlot = 0;
    let bestWeight = -1;
    for (let slot = 0; slot < 4; slot++) {
      const w = skinWeight.getComponent(i, slot);
      if (w > bestWeight) {
        bestWeight = w;
        bestSlot = slot;
      }
    }
    const boneIndex = skinIndex.getComponent(i, bestSlot);
    if (!keepBoneIndices.has(boneIndex)) continue;

    const worldPos = new THREE.Vector3();
    mesh.getVertexPosition(i, worldPos);
    mesh.localToWorld(worldPos);

    primaryBone[i] = boneIndex;
    if (!verticesByBone.has(boneIndex)) {
      verticesByBone.set(boneIndex, []);
      positionsByBone.set(boneIndex, []);
    }
    verticesByBone.get(boneIndex)!.push(i);
    positionsByBone.get(boneIndex)!.push(worldPos);
  }

  // Pass 2: density-classify each bone's candidates independently.
  const isSphere = new Uint8Array(vertexCount);
  for (const [boneIndex, vertexIndices] of verticesByBone) {
    const positions = positionsByBone.get(boneIndex)!;
    const keep = classifyByDensity(positions);
    for (let k = 0; k < vertexIndices.length; k++) {
      if (keep[k]) isSphere[vertexIndices[k]] = 1;
    }
  }

  // Pass 3: keep triangles whose vertices are all sphere vertices.
  const keptIndices: number[] = [];
  for (let t = 0; t < index.count; t += 3) {
    const a = index.getX(t);
    const b = index.getX(t + 1);
    const c = index.getX(t + 2);
    if (isSphere[a] && isSphere[b] && isSphere[c]) {
      keptIndices.push(a, b, c);
    }
  }
  if (keptIndices.length === 0) return null;

  const filtered = geometry.clone();
  filtered.setIndex(keptIndices);
  return filtered;
}

// The named planet bones are rotation pivots near the rig's base, not the
// planet's visual position — the arm's outward reach is baked into the
// skinned mesh geometry, rotating around that pivot. Verified at runtime:
// every planet bone's getWorldPosition() resolves to nearly the same point
// near the base. To anchor a label at the actual planet, find vertices the
// mesh's skin weights bind primarily to that bone, then keep only the ones
// *farthest* from the bone's own origin — the arm's whole length shares the
// same bone weighting, so an unweighted sample lands mid-arm; the farthest
// points are the planet sphere at the tip. Distance-from-pivot is rotation-
// invariant, so it's safe to rank at whatever pose is active when this runs.
function findAnchorVertices(
  mesh: THREE.SkinnedMesh,
  bone: THREE.Object3D,
  boneIndex: number,
  maxSamples: number,
): number[] {
  const skinIndex = mesh.geometry.attributes.skinIndex;
  const skinWeight = mesh.geometry.attributes.skinWeight;
  if (!skinIndex || !skinWeight) return [];

  const matches: number[] = [];
  for (let i = 0; i < skinIndex.count; i++) {
    for (let slot = 0; slot < 4; slot++) {
      const idx = skinIndex.getComponent(i, slot);
      const weight = skinWeight.getComponent(i, slot);
      if (idx === boneIndex && weight > 0.9) {
        matches.push(i);
        break;
      }
    }
  }
  if (matches.length === 0) return [];

  const boneWorldPos = new THREE.Vector3();
  bone.getWorldPosition(boneWorldPos);

  const sample = new THREE.Vector3();
  const ranked = matches
    .map((vertexIndex) => {
      mesh.getVertexPosition(vertexIndex, sample);
      mesh.localToWorld(sample);
      return { vertexIndex, distance: sample.distanceTo(boneWorldPos) };
    })
    .sort((a, b) => b.distance - a.distance);

  return ranked.slice(0, maxSamples).map((r) => r.vertexIndex);
}

export default function Orrery({
  scrollProgress,
  reducedMotion,
  isVisibleRef,
  onAnchorsReady,
}: {
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
  isVisibleRef: RefObject<boolean>;
  onAnchorsReady?: (
    anchors: Partial<Record<keyof typeof PLANET_BONES, PlanetAnchor>>,
  ) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const actionRef = useRef<THREE.AnimationAction | null>(null);
  const { scene, animations } = useGLTF(MODEL_URL) as unknown as GLTFResult;

  // useGLTF caches and reuses the same scene graph across mounts — clone so
  // remounting the hero (e.g. HMR, or reduced-motion toggling elsewhere)
  // never shares mutated bone transforms with a stale instance.
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { actions } = useAnimations(animations, groupRef);

  useEffect(() => {
    const action = actions[CLIP_NAME];
    if (!action) return;
    actionRef.current = action;
    actionRef.current.reset().play();
    actionRef.current.paused = true;
    return () => {
      actionRef.current?.stop();
      actionRef.current = null;
    };
  }, [actions]);

  useEffect(() => {
    let skinnedMesh: THREE.SkinnedMesh | null = null;
    clone.traverse((obj) => {
      if (!skinnedMesh && (obj as THREE.SkinnedMesh).isSkinnedMesh) {
        skinnedMesh = obj as THREE.SkinnedMesh;
      }
    });
    if (!skinnedMesh) return;
    const mesh: THREE.SkinnedMesh = skinnedMesh;

    // Force matrices current before ranking — this effect can run before
    // the first R3F frame, when matrixWorld may still be stale/identity.
    clone.updateMatrixWorld(true);

    const filteredGeometry = buildSphereOnlyGeometry(mesh);
    if (filteredGeometry) {
      mesh.geometry = filteredGeometry;
    }

    if (!onAnchorsReady) return;
    const anchors: Partial<
      Record<keyof typeof PLANET_BONES, PlanetAnchor>
    > = {};
    for (const key of Object.keys(PLANET_BONES) as Array<
      keyof typeof PLANET_BONES
    >) {
      const bone = clone.getObjectByName(PLANET_BONES[key]);
      if (!bone) continue;
      const boneIndex = mesh.skeleton.bones.indexOf(bone as THREE.Bone);
      if (boneIndex === -1) continue;
      const vertexIndices = findAnchorVertices(mesh, bone, boneIndex, 8);
      if (vertexIndices.length > 0) {
        anchors[key] = { skinnedMesh: mesh, vertexIndices };
      }
    }
    onAnchorsReady(anchors);
  }, [clone, onAnchorsReady]);

  useFrame((state, delta) => {
    if (!isVisibleRef.current || !groupRef.current) return;

    const action = actionRef.current;
    if (action) {
      const clip = action.getClip();
      const progress = THREE.MathUtils.clamp(scrollProgress.get(), 0, 1);
      action.time = progress * clip.duration;
    }

    // Ambient idle motion independent of scroll — visible even at
    // scrollProgress === 0, so the scene never looks frozen waiting for
    // input.
    if (!reducedMotion) {
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={[0.4, -0.1, -0.4]} scale={1.9}>
      <primitive object={clone} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
