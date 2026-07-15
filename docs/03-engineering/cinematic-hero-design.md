# CreatorOS Cinematic Hero — Design Doc (v2)

Status: **removed from v1.** This doc's narrative (§1-2), camera language (§3), and
component architecture (§6-8) were built as designed (CSS/canvas choreography of still
images, not the pre-rendered-video plan in §5/§9/§10 — the account had 8.08 Higgsfield
credits against a 72-credit cost per production-quality leg). The build didn't hold up in
practice: UI elements overlapped instead of anchoring cleanly, and it read as stacked
crossfading images rather than one continuous shot. Pulled entirely for v1 in favor of a
plain static hero — see `docs/03-engineering/hero-film.md`. Kept here as a reference if a
cinematic hero gets revisited later as its own scoped effort.

## 0. Where this picks up

`HeroFilm.tsx` is the fourth hero this project has shipped:

1. Icosahedron blob — removed.
2. Glass play-button + particle halo — removed.
3. Licensed photoreal WebGL orrery (`@react-three/fiber`, camera flies planet-to-planet) —
   real engineering (device-tier budgets, mesh filtering, Playwright coverage), removed
   because a real-time 3D scene is inherently harder to keep smooth on low-end hardware
   than a plain image/transform sequence, and because the brand direction moved to a bot
   mascot (Nova) instead of a solar system.
4. **Current:** Nova, four static stills, crossfaded on `opacity` by scroll progress, plus
   a 4px scale/translate settle. GPU-cheap, never janky — but it isn't a cinematic shot. It's
   a slideshow with a nice camera-still on each slide. Four unconnected poses of the same
   character is not "the camera follows Nova through one continuous scene," which is what's
   being asked for now.

**Decision: do not bring WebGL back.** It's been tried twice (orrery, and per the git
history an earlier real-time attempt before that), and both times the smoothness risk was
the reason it got pulled. A third attempt would be spending the next chunk of hours
re-solving a problem this codebase has already decided isn't worth the risk.

**What actually gets "one continuous cinematic shot, GPU-cheap, guaranteed smooth" at the
same time is the technique Apple itself uses on AirPods Max / Vision Pro:** a single
continuous camera move is rendered once, offline, as a real film (photoreal lighting,
materials, camera work — no runtime compromise), sliced into a sequence of frames, and
scrubbed by scroll position via `<canvas>`. The user never sees a "video" or a "3D scene" —
they see one uninterrupted shot whose playhead is their scrollbar. This keeps every
performance property that made version 4 stable (opacity/transform-class cost, no
mesh/shader work, no video-seek jank) while fixing the actual complaint: right now there's
no camera movement at all within a chapter, only a crossfade between two static frames.

This is a content change (an AI-generated continuous shot replaces four disconnected
stills) plus a moderate rebuild of the player (frame-sequence canvas instead of stacked
`<img>` crossfade). The GSAP pin/scrub/letterbox/CTA shell that's proven stable across all
four versions is kept as-is.

## 1. Cinematic concept

**"Nova wakes up inside CreatorOS."** One continuous shot: the camera starts close on Nova
in darkness, and everything else in the scene — the analytics ring, the AI lens-glow, the
content tiles, the growth trajectory, the final CreatorOS mark — is Nova's own environment
assembling itself around a camera that never cuts. Nothing new is introduced by fading in a
different scene; every new element is something the camera _reveals_ as it moves, or
something that visibly grows out of Nova's body (the lens, the chest core, the space around
its hands).

Nova is already the right choice for the single hero object — it's the one asset that has
survived every past redesign, has an established character identity, and is small enough
(a figure, not a planet) that a camera can stay close to it for the entire shot without
running out of things to look at.

## 2. Narrative

Six beats, mapped onto Nova's own established feature chapters (analytics / coach /
pipeline) plus a beginning, a growth beat, and the CreatorOS reveal the doc already
anticipated ("if you add a fourth chapter"):

