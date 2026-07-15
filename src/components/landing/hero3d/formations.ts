import * as THREE from "three";

// Three particle formations the hero field morphs between as the user
// scrolls, each tied to one of the landing page's three value props.
// All positions are computed once (not per-frame) — the GPU handles the
// blend between them every frame via the vertex shader.

function fibonacciSpherePoint(
  i: number,
  count: number,
  radius: number,
): [number, number, number] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (i / Math.max(count - 1, 1)) * 2;
  const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = golden * i;
  return [
    Math.cos(theta) * radiusAtY * radius,
    y * radius,
    Math.sin(theta) * radiusAtY * radius,
  ];
}

function helixPoint(
  i: number,
  count: number,
  strandOffset: number,
): [number, number, number] {
  const t = i / count;
  const turns = 3.5;
  const angle = t * Math.PI * 2 * turns + strandOffset;
  const radius = 1.15 * (0.55 + 0.45 * Math.sin(t * Math.PI));
  const height = 2.6;
  return [
    Math.cos(angle) * radius,
    (t - 0.5) * height,
    Math.sin(angle) * radius,
  ];
}

function ribbonPoint(t: number, lane: number): [number, number, number] {
  const x = THREE.MathUtils.lerp(-2.3, 2.3, t);
  const y =
    Math.sin(t * Math.PI * 1.3 - Math.PI / 2) * 0.9 + (t - 0.5) * 1.6 + lane;
  const z = Math.cos(t * Math.PI * 2.2) * 0.35;
  return [x, y, z];
}

export function buildFormations(count: number) {
  const posA = new Float32Array(count * 3); // Real analytics — channel core
  const posB = new Float32Array(count * 3); // AI Growth Coach — helix energy
  const posC = new Float32Array(count * 3); // Content pipeline — flowing arc
  const seed = new Float32Array(count);
  const size = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const ix = i * 3;

    const jitter = 0.06;
    const [ax, ay, az] = fibonacciSpherePoint(i, count, 1.35);
    posA[ix] = ax + (Math.random() - 0.5) * jitter;
    posA[ix + 1] = ay + (Math.random() - 0.5) * jitter;
    posA[ix + 2] = az + (Math.random() - 0.5) * jitter;

    const strand = i % 2 === 0 ? 0 : Math.PI;
    const [bx, by, bz] = helixPoint(i, count, strand);
    posB[ix] = bx + (Math.random() - 0.5) * jitter;
    posB[ix + 1] = by + (Math.random() - 0.5) * jitter;
    posB[ix + 2] = bz + (Math.random() - 0.5) * jitter;

    const t = Math.random();
    const lane = (Math.random() - 0.5) * 0.5;
    const [cx, cy, cz] = ribbonPoint(t, lane);
    posC[ix] = cx + (Math.random() - 0.5) * jitter;
    posC[ix + 1] = cy + (Math.random() - 0.5) * jitter;
    posC[ix + 2] = cz + (Math.random() - 0.5) * jitter;

    seed[i] = Math.random() * Math.PI * 2;
    size[i] = 0.5 + Math.random() * 1;
  }

  return { posA, posB, posC, seed, size };
}
