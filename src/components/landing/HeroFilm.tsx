"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BarChart3, Sparkles, Lightbulb, ArrowRight } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

// Fraction of the pinned scroll range where the intro (headline + CTAs)
// hands off to chapter 0's copy — kept small so the reveal engages almost
// immediately, not after a long dead zone.
const INTRO_EXIT = 0.05;

// Nova, the CreatorOS companion bot — hyperrealistic collectible-figure
// style, amber lens-eye, matte charcoal body. Consistent identity locked
// across all four stills via reference-image generation (Higgsfield Soul
// Cinema). Chosen deliberately over the previous WebGL orrery: guaranteed
// smooth on every device (plain image crossfade + transform, no GPU-bound
// mesh/shader work), while still reading as a "real object" for the brand.
const NOVA = {
  analytics:
    "https://d8j0ntlcm91z4.cloudfront.net/user_3GFglOuPtqzOK0CmLg5l0FpCuUM/hf_20260715_183902_c20f7f9c-2dd2-4a55-835f-6b9476e2fe39.png",
  coach:
    "https://d8j0ntlcm91z4.cloudfront.net/user_3GFglOuPtqzOK0CmLg5l0FpCuUM/hf_20260715_182916_0c442a84-21db-415a-94ea-9b30d5843db7.png",
  pipeline:
    "https://d8j0ntlcm91z4.cloudfront.net/user_3GFglOuPtqzOK0CmLg5l0FpCuUM/hf_20260715_184146_f654dc37-562a-4c58-9b70-6dc887c505a0.png",
  finale:
    "https://d8j0ntlcm91z4.cloudfront.net/user_3GFglOuPtqzOK0CmLg5l0FpCuUM/hf_20260715_184329_2cc04de2-d4ca-468d-b06d-d828b777954c.png",
};

const chapters = [
  {
    icon: BarChart3,
    title: "Real analytics",
    body: "Views, subscribers, and watch time — pulled directly from YouTube, not guessed at.",
    image: NOVA.analytics,
    alt: "Nova, the CreatorOS companion bot, with a holographic analytics ring projected above it",
    glow: "245, 166, 35",
    backdrop:
      "radial-gradient(ellipse 90% 70% at 30% 45%, rgba(245,166,35,0.22) 0%, transparent 65%), linear-gradient(160deg, #120a02 0%, #050505 55%)",
  },
  {
    icon: Sparkles,
    title: "AI Growth Coach",
    body: "Honest, evidence-backed insights — labeled by confidence, never fabricated.",
    image: NOVA.coach,
    alt: "Nova, the CreatorOS companion bot, with its amber lens-eye opening wide",
    glow: "45, 212, 191",
    backdrop:
      "radial-gradient(ellipse 90% 70% at 65% 40%, rgba(45,212,191,0.2) 0%, transparent 65%), linear-gradient(160deg, #021210 0%, #050505 55%)",
  },
  {
    icon: Lightbulb,
    title: "Full content pipeline",
    body: "Ideas, scripts, and your upload schedule — all in one place, start to finish.",
    image: NOVA.pipeline,
    alt: "Nova, the CreatorOS companion bot, orbited by small glowing content tiles",
    glow: "168, 132, 250",
    backdrop:
      "radial-gradient(ellipse 90% 70% at 40% 60%, rgba(168,132,250,0.2) 0%, transparent 65%), linear-gradient(160deg, #0d0818 0%, #050505 55%)",
  },
];