| Beat         | Story beat | What happens to Nova                                                                                        | What the camera does                                     |
| ------------ | ---------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Beginning    | Power-on   | Nova is inert, lens dark, in near-black space                                                               | Slow push-in, no cuts                                    |
| Discovery    | Analytics  | Lens-eye opens; a thin amber data ring lifts off Nova's chest                                               | Push continues, tilts to follow the ring as it orbits up |
| Intelligence | AI Coach   | The lens dilates, rack-focus from ring to lens; insight glyphs condense out of amber particles              | Rack focus + slow orbit around Nova's head               |
| Creation     | Pipeline   | Small glowing tiles (idea → script → schedule) assemble in the air ahead of Nova, which reaches toward them | Camera drifts laterally, following Nova's hand           |
| Growth       | Trajectory | The tiles compress into a rising light-trail behind Nova; environment brightens                             | Camera rises and pulls back, revealing more of the space |
| CreatorOS    | Reveal     | Nova's chest core flares; the light resolves into the CreatorOS wordmark, Nova now small in frame           | Final pull-back + center, letterbox closes to CTA        |

Every transition is Nova doing something (opening, reaching, turning), or the camera doing
something (push, tilt, orbit, pull-back) — never a hard cut to a new, unrelated pose.

## 3. Camera

One virtual camera path for the whole sequence, authored once at generation time (see §10),
not composed at runtime from independent per-chapter animations:

- **Beginning → Discovery:** slow dolly-in, ~2s equivalent duration, gentle ease — this is
  the "anticipation" beat.
- **Discovery → Intelligence:** the dolly continues but adds a slight upward tilt to follow
  the data ring, then racks focus onto Nova's lens — the visual equivalent of a held breath.
- **Intelligence → Creation:** the first real "impact" — a slight snap-settle (fast ease-out
  with a touch of overshoot, not linear) as the lens dilates, then the camera drifts
  laterally rather than dollying, which reads as a change in the kind of moment (a beat of
  calm after the intelligence reveal).
- **Creation → Growth:** camera begins rising, subtly, well before the tiles finish
  compressing — this is what makes the transition feel anticipated rather than abrupt.
- **Growth → CreatorOS:** the big pull-back. Slowest, longest move in the sequence — this is
  the "resolution" beat the whole shot has been building to.

No spinning, no orbit faster than a slow walk around the subject, no camera move that
changes direction abruptly. Every handoff between beats overlaps the next beat's motion
starting slightly before the current one finishes, so there's no frame where the camera is
static waiting for a cue — that's what makes cuts _feel_ like cuts even without an actual cut.

## 4. Transformation timeline

Scroll progress `0 → 1` across the whole pinned hero maps directly to shot progress —
scroll position is playhead position, not a page-turn.

| Scroll % | Beat         | Nova state                                          | UI emergence                                                          |
| -------- | ------------ | --------------------------------------------------- | --------------------------------------------------------------------- |
| 0–8%     | Beginning    | Dark, lens closed, intro copy visible in same frame | none                                                                  |
| 8–24%    | Discovery    | Lens opens, ring lifts                              | Analytics ring UI fades in, anchored to the ring's on-screen position |
| 24–44%   | Intelligence | Rack focus, lens dilates                            | Insight card UI, anchored to lens                                     |
| 44–64%   | Creation     | Tiles assemble at Nova's hand                       | Idea/script/schedule tile UI, anchored to tile cluster                |
| 64–82%   | Growth       | Tiles compress into light-trail                     | Growth trajectory sparkline, anchored to trail                        |
| 82–100%  | CreatorOS    | Core flares, wordmark resolves                      | Wordmark + CTA, letterbox closes                                      |

This is the same shape as the current `INTRO_EXIT` + per-chapter crossfade logic in
`HeroFilm.tsx` — six ranges instead of four, each still driving both an image-layer state
_and_ a UI-layer state off the same single `scrollProgress` value.

