# Landing page hero

## v1: plain static hero (current)

`src/components/landing/Hero.tsx`. No scroll-jacking, no pinned sequence, no generated
imagery. Just the name, punchline, subcopy, and the two CTAs, in normal document flow above
the fixed `Starfield` background. Scrolling past it reaches the existing 3-card feature grid
(`TiltCard` + `GlassPanel`, in `src/app/page.tsx`) and the footer. This is the whole v1
landing hero — no other moving parts.

## Why the cinematic version was removed

Two attempts at a scroll-driven cinematic hero were built and both were removed:

1. **Licensed photoreal WebGL orrery** (`Hero3D.tsx`/`Orrery.tsx`) — real-time
   `@react-three/fiber` scene, camera flying planet-to-planet. Removed: a real-time 3D scene
   is inherently harder to keep smooth across low-end devices than a plain image/CSS-
   transform sequence, and the brand direction moved to a bot mascot instead of a solar
   system.
2. **Nova, 6-beat scroll-choreographed sequence** (`HeroFilm.tsx` + `hero/*`) — CSS
   3D-transform "camera," GSAP `ScrollTrigger` pin/scrub, per-beat UI emergence, a canvas
   particle trail. This was meant to simulate one continuous camera shot without the
   performance risk of WebGL. In practice it didn't hold up: UI elements overlapped instead
   of anchoring cleanly, and the result read as stacked images crossfading rather than one
   continuous shot — the exact thing it was built to avoid. Removed rather than continuing to
   patch it.

Both attempts, plus the two versions before the orrery (an icosahedron blob and a glass
play-button + particle halo, further back in git history), are the reason v1 intentionally
ships with **no** hero animation. The static version is the reliable baseline; a cinematic
hero can be revisited later as a scoped, separately-reviewed piece of work, not bundled into
v1 completion.

## If revisiting a cinematic hero later

Don't restart from either removed approach's code — read this file and
`cinematic-hero-design.md` (marked superseded, but the narrative/camera-language sections are
still a reasonable starting point) for what was tried and why it broke, then scope a new
attempt as its own reviewed unit of work rather than folding it into an unrelated task.
