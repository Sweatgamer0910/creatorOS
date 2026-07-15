# Landing page 3D hero (`hero3d`)

The landing page hero (`src/components/landing/Hero3D.tsx` + `src/components/landing/hero3d/`) is a scroll-driven cinematic sequence centered on a real, licensed 3D asset: a photoreal solar-system orrery, orbited by a GPU-shader particle dust field. It replaced two earlier versions — an icosahedron blob (`ScrollScene.tsx` / `scene/Scene.tsx` / `scene/SignalObject.tsx`) and a procedural glass play-button (`PlayCore.tsx`) — both fully removed, not just superseded.

## No dead zone

The hero's headline, subcopy, and both CTAs render inside `Hero3D.tsx` itself (not in `page.tsx` above it) as an "intro" panel that's visible from scroll position 0, in the same pinned frame as the 3D object — there is no separate title section the user has to scroll past before the scene appears. `INTRO_EXIT` (currently `0.05`, i.e. 5% of the pinned scroll range) controls how much scroll it takes before the intro crossfades to chapter 0's copy; the object itself is already in its resting pose (chapter 0's camera waypoint/colors) and idly animating (rotation, drift) before any scroll happens, since `scrollProgress` at 0 maps directly to chapter 0 — there's no separate "waiting" state to design for. `page.tsx` only renders `<Hero3D />` plus the fixed `Starfield` background and the feature-card grid below it.

On narrow viewports (≤640px) the 3D canvas layer is shifted right and scaled down via a CSS media query on `.creatoros-hero-canvas` (currently `transform: translateX(42%) scale(0.6)` — retuned when the orrery replaced the narrower `PlayCore` shape, since the orrery's horizontal spread is much wider). If the object's shape or spread changes again, re-check this transform on a real narrow viewport, not just desktop — it's easy to either leave text overlapped or push the object almost entirely off-screen.

## Architecture

- `Hero3D.tsx` — orchestrator. Owns the GSAP `ScrollTrigger` pin/scrub sequence, the intro panel, the three narrative panels (chapter text), the per-chapter background wash, the letterbox bars, and the finale CTA. Dynamically imports `Scene` with `ssr: false`.
- `hero3d/Scene.tsx` — the `<Canvas>` wrapper: `CameraRig` (flies to each chapter's target planet — see below), lighting (including a rim light for product-render separation from the black background), an `Environment preset="city"` reflection map (needed for the orrery's PBR metal/glass materials to read as reflective rather than flat), per-chapter scene fog (`FogRig`), and conditional `Bloom` postprocessing.
- `hero3d/Orrery.tsx` — loads and renders the licensed `.glb` model, strips its stand/arm geometry down to just the planet+sun spheres, drives its baked animation clip by scroll position (not by playing it), and exposes vertex-based "planet anchor" data for `PlanetLabels` and `CameraRig`. Details below.
- `hero3d/PlanetLabels.tsx` — renders a small glass-chip `<Html>` label per labeled planet, naming a real CreatorOS feature.
- `hero3d/ContentField.tsx` — ambient starfield dust orbiting the orrery (repurposed from its original role as the hero object itself — see "History" below). All motion happens in the vertex/fragment shader, driven by a single `uProgress` uniform — no per-vertex JavaScript loop.
- `hero3d/formations.ts` — computes the three particle-dust formations once (not per-frame), spread out (`SPREAD = 2.6`) to sit as background depth around the orrery rather than overlapping it.
- `hero3d/Preloader.tsx` — gates on canvas creation + a minimum-visible floor. Does **not** use drei's `useProgress()` for the loading signal on its own — see the gotcha below if re-introducing texture/model progress tracking.
- `hero3d/CapabilityFallback.tsx` — CSS-only glow, rendered instead of mounting `<Canvas>` at all when the device fails the WebGL probe. Unaffected by the `PlayCore` → `Orrery` swap; verify this branch specifically if you ever touch `useDeviceTier`'s `isProbed`/`showFallback` logic in `Hero3D.tsx`.
- `src/hooks/useDeviceTier.ts` — capability probe → `{ tier, particleCount, bloom, dprCap }`. Drives graceful mobile/low-end degradation.
- `src/hooks/usePrefersReducedMotion.ts` — shared reduced-motion hook (also used by `Starfield`, `TiltCard`).
- `src/components/providers/LenisProvider.tsx` — site-wide smooth scroll (`root` mode — no extra DOM wrapper), synced to GSAP's ticker. Under reduced motion, `smoothWheel` is disabled and `lerp` is set to `1` rather than unmounting the provider.
- `src/components/landing/LandingFooter.tsx` — the CC BY attribution required by the model's license (see "Asset & license" below). No footer existed in this codebase before this component.

## The GLB asset

- Source: `assets/models/hero-object-source.glb` — the original, uncompressed download (3.39MB), kept for reference/re-export but **not served** (outside `public/`, so it never ships).
- Runtime asset: `public/models/hero-object-transformed.glb` (372KB) — produced by `npx gltfjsx public/models/hero-object.glb --transform`, which applies Draco/meshopt compression (89% size reduction) via `gltf-transform` under the hood. `Orrery.tsx` was hand-authored from the gltfjsx-scaffolded reference (not left as a raw generated file), per this repo's convention of typed, hand-maintained components.
- If the model is ever re-exported/replaced, regenerate with the same command and re-verify the bone names below — don't assume the names carry over from a re-export.

### Real rig structure (verified directly against the glb, not assumed)

The rig has 9 bones as direct children of `_rootJoint`: `Base_00` (mechanical stand, not a planet) plus one per planet, each suffixed with an index — `Mercury_08`, `Venus_07`, `Earth_06`, `Mars_05`, `Jupiter_04`, `Saturn_03`, `Uranus_02`, `Neptune_01`, `Sun_09` (see `PLANET_BONES` in `Orrery.tsx`). Two baked clips exist, `"Neptune 1 Min Orbit"` and `"Earth 1 Min Orbit"` — both drive every planet bone's rotation (and some bones' scale) simultaneously; they're two different orbital-speed presets, not per-planet animations. `Orrery.tsx` uses `"Earth 1 Min Orbit"` (`CLIP_NAME`), picked because Earth completing one lap at hero scale reads as a natural pace, and ties thematically to Earth being the channel's "home."