## 5. Performance strategy

- **Frame sequence, not video.** A folder of sequential still frames (AVIF, ~1600px wide)
  drawn to a single `<canvas>` each scroll tick, index selected by scroll progress.
  Cross-browser frame-accurate scrubbing via `<video>.currentTime` is unreliable outside
  keyframes; a plain array of images indexed by progress has no such problem and is what
  this technique relies on industry-wide.
- **Budget:** ~180 frames total (30/beat average) at 1600px wide AVIF, targeting roughly
  15–25KB/frame → ~3–4.5MB for the whole shot, comparable to a short compressed video but
  scrub-perfect at any scroll speed. Mobile/low-end gets a lower-res, lower-count variant
  (see below) — this is the one piece of the old device-tier system worth keeping, scoped
  down from "swap the whole scene" to "pick a smaller asset."
- **Decode off the main thread** via `createImageBitmap`, canvas draws batched to one per
  `requestAnimationFrame` regardless of scroll event frequency (same discipline the current
  GSAP `onUpdate` already follows).
- **Progressive load:** eagerly preload only the current beat's frames + the next beat's
  first few; the rest load on idle (`requestIdleCallback`) or as scroll approaches that
  range. First paint only needs the Beginning beat's handful of frames.
- **`devicePixelRatio` capped at 2** for the canvas backing store — no benefit past that for
  a background hero element, real cost in decode/draw time.
- **Reduced motion:** identical rule to the current implementation — the discrete
  beat/frame index still updates with scroll (it's directly driven by user input, not
  autonomous animation), but frame-to-frame interpolation/easing on the UI-layer collapses
  to instant, matching how `HeroFilm.tsx` already handles `prefers-reduced-motion`.

Net effect: same performance _class_ as the current version (GPU-composited, no
mesh/shader/video-decode work on the critical path) — it's a richer asset played back
through the same cheap mechanism, not a heavier mechanism.

## 6. Scene graph

```
CinematicHero
├─ ScrollTimeline            (GSAP ScrollTrigger pin+scrub — same shell as today, 6 beats not 4)
├─ FrameSequenceCanvas       (single <canvas>, draws current frame by index)
├─ NarrativeOverlay          (per-beat headline/subcopy — same crossfade pattern as today's intro/panels)
├─ UIEmergenceLayer
│   ├─ AnalyticsRingUI       (Discovery)
│   ├─ CoachLensUI           (Intelligence)
│   ├─ PipelineTilesUI       (Creation)
│   ├─ GrowthTrajectoryUI    (Growth)
│   └─ WordmarkRevealUI      (CreatorOS)
├─ LetterboxBars             (reused as-is)
├─ FilmGrainOverlay          (reused as-is)
└─ FinaleCTA                 (reused as-is, camera pull-back replaces the current fixed image)
```

## 7. Component architecture

- `useScrollTimeline(beatCount)` — extracted from the inline GSAP setup already in
  `HeroFilm.tsx` into a reusable hook: owns the `ScrollTrigger`, exposes `scrollProgress`
  (motion value), `activeBeat` (index), and `beatProgress` (0–1 within the current beat, for
  UI elements that need finer timing than the beat boundary).
- `<FrameSequence frames={string[]} progress={MotionValue<number>} />` — generic, reusable
  beyond this hero (any future scroll-scrubbed sequence uses the same component). Handles
  preloading, `createImageBitmap` decode, canvas draw, and the mobile/low-end asset variant
  swap.
- `<UIEmergence window={[start, end]} anchor={{x, y}}>` — generic wrapper reproducing the
  existing blur/opacity/y choreography (`autoAlpha`, `blur(14px)→blur(0px)`, `y: 16→0`) that
  already exists per-panel in `HeroFilm.tsx`, parameterized instead of hand-duplicated five
  times. `anchor` positions the UI element relative to where the relevant Nova feature sits
  in that beat's frames (fixed per beat, not tracked per-frame — the shot is authored so
  each anchor point stays roughly stationary within its beat).
