"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Button from "@/components/ui/button";
import type { Size } from "@/lib/onboarding/positioning";

const WIDTH = 300;

export default function TourWidget({
  x,
  y,
  title,
  body,
  stepIndex,
  stepCount,
  isFirst,
  isLast,
  onBack,
  onNext,
  onSkip,
  onMeasure,
  reducedMotion,
}: {
  x: number;
  y: number;
  title: string;
  body: string;
  stepIndex: number;
  stepCount: number;
  isFirst: boolean;
  isLast: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  onMeasure: (size: Size) => void;
  reducedMotion: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  // Body copy length varies a lot by step, so the widget's real height
  // isn't known until it renders — measure it and report back up so the
  // host can recompute the anchor position against the actual size
  // instead of a guess (the fly-to animation just smoothly retargets,
  // since it's already an animated spring rather than a hard jump).
  useEffect(() => {
    if (!rootRef.current) return;
    const el = rootRef.current;
    const report = () =>
      onMeasure({ width: el.offsetWidth, height: el.offsetHeight });
    report();
    const observer = new ResizeObserver(report);
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, body]);

  return (
    <motion.div
      ref={rootRef}
      initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
      animate={reducedMotion ? { x, y } : { x, y, opacity: 1, scale: 1 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 260, damping: 28 }
      }
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: WIDTH,
        zIndex: 302,
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      <div
        className="nova-pulse"
        style={{
          flexShrink: 0,
          width: 44,
          height: 44,
          borderRadius: "50%",
          backgroundColor: "var(--color-surface)",
          border: "1px solid rgba(var(--glow-amber-rgb), 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Image
          src="/nova-avatar.png"
          alt=""
          width={44}
          height={44}
          style={{ objectFit: "cover" }}
        />
      </div>

      <div
        style={{
          flex: 1,
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 20,
          padding: 16,
          boxShadow: "0 12px 32px -12px rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 15,
            fontWeight: 600,
            color: "var(--color-text)",
          }}
        >
          {title}
        </div>
        <p
          style={{
            fontSize: 13,
            color: "var(--color-text-muted)",
            marginTop: 6,
            lineHeight: 1.55,
          }}
        >
          {body}
        </p>
        <div
          className="flex items-center justify-between"
          style={{ marginTop: 14 }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--color-text-muted)",
            }}
          >
            {stepIndex + 1} / {stepCount}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="text" size="sm" onClick={onSkip}>
              Skip
            </Button>
            {!isFirst && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                Back
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={onNext}>
              {isLast ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
