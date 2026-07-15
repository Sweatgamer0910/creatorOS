# Landing page 3D hero (`hero3d`)

The landing page hero (`src/components/landing/Hero3D.tsx` + `src/components/landing/hero3d/`) is a scroll-driven cinematic sequence built around a GPU-shader particle field. It replaced the earlier icosahedron-blob version (`ScrollScene.tsx` / `scene/Scene.tsx` / `scene/SignalObject.tsx`, removed).

## Architecture

- `Hero3D.tsx` — orchestrator. Owns the GSAP `ScrollTrigger` pin/scrub sequence, the three narrative panels (chapter text), the letterbox bars, and the finale CTA. Dynamically imports `Scene` with `ssr: false`.
- `hero3d/Scene.tsx` — the `<Canvas>` wrapper: camera rig (scroll-driven waypoints + lerped mouse parallax), ambient light, and conditional `Bloom` postprocessing.
- `hero3d/ContentField.tsx` — the particle hero object. All motion (formation morph, idle drift, color blend) happens in the vertex/fragment shader, driven by a single `uProgress` uniform updated once per frame — there is no per-vertex JavaScript loop.
- `hero3d/formations.ts` — computes the three target particle formations once (not per-frame): a Fibonacci-sphere "channel core" shell, a double-helix "AI energy" cloud, and a flowing ribbon/arc for "pipeline". Each vertex carries all three target positions as attributes; the shader blends between them via `uProgress`.
- `hero3d/Preloader.tsx` — gates on canvas creation + a minimum-visible floor. Does **not** use drei's `useProgress()` — this scene loads no textures/models, so the underlying `THREE.LoadingManager` never fires `onLoad` and progress would never reach 100.
- `hero3d/CapabilityFallback.tsx` — CSS-only glow, rendered instead of mounting `<Canvas>` at all when the device fails the WebGL probe.
- `src/hooks/useDeviceTier.ts` — capability probe (WebGL support, software-renderer detection, core count, coarse-pointer heuristic) → `{ tier, particleCount, bloom, dprCap }`. Drives graceful mobile/low-end degradation instead of shipping the desktop scene shrunk down.
- `src/hooks/usePrefersReducedMotion.ts` — shared reduced-motion hook (also used by `Starfield`, `TiltCard`).
- `src/components/providers/LenisProvider.tsx` — site-wide smooth scroll (`root` mode — no extra DOM wrapper), synced to GSAP's ticker so `ScrollTrigger` never drifts out of sync with the smoothed scroll position. Under reduced motion, `smoothWheel` is disabled and `lerp` is set to `1` (native-feeling) rather than unmounting the provider, so the rest of the app's component tree isn't remounted on an OS-preference change.

## Swapping the hero motif

The three formations are generated in `formations.ts`. To change what the field morphs into, edit `fibonacciSpherePoint` / `helixPoint` / `ribbonPoint` (or add a fourth) and update `buildFormations()`'s returned attribute arrays — everything downstream (shader blending, color per chapter) reads from those buffers, no other file needs to change for a shape-only tweak. Per-chapter color and count of formations both live in `ContentField.tsx`'s `uColorA/B/C` uniforms and `Hero3D.tsx`'s `chapters` array respectively — keep both in sync if you add/remove a chapter.

## Tuning the perf budget

Edit `BUDGETS` in `useDeviceTier.ts`:

| Tier | Particles | Bloom | DPR cap |
|---|---|---|---|
| low | 1,800 | off | 1 |
| medium | 5,000 | on | 1.5 |
| high | 12,000 | on | 2 |

`gl_PointSize` in `ContentField.tsx`'s vertex shader is calibrated for the camera's ~4–5 unit distance from the field (`uSize * aSize * uPixelRatio * (4.0 / -mvPosition.z)`). If the camera waypoints in `Scene.tsx` move much closer/farther, that `4.0` constant needs re-tuning — it's easy to accidentally make points either invisible or a single blown-out blob (an ~72x miscalibration here is exactly what happened during development: everything additively blended into a solid white/yellow disc). Verify visually after any camera or `uSize` change, not just via typecheck/build.

## Reduced motion

When `prefers-reduced-motion: reduce` is set: GSAP tween durations collapse to 0 (instant panel swaps instead of blur/scale morphs), the camera snaps to the nearest waypoint instead of lerping, the particle field's vertex-noise idle drift and rotation are skipped (color/formation still update per chapter, just without continuous motion), and Lenis's wheel smoothing is disabled. See `usePrefersReducedMotion` usages across `Hero3D.tsx`, `Scene.tsx`, `ContentField.tsx`, `Starfield.tsx`, `TiltCard.tsx`, and `LenisProvider.tsx`.

## Known gaps / not done

- `r3f-perf` is installed (devDependency, per the original build spec) but not wired into a visible debug HUD — verification instead used scripted Playwright screenshots across viewport/motion-preference combinations, which is what actually caught the particle-size bug above. Add an `r3f-perf` overlay gated behind `process.env.NODE_ENV === "development"` if an interactive perf HUD becomes useful.
- The "fly-through image-sequence" technique described in the original build spec (pre-rendered frame scrubbing for camera-through-geometry moves) was not implemented — the camera moves in this hero are modest waypoint dollies, not moves through dense geometry, so real-time R3F was judged sufficient rather than warranting an offline-rendered frame sequence.
