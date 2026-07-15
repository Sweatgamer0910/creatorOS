"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMotionValue } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BarChart3, Sparkles, Lightbulb, ArrowRight } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import Preloader from "./hero3d/Preloader";
import CapabilityFallback from "./hero3d/CapabilityFallback";

gsap.registerPlugin(ScrollTrigger);

const Scene = dynamic(() => import("./hero3d/Scene"), { ssr: false });

const chapters = [
  {
    icon: BarChart3,
    title: "Real analytics",
    body: "Views, subscribers, and watch time — pulled directly from YouTube, not guessed at.",
    glow: "245, 166, 35",
    backdrop:
      "radial-gradient(ellipse 90% 70% at 30% 45%, rgba(245,166,35,0.22) 0%, transparent 65%), linear-gradient(160deg, #120a02 0%, #050505 55%)",
  },
  {
    icon: Sparkles,
    title: "AI Growth Coach",
    body: "Honest, evidence-backed insights — labeled by confidence, never fabricated.",
    glow: "45, 212, 191",
    backdrop:
      "radial-gradient(ellipse 90% 70% at 65% 40%, rgba(45,212,191,0.2) 0%, transparent 65%), linear-gradient(160deg, #021210 0%, #050505 55%)",
  },
  {
    icon: Lightbulb,
    title: "Full content pipeline",
    body: "Ideas, scripts, and your upload schedule — all in one place, start to finish.",
    glow: "168, 132, 250",
    backdrop:
      "radial-gradient(ellipse 90% 70% at 40% 60%, rgba(168,132,250,0.2) 0%, transparent 65%), linear-gradient(160deg, #0d0818 0%, #050505 55%)",
  },
];