**Gotcha, found the hard way:** the planet bones are rotation *pivots* near the rig's base, not the planet's visual position — verified at runtime, every planet bone's `getWorldPosition()` resolves to nearly the same point (same X/Z, a tiny Y gradient) regardless of which planet. The arm's outward reach to the actual planet sphere is baked into the *skinned mesh geometry* rotating around that pivot, not into the bone's own transform. Anchoring UI (or anything else) to "where the planet visually is" requires reading the live skinned position of vertices bound to that bone — see `getAnchorWorldPosition()` in `Orrery.tsx`, used by both `PlanetLabels` and `CameraRig`.

## Stand/arm removal

The stand and mechanical arms are cut out of the mesh entirely (not just hidden) in `buildSphereOnlyGeometry()` — the rendered geometry only includes the planet and sun spheres. This is genuinely hard to do cleanly from vertex data alone, and it's worth understanding *why* before touching the constants:

- **Distance-from-pivot doesn't work**: a thin connecting rod often runs right up to (or through) the sphere, so its farthest points sit at nearly the same pivot-distance as the sphere's own surface. An earlier version of this filter used a "keep the farthest X% of vertices" rule and it visibly sliced the sun in half — the near hemisphere (closer to the pivot than the far hemisphere) got excluded along with the arm.
- **What works, imperfectly**: a *density* filter — a tessellated sphere packs many vertices into a small volume; a thin rod has few, spread along a line. `classifyByDensity()` computes each candidate vertex's distance to its nearest neighbor, uses the median as a "local unit spacing," and keeps only vertices with several other candidates within a few multiples of that spacing.
- **The mesh's compression wasn't uniform**: the meshopt simplification (`gltfjsx --transform`) kept a lot of detail on the sun but simplified the smaller planets much harder. A density threshold tight enough to fully exclude a thin rod cuts into the smaller planets' sparser spheres before it finishes excluding the rod. A threshold loose enough to keep every planet's sphere intact leaves a thin rod remnant under each one.
- **Current tradeoff, chosen deliberately**: `DENSITY_RADIUS_MULTIPLIER = 4`, `DENSITY_MIN_NEIGHBORS = 6` — loose enough that every sphere renders fully intact, at the cost of a thin rod remnant still visible under each planet. This was chosen over the alternative (tighter thresholds that fully remove the rod but also delete parts of the smaller planets) because a stray thin line is a much smaller visual defect than a missing chunk of a planet. Several tighter settings were tried and screenshotted; all of them either cut into a sphere or removed a planet's geometry entirely depending on which bone. There is no single threshold in this scheme that fully solves both problems at once, given how unevenly the source mesh was simplified.
- **If you want to actually finish this**: the reliable fix is inspecting the mesh in a proper 3D tool (Blender, or `gltf-transform inspect`) to hand-identify which vertex ranges are stand-vs-sphere, rather than continuing to guess thresholds blind. A per-bone override map (rather than one global threshold) would also help, since the sun and the smaller planets clearly need different treatment.

