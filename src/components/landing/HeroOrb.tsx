"use client";

import { useEffect, useRef, useState } from "react";
// The `/next` entrypoint is a Server Component (it does its own server-side
// fetch for a blurhash preview) — invalid inside this "use client" file.
// React can't render an async component on the client: it doesn't just
// warn, it re-invokes the component every render trying to resolve it,
// which drove a runaway request loop against Spline's servers (~800 req/s
// hitting the scene's /hash endpoint) and froze the page. The plain client
// entrypoint has no async/server-fetch step.
import Spline from "@splinetool/react-spline";
import type { Application, SPEObject } from "@splinetool/runtime";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const SCENE_URL = "https://prod.spline.design/C-8AicrpCVSCwZMN/scene.splinecode";

// The published scene still carries a leftover UI-mockup group from the
// community template it was remixed from — flat text/rectangle meshes
// ("Text", "Text 2", "Text 3", "Text 4", "BG", "CTA", "Rectangle",
// "Сursor" — note the Cyrillic С) sitting in front of the actual orb
// geometry, still `visible: true`. They render as stray glyph fragments
// overlapping the hero copy. The real fix is deleting them in the Spline
// editor and republishing; this hides them at runtime in the meantime so
// they never appear here. getAllObjects() (not findObjectByName, which
// only returns the first match) because two objects share the name "Text".
const STRAY_MOCKUP_OBJECT_NAMES = new Set([
  "BG",
  "CTA",
  "Rectangle",
  "Text",
  "Text 2",
  "Text 3",
  "Text 4",
  "Сursor",
]);

// CreatorOS's living AI core, rendered as a reactive amber/teal particle
// orb (Spline, remixed from the community "Reactive Orb" scene onto the
// site's real palette). It keeps its native pointer-reactivity and we
// additionally drive a slow, bounded rotation from scroll position so it
// reads as alive while the hero scrolls into view.
//
// This is deliberately NOT a scroll-scrubbed camera sequence. This project
// has already tried and removed a WebGL scroll-driven hero twice (see
// docs/03-engineering/hero-film.md, cinematic-hero-design.md) because
// real-time 3D scroll choreography wasn't reliably smooth on low-end
// hardware. A single static 3D object with light interactivity carries a
// much smaller performance surface than a scroll-jacked camera, which is
// why this stays a background visual accent rather than the whole hero.
export default function HeroOrb() {
  const appRef = useRef<Application | null>(null);
  const orbRef = useRef<SPEObject | null>(null);
  const rafRef = useRef<number | null>(null);
  const targetRotationRef = useRef(0);
  const currentRotationRef = useRef(0);
  const [loaded, setLoaded] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  function handleLoad(app: Application) {
    appRef.current = app;
    orbRef.current = app.findObjectByName("Clones") ?? null;
    for (const obj of app.getAllObjects()) {
      if (STRAY_MOCKUP_OBJECT_NAMES.has(obj.name)) obj.hide();
    }
    setLoaded(true);
  }

  useEffect(() => {
    if (!loaded || prefersReducedMotion) return;

    function onScroll() {
      // Bounded drift over the first ~1200px of scroll -- enough to feel
      // responsive without ever spinning freely or looking like a camera move.
      const progress = Math.min(window.scrollY / 1200, 1);
      targetRotationRef.current = progress * 0.9;
    }

    function tick() {
      currentRotationRef.current +=
        (targetRotationRef.current - currentRotationRef.current) * 0.06;
      if (orbRef.current) {
        orbRef.current.rotation.y = currentRotationRef.current;
      }
      appRef.current?.requestRender();
      rafRef.current = requestAnimationFrame(tick);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [loaded, prefersReducedMotion]);

  // Reduced-motion visitors get no WebGL canvas at all -- not just a paused
  // one -- matching how the rest of the landing page (Starfield, etc.)
  // already treats prefers-reduced-motion.
  if (prefersReducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        opacity: loaded ? 1 : 0,
        transition: "opacity 1s ease",
      }}
    >
      <Spline
        scene={SCENE_URL}
        onLoad={handleLoad}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
