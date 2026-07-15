# Landing page hero (`HeroFilm`)

The landing page hero (`src/components/landing/HeroFilm.tsx`) is a scroll-driven
cinematic sequence centered on **Nova**, the CreatorOS companion bot — a small,
friendly hovering robot with one oversized amber lens-eye, rendered hyperrealistically
(collectible-figure product photography, not flat vector cartoon). It replaced a
WebGL 3D hero (a licensed photoreal solar-system orrery rendered via
`@react-three/fiber`) after the founder decided to move away from a real-time 3D
scene entirely — see "Why the WebGL orrery was removed" below.

## No dead zone

The hero's headline, subcopy, and both CTAs render inside `HeroFilm.tsx` itself (not
in `page.tsx` above it) as an "intro" panel that's visible from scroll position 0, in
the same pinned frame as Nova — there is no separate title section the user has to
scroll past before the scene appears. `INTRO_EXIT` (currently `0.05`, i.e. 5% of the
pinned scroll range) controls how much scroll it takes before the intro crossfades to
chapter 0's copy. `page.tsx` only renders `<HeroFilm />` plus the fixed `Starfield`
background and the feature-card grid below it.

## Architecture

- `HeroFilm.tsx` — the entire hero. Owns the GSAP `ScrollTrigger` pin/scrub sequence
  (unchanged from the previous version — this part of the design held up fine), the
  intro panel, the three narrative panels (chapter text), the per-chapter background
  wash, the letterbox bars, and the finale CTA. Also owns Nova: three chapter stills
  (`NOVA.analytics` / `NOVA.coach` / `NOVA.pipeline`, one per chapter) crossfaded via
  plain opacity based on `activeIndex`, with a subtle scale/translate settle driven by
  a Framer Motion `useTransform` on the same `scrollProgress` motion value the
  ScrollTrigger callback already updates — no second scroll listener.
- Nova's four stills (`analytics`, `coach`, `pipeline`, `finale`) are CDN-hosted
  (Higgsfield-generated, Soul Cinema model) and referenced by URL directly — there's no
  local asset pipeline, build step, or texture loading involved.
- `usePrefersReducedMotion` (`src/hooks/usePrefersReducedMotion.ts`) — unchanged,
  shared with `Starfield`/`TiltCard`/`LenisProvider`.

## Why smoothness is guaranteed here, not just tuned

The scroll loop touches only `opacity` and `transform` (`scale`/`translateY`) on plain
`<img>` elements — both GPU-composited, neither triggers layout. There's no canvas, no
WebGL context, no per-frame mesh/shader/particle work, and no video decode/seek. This
isn't a performance tier that degrades gracefully on weak hardware (like the orrery's
`useDeviceTier` budgets did) — it's a class of animation that's cheap on every device,
including the ones the orrious device-tier system existed to protect. There is
therefore no capability probe, no fallback component, and no device-tier hook in this
version — none of that machinery is needed.

## Reduced motion

When `prefers-reduced-motion: reduce` is set: GSAP tween durations collapse to 0, the
chapter/backdrop crossfades switch from a 1.1–1.4s ease to a flat 0.2s linear fade, and
Nova's scale/translate settle is skipped entirely (locked to `scale: 1, y: 0`). The
scroll-scrubbed chapter *index* still updates every frame regardless of reduced
motion, since that's a direct, discrete function of the user's own scroll input, not
autonomous animation — same rule the orrery followed.

## Why the WebGL orrery was removed

The previous hero (`Hero3D.tsx` + `hero3d/*`) used a licensed CC BY 4.0 photoreal
orrery model, with a camera that flew to a different planet per chapter and each
planet labeled with a real shipped feature (Mercury→Dashboard, Venus→Analytics,
Earth→AI Growth Coach, Mars→Idea Lab, Jupiter→Script Studio, Saturn→Pipeline). It was
real, careful engineering — device-tier performance budgets, a from-scratch mesh
filter to strip the model's stand/arms, scroll-scrubbed (not played) animation clips,
and Playwright-verified reduced-motion/viewport coverage. All of that is documented in
git history (see the "WIP snapshot" commit immediately before the `HeroFilm` switch)
if it's ever worth revisiting.

It was replaced because the founder wanted a different visual direction (a bot mascot
with a friendlier, more "CreatorOS" identity) and, independently, because a real-time
3D scene is inherently harder to keep smooth across low-end devices than a plain
image/CSS-transform sequence — the device-tier system existed specifically to manage
that risk, and removing the WebGL scene removes the risk instead of just managing it.

Removed along with the component: `three`, `@react-three/fiber`, `@react-three/drei`,
`@react-three/postprocessing`, `maath` (dependencies) and `@types/three`, `r3f-perf`
(devDependencies) — none were used anywhere else in the app (verified via grep before
removal). Also removed: `public/models/`, `assets/models/` (the `.glb` asset),
`CREDITS.md`, and the CC BY attribution line in `LandingFooter.tsx` — the license
requirement no longer applies once the asset isn't shipped.

## If you add a fourth chapter

Update: `chapters` array (`HeroFilm.tsx`, add an image to `NOVA` and a matching
`backdrop`/`glow`). The GSAP pin/scrub math (`(chapters.length - 1) * 100%`) already
scales to any chapter count without further changes.

## History

1. Icosahedron blob (`ScrollScene.tsx`/`SignalObject.tsx`) — first version, removed.
2. Procedural glass play-button (`PlayCore.tsx`) + particle halo (`ContentField.tsx`
   as the primary hero object) — second version, removed once the orrery replaced it.
3. Licensed photoreal orrery (`Orrery.tsx`) + per-chapter-planet feature callouts,
   camera-flies-to-target-planet — third version, real WebGL, removed in favor of Nova.
4. **Current:** Nova, the CreatorOS companion bot — a crossfading image sequence, no
   WebGL, same GSAP pin/scrub/letterbox/CTA shell as the orrery version.