## Scroll-scrubbed animation, not playback

The baked clip is a time-based loop — `Orrery.tsx` does not `.play()` it. Instead: `action.reset().play(); action.paused = true;` once on mount, then every frame `action.time = scrollProgress.get() * action.getClip().duration`. `useAnimations`' internal mixer still calls `mixer.update(delta)` every frame regardless of the pause state, which is what actually applies the explicitly-set `.time` to the bones — pausing only stops the mixer's own automatic time advancement, it doesn't stop it from evaluating the current `.time`. Independent of scroll, a small idle motion (slow group rotation + a sine-wave bob) runs whenever `!reducedMotion`, so the orrery isn't static at `scrollProgress === 0`.

## Planet feature labels

Only the app's real, shipped features get a planet — not the aspirational Handbook Part VIII feature list (which includes several explicitly-deferred V2+ items like Revenue and Community; see `DEVELOPMENT_LOG.md`'s "Explicitly Out of Scope for V1" section). The mapping in `PlanetLabels.tsx`'s `PLANET_FEATURES`, confirmed against the actual `src/app/*` routes:

| Planet | Feature | Route |
|---|---|---|
| Mercury | Dashboard | `/dashboard` |
| Venus | Analytics | `/analytics` |
| Earth | AI Growth Coach | `/coach` |
| Mars | Idea Lab | `/ideas` |
| Jupiter | Script Studio | `/scripts` |
| Saturn | Pipeline | `/pipeline` |

Uranus and Neptune are intentionally left unlabeled — they stay part of the model, but there's no 7th/8th real feature to honestly attach to them. If a new top-level feature ships, add it to `PLANET_FEATURES` (and to `PLANET_BONES`'s consuming code if a new planet index is needed) rather than reaching for a Handbook feature that isn't built yet.

Labels are positioned via `PlanetLabels.tsx`, which calls `getAnchorWorldPosition()` every frame — reads each `PlanetAnchor`'s pre-selected vertex indices via `SkinnedMesh.getVertexPosition()` (the current Three.js API — note this replaced the older `boneTransform()` method, which no longer exists in this Three.js version), averages them, and converts to world space with `localToWorld()`. The `<Html>` label intentionally has no `distanceFactor` prop — that scales the DOM element based on camera distance, and once `CameraRig` started flying close to individual planets (see below) a `distanceFactor` tuned for the old, much-farther static camera made labels balloon to huge size. Without it, labels stay a fixed CSS pixel size regardless of camera distance, which is what you want for a UI affordance anyway.

## Camera flies to each chapter's planet