- Everything else (`NarrativeOverlay`, `LetterboxBars`, `FilmGrainOverlay`, `FinaleCTA`) is a
  lift-and-adapt of what's already in `HeroFilm.tsx` today, not a rewrite.

## 8. Scroll synchronization

One `ScrollTrigger`, one pin, one `scrub` value — identical principle to the current
implementation, just driving one more consumer:

```
scrollProgress (0–1)
 ├─→ frame index for FrameSequenceCanvas   (progress × totalFrames)
 ├─→ activeBeat index for NarrativeOverlay  (same nearest-beat logic as today's activeIndex)
 └─→ per-UI window checks for UIEmergenceLayer (progress within [start, end] per element)
```

No second scroll listener, no independent `IntersectionObserver`-driven animation running
alongside the GSAP one — the exact discipline the current doc calls out as load-bearing for
smoothness. Lenis (already wired via `LenisProvider`) continues to drive the actual scroll
physics underneath, ScrollTrigger continues to read Lenis's position.

## 9. Optimization strategy

- Frame assets served from CloudFront (already the delivery path for Nova's current stills)
  as AVIF with a JPEG fallback for the handful of browsers that need it.
- Two asset tiers generated at build/export time: `desktop` (1600px, ~180 frames) and
  `mobile` (900px, ~90 frames, camera path resampled rather than just downscaled so motion
  still reads at half the frame count). Tier picked once on mount from viewport width +
  a lightweight capability check, not a full device-tier scoring system.
- Idle-time prefetch of upcoming beats, cancel-on-scroll-direction-reversal so a fast
  scroller doesn't pay for frames they've scrolled past.
- Canvas element sized once (`ResizeObserver`, not per-frame layout reads) and reused —
  never recreated per beat.
- Playwright coverage carried forward from the orrery era's discipline: verify the reduced
  motion path and a low-end viewport actually hit the mobile tier and stay at 60fps in a
  CPU-throttled trace, before calling this "done."

## 10. How the footage actually gets made

This is the part that's genuinely new work, separate from the player rebuild:

1. Use Nova's existing four reference stills (already CDN-hosted, already the locked
   character identity) as identity-lock references into a continuous video generation
   (Higgsfield/Kling-class image-to-video, motion-controlled camera path) — one continuous
   shot covering all six beats, not six separate generations stitched together. Stitching
   independent generations back-to-back reintroduces the "disconnected scenes" problem this
   whole redesign exists to fix.
2. Iterate on the generation with the camera path in §3 and the beat timing in §4 as the
   brief; this will take several passes to get lighting/material continuity (glass,
   brushed-metal, amber emissive accents per the brand's premium-materials direction) right
   across the full shot.
3. Extract frames via `ffmpeg`, compress to AVIF, upload to the existing S3/CloudFront
   pipeline (already a project dependency — no new infra).
4. Anchor points for each `UIEmergence` element are picked by eye from the final frames,
   once footage is locked — this has to happen after generation, not before.

## 11. What I need from you before implementation starts

- Sign-off on **not** reviving WebGL — this is the one call in this doc with real
  downside if wrong (it's a bigger rebuild than the frame-sequence approach), so flagging it
  explicitly rather than assuming.
- Budget/appetite for several video-generation iteration passes (step 10.2) — this is the
  step most likely to eat time, since it's the one genuinely new creative asset in the whole
  redesign.
- Confirmation the six-beat story in §2 is the right one — in particular whether "Growth"
  should be its own beat (as the brief specified) or folded into the CreatorOS finale, since
  the current codebase's docs only ever anticipated a fourth chapter, not a fifth.

Once those are confirmed, next step is generating and locking the footage (§10), then
building `FrameSequence` + `useScrollTimeline` against real frames rather than placeholders.
