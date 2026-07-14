"use client";

import { useRef, useLayoutEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BarChart3, Sparkles, Lightbulb } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const chapters = [
  {
    icon: BarChart3,
    title: "Real analytics",
    body: "Views, subscribers, and watch time — pulled directly from YouTube, not guessed at.",
  },
  {
    icon: Sparkles,
    title: "AI Growth Coach",
    body: "Honest, evidence-backed insights — labeled by confidence, never fabricated.",
  },
  {
    icon: Lightbulb,
    title: "Full content pipeline",
    body: "Ideas, scripts, and your upload schedule — all in one place, start to finish.",
  },
];

export default function ScrollScene() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panels = panelsRef.current.filter(Boolean) as HTMLDivElement[];

      gsap.set(panels, { autoAlpha: 0, y: 24 });
      gsap.set(panels[0], { autoAlpha: 1, y: 0 });

      ScrollTrigger.create({
        trigger: wrapperRef.current,
        start: "top top",
        end: () => `+=${(chapters.length - 1) * 100}%`,
        pin: true,
        snap: {
          snapTo: 1 / (chapters.length - 1),
          duration: 0.5,
          ease: "power2.inOut",
        },
        onUpdate: (self) => {
          const rawIndex = self.progress * (chapters.length - 1);
          const nearestIndex = Math.round(rawIndex);

          if (nearestIndex !== activeIndexRef.current) {
            const outgoing = panels[activeIndexRef.current];
            const incoming = panels[nearestIndex];

            if (outgoing) {
              gsap.to(outgoing, {
                autoAlpha: 0,
                y: -24,
                duration: 0.35,
                ease: "power2.in",
              });
            }
            if (incoming) {
              gsap.fromTo(
                incoming,
                { autoAlpha: 0, y: 24 },
                { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" },
              );
            }

            activeIndexRef.current = nearestIndex;
            setActiveIndex(nearestIndex);
          }
        },
      });
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{ position: "relative", height: "100vh", overflow: "hidden" }}
    >
      <div
        style={{ position: "absolute", inset: 0, backgroundColor: "#050505" }}
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
          <div style={{ maxWidth: 420, position: "relative", height: 220 }}>
            {chapters.map((chapter, i) => (
              <div
                key={i}
                ref={(el) => {
                  panelsRef.current[i] = el;
                }}
                style={{ position: "absolute", top: 0, left: 0, width: "100%" }}
              >
                <chapter.icon size={28} color="var(--color-accent)" />
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 32,
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

            <div
              className="flex items-center gap-2"
              style={{ position: "absolute", bottom: -40, left: 0 }}
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
  );
}
