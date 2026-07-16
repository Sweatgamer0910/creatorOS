# Landing page hero

## v1.1: static hero + reactive 3D orb accent (current)

`src/components/landing/Hero.tsx` is still the static text hero (name, punchline, subcopy,
two CTAs, in normal document flow) — no scroll-jacking, no pinned sequence, no camera
sequence. The one addition is `src/components/landing/HeroOrb.tsx`: a single reactive 3D
object (Spline, `@splinetool/react-spline`), positioned as a background accent to the right
of the text on `xl:` viewports and up, hidden below that breakpoint and under
`prefers-reduced-motion`.

The orb is remixed from Spline's community "Reactive Orb" template onto the site's real
palette (`#000` / `#171B22` / `#F5A623` / `#2DD4BF`), keeps its native pointer-reactivity,
and additionally has a slow, bounded scroll-linked rotation (see `HeroOrb.tsx` for the
rotation math — capped drift over the first ~1200px of scroll, not a free spin). The
template's own baked-in headline/CTA/background layers were hidden inside Spline before
export specifically so they don't duplicate the real HTML hero text — the orb canvas ships
containing only the reactive sphere.

This is deliberately **not** a scroll-scrubbed camera sequence, and doesn't reopen the
WebGL-camera question closed below. It's a single static 3D object with light pointer/scroll
reactivity — a much smaller performance surface than a scroll-jacked shot, and the real hero
copy stays real, selectable, accessible HTML rather than baked into a canvas.

## v1: plain static hero (superseded by v1.1 above)

Just the name, punchline, subcopy, and the two CTAs, in normal document flow above
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

The v1.1 orb (above) is not that attempt — it's a static object with light reactivity, not a
camera sequence, and doesn't touch the WebGL-scroll-camera question this section is about.
`cinematic-hero-design.md`'s Nova-journey narrative and beat structure are still there,
unbuilt, if a real scoped pass at the full sequence happens later.