`CameraRig` in `Scene.tsx` targets the planet carrying that chapter's feature — `cameraWaypoints` maps each of the 3 chapters to a `planet` key (`venus`/`earth`/`saturn`, matching `PlanetLabels`' Analytics/AI Growth Coach/Pipeline by name) plus an `offset` (camera position *relative to that planet's live position*) and `fov`. Every frame, `CameraRig` calls `getAnchorWorldPosition()` for the current and next chapter's target planets, lerps between them by scroll progress, and points the camera at `target + offset` while `lookAt`-ing the blended target position directly — not the origin. The target itself moves continuously (the orrery's scroll-scrubbed clip keeps every planet "orbiting"), so this is recomputed live, never cached.

Offset magnitudes matter more than they might look: Venus and Earth sit close to the sun, so a tight offset (originally ~1.6–1.8 units) puts the camera close enough that the sun's much larger sphere dominates the frame, crowding out the actual target planet and any of its neighbors. Current offsets (~2.6–2.8 units) pull back enough to frame the target planet with some context around it. If you retune these, check a composition where the target planet is near the sun specifically, not just Saturn's (which is already far out and more forgiving).

## Per-chapter "movie scene" treatment

Each of the three chapters is meant to read as a distinct scene. Three layers combine to sell that, all keyed off the same `chapters[i]` index in `Hero3D.tsx`:

1. **CSS background wash** — `chapters[i].backdrop`, a full-bleed radial+linear gradient per chapter, cross-fading as `activeIndex` changes.
2. **Scene fog** — `FogRig` in `Scene.tsx` tints `THREE.Fog`'s color per chapter (`FOG_COLORS`).
3. **Particle dust color** — `ContentField` lerps between desaturated versions of the three accent colors. The orrery's own PBR materials are **not** re-colored per chapter (unlike `PlayCore` before it) — a real photoreal asset with baked textures shouldn't be artificially tinted; only the ambient environment shifts around it.

If you add a fourth chapter, update: `chapters` array (`Hero3D.tsx`), `FOG_COLORS` (`Scene.tsx`), camera `cameraWaypoints` (`Scene.tsx`), and `ContentField`/`formations.ts`'s formation-blend math (currently hardcoded to a 2-segment blend across 3 states).

## Asset & license

The orrery is "Solar System Model (Orrery)" by Smoggybeard (sketchfab.com/Smoggybeard), CC BY 4.0. Full attribution details are in `CREDITS.md` at the repo root. The required credit renders in `LandingFooter.tsx`, shown at the bottom of the landing page. If the model is ever swapped for a different licensed asset, update both `CREDITS.md` and `LandingFooter.tsx` — don't leave a stale credit pointing at an asset no longer in use, and don't remove the footer without confirming the new asset's license doesn't also require attribution.

## Tuning the perf budget

Edit `BUDGETS` in `useDeviceTier.ts`:

| Tier | Particles | Bloom | DPR cap |
|---|---|---|---|
| low | 1,800 | off | 1 |
| medium | 5,000 | on | 1.5 |
| high | 12,000 | on | 2 |

`gl_PointSize` in `ContentField.tsx`'s vertex shader is calibrated for the camera's ~4–5 unit distance from the field. If the camera waypoints in `Scene.tsx` move much closer/farther, that constant needs re-tuning — it's easy to accidentally make points either invisible or a single blown-out blob (this exact miscalibration happened during development: everything additively blended into a solid white/yellow disc). Verify visually after any camera or size change, not just via typecheck/build — this class of bug is invisible to the type checker and the build, only to a screenshot.

## Reduced motion

When `prefers-reduced-motion: reduce` is set: GSAP tween durations collapse to 0, the camera snaps to the nearest waypoint instead of lerping, the particle field's idle drift/rotation is skipped, Lenis's wheel smoothing is disabled, and the orrery's idle group rotation/bob is skipped — but the scroll-scrubbed clip time still updates every frame regardless of reduced motion, since that's a direct, discrete function of the user's own scroll input, not autonomous animation. See `usePrefersReducedMotion` usages across `Hero3D.tsx`, `Scene.tsx`, `Orrery.tsx`, `ContentField.tsx`, `PlanetLabels.tsx`, `Starfield.tsx`, `TiltCard.tsx`, and `LenisProvider.tsx`.

## Known gaps / not done

- **Thin rod remnants under each planet** — see "Stand/arm removal" above. The big base disc and thick articulated arms are fully gone; a thin connecting line remains under most planets due to non-uniform mesh simplification defeating a single density threshold. Documented there in detail rather than silently left as an unexplained artifact.
- `r3f-perf` is installed (devDependency) but not wired into a visible debug HUD — verification instead used scripted Playwright screenshots across viewport/motion-preference/scroll-position combinations, which is what actually caught the particle-size bug, the planet-anchor-position bug, the label distanceFactor-scaling bug, and the stand-removal geometry issues described above.
- No formal Chrome DevTools performance-panel trace was captured for the 60fps requirement — verified qualitatively (smooth scroll-through in Playwright, no dropped-frame console warnings) rather than with a numeric fps trace.
- The "fly-through image-sequence" technique from an earlier build spec (pre-rendered frame scrubbing for camera-through-geometry moves) was not implemented — the camera moves here are modest planet-to-planet flights, not moves through dense geometry.

## History

1. Icosahedron blob (`ScrollScene.tsx`/`SignalObject.tsx`) — first version, removed.
2. Procedural glass play-button (`PlayCore.tsx`) + particle halo (`ContentField.tsx` as the primary hero object) — second version, built after feedback that the blob didn't read as "a real object related to CreatorOS." Removed once the orrery replaced it.
3. Licensed photoreal orrery (`Orrery.tsx`) + `ContentField.tsx` repurposed as background starfield dust — third version, built after a decision to use a real modeled/licensed asset instead of a procedural shape, per-chapter-planet feature callouts, and the CC BY attribution requirement.
4. Stand/arm geometry removal + camera-flies-to-target-planet-per-chapter — current version. The orrery's stand and mechanical arms are cut from the rendered mesh (not just hidden), and `CameraRig` now targets the live position of each chapter's feature planet instead of static points in space.