export default function HeroFilm() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cinematicRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const barTopRef = useRef<HTMLDivElement>(null);
  const barBottomRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollProgress = useMotionValue(0);

  const prefersReducedMotion = usePrefersReducedMotion();

  // Subtle parallax/settle on Nova as the user scrubs through the pinned
  // range — opacity/transform only (GPU-composited), never layout or
  // canvas/video work, which is what made the previous version choppy.
  const novaScale = useTransform(scrollProgress, [0, 1], [1.05, 1]);
  const novaY = useTransform(scrollProgress, [0, 1], [10, -10]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panels = panelsRef.current.filter(Boolean) as HTMLDivElement[];
      const reduceMotion = prefersReducedMotion;
      let introExited = false;

      // Intro (headline + CTAs) is visible from scroll=0, in the same pinned
      // frame as Nova — not a separate section the user has to scroll past
      // before the scene appears.
      gsap.set(introRef.current, { autoAlpha: 1, filter: "blur(0px)", y: 0 });
      gsap.set(panels, {
        autoAlpha: 0,
        filter: reduceMotion ? "blur(0px)" : "blur(14px)",
        y: reduceMotion ? 0 : 16,
      });
      gsap.set([barTopRef.current, barBottomRef.current], { height: 0 });

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

      function showIntro() {
        gsap.to(panels[0], {
          autoAlpha: 0,
          filter: reduceMotion ? "blur(0px)" : "blur(8px)",
          y: reduceMotion ? 0 : -12,
          duration: reduceMotion ? 0 : 0.4,
          ease: "power2.in",
        });
        gsap.fromTo(
          introRef.current,
          {
            autoAlpha: 0,
            filter: reduceMotion ? "blur(0px)" : "blur(14px)",
            y: reduceMotion ? 0 : 16,
          },
          {
            autoAlpha: 1,
            filter: "blur(0px)",
            y: 0,
            duration: reduceMotion ? 0 : 0.5,
            ease: "power2.out",
          },
        );
      }

      function hideIntro() {
        gsap.to(introRef.current, {
          autoAlpha: 0,
          filter: reduceMotion ? "blur(0px)" : "blur(8px)",
          y: reduceMotion ? 0 : -12,
          duration: reduceMotion ? 0 : 0.5,
          ease: "power2.in",
        });
        gsap.fromTo(
          panels[0],
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

          if (!introExited && self.progress > INTRO_EXIT) {
            introExited = true;
            hideIntro();
          } else if (introExited && self.progress <= INTRO_EXIT) {
            introExited = false;
            showIntro();
          }

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

  return (
    <div ref={wrapperRef}>
      {/* Cinematic pinned sequence — headline/CTAs + Nova are both visible
          from scroll=0, no dead zone before the scene appears. */}
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
            key={chapter.title}
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

        {/* Nova — crossfading image stack, GPU-composited opacity/transform
            only. No canvas, no WebGL, no per-frame mesh work: this is what
            guarantees it can't reproduce the old scene's choppiness. */}
        <div
          className="creatoros-hero-canvas"
          style={{ position: "absolute", inset: 0, zIndex: 0 }}
        >
          {chapters.map((chapter, i) => (
            <motion.img
              key={chapter.image}
              src={chapter.image}
              alt={chapter.alt}
              decoding="async"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                padding: "8vh 4vw",
                opacity: i === activeIndex ? 1 : 0,
                transition: prefersReducedMotion
                  ? "opacity 0.2s linear"
                  : "opacity 1.1s ease",
                scale: prefersReducedMotion ? 1 : novaScale,
                y: prefersReducedMotion ? 0 : novaY,
                filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.55))",
              }}
            />
          ))}
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
            <div style={{ maxWidth: 620 }}>
              <div style={{ position: "relative", height: 340 }}>
                <div
                  ref={introRef}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    opacity: 0,
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 14px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.1)",
                      fontSize: 13,
                      color: "rgba(255,255,255,0.6)",
                      backgroundColor: "rgba(0,0,0,0.4)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: "var(--color-accent)",
                      }}
                    />
                    Mission control for YouTube creators
                  </div>
                  <h1
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(36px, 5vw, 56px)",
                      lineHeight: 1.1,
                      fontWeight: 700,
                      color: "#fff",
                      marginTop: 20,
                    }}
                  >
                    Grow your channel
                    <br />
                    with real signal, not noise.
                  </h1>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 17,
                      maxWidth: 480,
                      marginTop: 16,
                      lineHeight: 1.6,
                    }}
                  >
                    Analytics, AI-backed insights, and your entire content
                    pipeline — in one command center built for creators, not
                    spreadsheets.
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      marginTop: 28,
                    }}
                  >
                    <Link
                      href="/signup"
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium"
                      style={{
                        backgroundColor: "var(--color-accent)",
                        color: "#000",
                        textDecoration: "none",
                      }}
                    >
                      Get started
                      <ArrowRight size={16} />
                    </Link>
                    <Link
                      href="/login"
                      className="flex items-center px-6 py-3 rounded-xl font-medium"
                      style={{
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#fff",
                        backgroundColor: "rgba(0,0,0,0.3)",
                        textDecoration: "none",
                      }}
                    >
                      Log in
                    </Link>
                  </div>
                  <p
                    className="creatoros-scroll-hint"
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 13,
                      marginTop: 32,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      animation: prefersReducedMotion
                        ? "none"
                        : "creatoros-pulse 2s ease-in-out infinite",
                    }}
                  >
                    Scroll to explore ↓
                  </p>
                  <style>{`
                    @keyframes creatoros-pulse {
                      0%, 100% { opacity: 0.55; }
                      50% { opacity: 0.85; }
                    }
                    @media (prefers-reduced-motion: reduce) {
                      .creatoros-scroll-hint { animation: none !important; }
                    }
                  `}</style>
                </div>

                {chapters.map((chapter, i) => (
                  <div
                    key={chapter.title}
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
                {chapters.map((chapter, i) => (
                  <div
                    key={chapter.title}
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
          overflow: "hidden",
        }}
      >
        <img
          src={NOVA.finale}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 30%",
            opacity: 0.18,
            filter: "saturate(0.9)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 60% at 50% 40%, transparent 0%, #050505 75%)",
          }}
        />
        <h2
          style={{
            position: "relative",
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
            position: "relative",
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