export default function Hero3D() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cinematicRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const barTopRef = useRef<HTMLDivElement>(null);
  const barBottomRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollProgress = useMotionValue(0);
  const isVisibleRef = useRef(true);
  const [canvasReady, setCanvasReady] = useState(false);

  const prefersReducedMotion = usePrefersReducedMotion();
  const tierBudget = useDeviceTier();

  useEffect(() => {
    const node = cinematicRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panels = panelsRef.current.filter(Boolean) as HTMLDivElement[];
      const reduceMotion = prefersReducedMotion;

      gsap.set(panels, {
        autoAlpha: 0,
        filter: reduceMotion ? "blur(0px)" : "blur(14px)",
        y: reduceMotion ? 0 : 16,
      });
      gsap.set(panels[0], { autoAlpha: 1, filter: "blur(0px)", y: 0 });
      gsap.set([barTopRef.current, barBottomRef.current], { height: 0 });

      gsap.fromTo(
        introRef.current,
        { autoAlpha: 0, y: reduceMotion ? 0 : 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: reduceMotion ? 0 : 1.2,
          ease: "power2.out",
          delay: reduceMotion ? 0 : 0.2,
        },
      );

      function openLetterbox() {
        gsap.to([barTopRef.current, barBottomRef.current], {
          height: "6vh",
          duration: reduceMotion ? 0 : 0.6,
          ease: "power2.out",
        });
      }
      function closeLetterbox() {
        gsap.to([barTopRef.current, barBottomRef.current], {
          height: 0,
          duration: reduceMotion ? 0 : 0.6,
          ease: "power2.in",
        });
      }

      ScrollTrigger.create({
        trigger: cinematicRef.current,
        start: "top top",
        end: () => `+=${(chapters.length - 1) * 100}%`,
        pin: true,
        scrub: reduceMotion ? true : 1.2,
        onEnter: openLetterbox,
        onEnterBack: openLetterbox,
        onLeave: closeLetterbox,
        onLeaveBack: closeLetterbox,
        onUpdate: (self) => {
          scrollProgress.set(self.progress);

          const rawIndex = self.progress * (chapters.length - 1);
          const nearestIndex = Math.round(rawIndex);

          if (nearestIndex !== activeIndexRef.current) {
            const outgoing = panels[activeIndexRef.current];
            const incoming = panels[nearestIndex];

            if (outgoing) {
              gsap.to(outgoing, {
                autoAlpha: 0,
                filter: reduceMotion ? "blur(0px)" : "blur(8px)",
                y: reduceMotion ? 0 : -12,
                duration: reduceMotion ? 0 : 0.4,
                ease: "power2.in",
              });
            }
            if (incoming) {
              gsap.fromTo(
                incoming,
                {
                  autoAlpha: 0,
                  filter: reduceMotion ? "blur(0px)" : "blur(14px)",
                  y: reduceMotion ? 0 : 16,
                },
                {
                  autoAlpha: 1,
                  filter: "blur(0px)",
                  y: 0,
                  duration: reduceMotion ? 0 : 0.6,
                  ease: "power2.out",
                },
              );
            }

            activeIndexRef.current = nearestIndex;
            setActiveIndex(nearestIndex);
          }
        },
      });
    }, wrapperRef);

    return () => ctx.revert();
  }, [prefersReducedMotion, scrollProgress]);

  const showFallback = tierBudget.isProbed && tierBudget.tier === "unsupported";
  const showCanvas = !tierBudget.isProbed || tierBudget.tier !== "unsupported";

  return (
    <div ref={wrapperRef}>
      {/* Cold open / title card */}
      <section
        style={{
          position: "relative",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#050505",
          overflow: "hidden",
        }}
      >
        <div ref={introRef} style={{ textAlign: "center", opacity: 0 }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(40px, 7vw, 84px)",
              color: "#fff",
              letterSpacing: "-0.02em",
            }}
          >
            CreatorOS
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 18,
              marginTop: 16,
            }}
          >
            The operating system for YouTube creators.
          </p>
          <p
            className="creatoros-scroll-hint"
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 13,
              marginTop: 48,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              animation: prefersReducedMotion
                ? "none"
                : "creatoros-pulse 2s ease-in-out infinite",
            }}
          >
            Scroll to explore ↓
          </p>
        </div>
        <style>{`
          @keyframes creatoros-pulse {
            0%, 100% { opacity: 0.55; }
            50% { opacity: 0.85; }
          }
          @media (prefers-reduced-motion: reduce) {
            .creatoros-scroll-hint { animation: none !important; }
          }
        `}</style>
      </section>

      {/* Cinematic pinned sequence */}
      <div
        ref={cinematicRef}
        style={{
          position: "relative",
          height: "100vh",
          overflow: "hidden",
          backgroundColor: "#050505",
        }}
      >
        {chapters.map((chapter, i) => (
          <div
            key={i}
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
              background: chapter.backdrop,
              opacity: i === activeIndex ? 1 : 0,
              transition: prefersReducedMotion
                ? "opacity 0.2s linear"
                : "opacity 1.4s ease",
            }}
          />
        ))}

        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          {showFallback && (
            <CapabilityFallback reducedMotion={prefersReducedMotion} />
          )}
          {showCanvas && !showFallback && (
            <Scene
              scrollProgress={scrollProgress}
              reducedMotion={prefersReducedMotion}
              isVisibleRef={isVisibleRef}
              particleCount={tierBudget.particleCount || 5000}
              bloom={tierBudget.bloom}
              dprCap={tierBudget.dprCap}
              onCreated={() => setCanvasReady(true)}
            />
          )}
          {showCanvas && !showFallback && (
            <Preloader
              canvasReady={canvasReady}
              reducedMotion={prefersReducedMotion}
            />
          )}
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            pointerEvents: "none",
            background:
              "radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.65) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            pointerEvents: "none",
            opacity: 0.045,
            mixBlendMode: "overlay",
            backgroundImage:
              "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        <div
          ref={barTopRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 0,
            backgroundColor: "#000",
            zIndex: 3,
          }}
        />
        <div
          ref={barBottomRef}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 0,
            backgroundColor: "#000",
            zIndex: 3,
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              maxWidth: 1000,
              width: "100%",
              margin: "0 auto",
              padding: "0 40px",
            }}
          >
            <div style={{ maxWidth: 440 }}>
              <div style={{ position: "relative", height: 240 }}>
                {chapters.map((chapter, i) => (
                  <div
                    key={i}
                    ref={(el) => {
                      panelsRef.current[i] = el;
                    }}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                    }}
                  >
                    <chapter.icon
                      size={28}
                      color="var(--color-accent)"
                      aria-hidden="true"
                    />
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(24px, 6vw, 32px)",
                        color: "#fff",
                        marginTop: 16,
                      }}
                    >
                      {chapter.title}
                    </h3>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.6)",
                        fontSize: 16,
                        marginTop: 12,
                        lineHeight: 1.6,
                      }}
                    >
                      {chapter.body}
                    </p>
                  </div>
                ))}
              </div>

              <div
                className="flex items-center gap-2"
                style={{ marginTop: 40 }}
                aria-hidden="true"
              >
                {chapters.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: i === activeIndex ? 24 : 8,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor:
                        i === activeIndex
                          ? "var(--color-accent)"
                          : "rgba(255,255,255,0.2)",
                      transition: "width 0.3s ease, background-color 0.3s ease",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Finale / CTA */}
      <section
        style={{
          position: "relative",
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#050505",
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px, 5vw, 56px)",
            color: "#fff",
            maxWidth: 720,
          }}
        >
          Your channel&apos;s next chapter starts here.
        </h2>
        <Link
          href="/signup"
          style={{
            marginTop: 40,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 28px",
            borderRadius: 999,
            backgroundColor: "var(--color-accent)",
            color: "#050505",
            fontWeight: 600,
            fontSize: 16,
            border: "none",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          Get started free <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}
