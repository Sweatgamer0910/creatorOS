"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Minus, Plus } from "lucide-react";
import Button from "@/components/ui/button";
import { ScriptSections } from "@/lib/scripts/wordCount";

const SPEED_MIN = 0.5;
const SPEED_MAX = 3;
const SPEED_STEP = 0.25;
const PX_PER_SECOND_AT_1X = 36; // was 0.6px/frame assuming 60fps — now framerate-independent
// requestAnimationFrame pauses in background tabs; without this cap, coming
// back to a stale tab produces one giant dt and the text leaps forward.
const MAX_DT_MS = 100;

export default function Teleprompter({
  sections,
  onClose,
}: {
  sections: ScriptSections;
  onClose: () => void;
}) {
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  // scrollTop is rounded to whole pixels by the browser on every read/write,
  // so accumulating via `scrollTop += fraction` compounds rounding error
  // into visibly irregular, jittery per-frame jumps. Tracking the
  // fractional remainder ourselves and only ever nudging scrollTop by whole
  // pixels keeps the motion even — while still using `+=` (not an absolute
  // assignment) so a manual wheel-scroll mid-playback isn't fought.
  const carryRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    function tick(now: number) {
      if (lastTimeRef.current == null) lastTimeRef.current = now;
      const dt = Math.min(now - lastTimeRef.current, MAX_DT_MS);
      lastTimeRef.current = now;

      if (containerRef.current && playing) {
        const wanted =
          carryRef.current + speed * PX_PER_SECOND_AT_1X * (dt / 1000);
        const whole = Math.trunc(wanted);
        carryRef.current = wanted - whole;
        if (whole !== 0) containerRef.current.scrollTop += whole;
      }
      frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      lastTimeRef.current = null;
    };
  }, [speed, playing]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const full = [sections.hook, sections.intro, sections.body, sections.outro]
    .filter(Boolean)
    .join("\n\n");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "rgba(3,3,4,0.97)",
        backdropFilter: "blur(20px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={() =>
              setSpeed((s) => Math.max(SPEED_MIN, +(s - SPEED_STEP).toFixed(2)))
            }
            aria-label="Slower"
          >
            <Minus size={14} />
          </Button>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "var(--color-text-muted)",
              minWidth: 48,
              textAlign: "center",
            }}
          >
            {speed.toFixed(2)}x
          </span>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={() =>
              setSpeed((s) => Math.min(SPEED_MAX, +(s + SPEED_STEP).toFixed(2)))
            }
            aria-label="Faster"
          >
            <Plus size={14} />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? "Pause" : "Play"}
          </Button>
        </div>
        <Button
          variant="ghost"
          iconOnly
          onClick={onClose}
          aria-label="Close teleprompter"
        >
          <X size={18} />
        </Button>
      </div>
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20vh 10vw 60vh",
          fontFamily: "var(--font-display)",
          fontSize: "clamp(22px, 3.6vw, 38px)",
          lineHeight: 1.6,
          color: "var(--color-text)",
          whiteSpace: "pre-wrap",
        }}
      >
        {full || "Nothing written yet."}
      </div>
    </motion.div>
  );
}
