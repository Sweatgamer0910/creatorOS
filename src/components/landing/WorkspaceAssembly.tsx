"use client";

import { useLandingScrollStore } from "@/lib/landing-scroll-store";
import { useIsNarrowViewport } from "@/hooks/useIsNarrowViewport";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// Scattered starting transforms (px, relative to center) and resolved
// dashboard-slot positions, ported 1:1 from the approved prototype's
// `start`/`end`/`stagger` arrays. Deliberately not Framer Motion's
// scroll-linked useTransform pipeline here — the per-panel stagger +
// easeOutCubic math is easiest to keep exactly as authored by reading it
// straight off assemblyProgress (from the shared landing-scroll-store,
// which computes it with the same formula the prototype's own
// getProgress() used) rather than re-deriving five separate MotionValue
// chains for a fixed, one-off sequence.
const START = [
  { x: -360, y: -190, z: -120, rot: -18, scale: 0.85 },
  { x: 330, y: -160, z: -80, rot: 14, scale: 0.9 },
  { x: -300, y: 200, z: -60, rot: 10, scale: 0.88 },
  { x: 320, y: 210, z: -140, rot: -12, scale: 0.85 },
  { x: 0, y: -280, z: -100, rot: 6, scale: 0.9 },
];
const END = [
  { x: -190, y: -70 },
  { x: 60, y: -110 },
  { x: -210, y: 110 },
  { x: 70, y: 120 },
  { x: 240, y: 0 },
];
const STAGGER = [0.0, 0.05, 0.1, 0.03, 0.08];
const BEATS: [number, number][] = [
  [0, 0.3],
  [0.35, 0.62],
  [0.68, 1.0],
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function clamp01(v: number) {
  return Math.min(Math.max(v, 0), 1);
}
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function AnalyticsPanel() {
  const heights = [40, 70, 50, 90, 60];
  return (
    <div
      style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 44 }}
    >
      {heights.map((h, i) => (
        <span
          key={i}
          style={{
            flex: 1,
            height: `${h}%`,
            background: "#F5A623",
            borderRadius: 2,
            opacity: 0.75,
          }}
        />
      ))}
    </div>
  );
}
function ScriptPanel() {
  const widths = [100, 80, 60];
  return (
    <div>
      {widths.map((w, i) => (
        <span
          key={i}
          style={{
            display: "block",
            height: 7,
            borderRadius: 3,
            background: "rgba(245,243,238,0.08)",
            marginBottom: 8,
            width: `${w}%`,
          }}
        />
      ))}
    </div>
  );
}
function IdeaPanel() {
  return (
    <div>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            display: "block",
            height: 20,
            borderRadius: 6,
            background: "rgba(245,166,35,0.10)",
            border: "1px solid rgba(245,243,238,0.08)",
            marginBottom: 6,
          }}
        />
      ))}
    </div>
  );
}
function KanbanPanel() {
  return (
    <div style={{ display: "flex", gap: 6, height: 60 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            flex: 1,
            borderRadius: 6,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(245,243,238,0.08)",
          }}
        />
      ))}
    </div>
  );
}
// Mini insight rows with confidence-tier dots — the same Fact (blue) /
// Pattern (purple) / Recommendation (amber) color language the pipeline
// stage cards and ConfidenceSystem section already use, so the Coach card
// reads as "labeled insights," which is the product's actual promise.
function CoachPanel() {
  const rows = [
    { color: "#5FB3E0", width: "100%" },
    { color: "#8B7FE0", width: "78%" },
    { color: "#F5A623", width: "88%" },
  ];
  return (
    <div>
      {rows.map((row, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: row.color,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              display: "block",
              height: 7,
              borderRadius: 3,
              background: "rgba(245,243,238,0.08)",
              width: row.width,
            }}
          />
        </div>
      ))}
    </div>
  );
}

// Exactly the 5 shipped V1 features, per docs/05-roadmap/v1-production-
// checklist.md's "already solid" list + the actual app routes (/analytics,
// /coach, /ideas, /scripts, /pipeline). Channel Health Score is deliberately
// NOT one of the 5 — it was dropped from this lineup as the weakest
// feature. Don't re-add it here, and don't add anything from the deferred
// V2+ list either.
const PANELS = [
  { key: "analytics", label: "Analytics Dashboard", Content: AnalyticsPanel },
  { key: "coach", label: "AI Growth Coach", Content: CoachPanel },
  { key: "idea", label: "Idea Lab", Content: IdeaPanel },
  { key: "script", label: "Script Studio", Content: ScriptPanel },
  { key: "kanban", label: "Kanban Pipeline", Content: KanbanPanel },
];

const TEXT_BEATS = [
  <>
    Five tools. Five logins.
    <br />
    Zero shared context.
  </>,
  <>
    CreatorOS pulls them
    <br />
    into one object.
  </>,
  <>
    One workspace.
    <br />
    Every stage of the channel.
  </>,
];

function Panel({
  index,
  transform,
}: {
  index: number;
  transform: {
    x: number;
    y: number;
    z: number;
    rot: number;
    scale: number;
    opacity: number;
    blur: number;
  };
}) {
  const { Content, label } = PANELS[index];
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 220,
        padding: 18,
        borderRadius: 14,
        background: "rgba(23,27,34,0.7)",
        border: "1px solid rgba(245,243,238,0.08)",
        backdropFilter: "blur(10px)",
        zIndex: 2,
        transform: `translate(-50%,-50%) translate3d(${transform.x}px,${transform.y}px,${transform.z}px) rotate(${transform.rot}deg) scale(${transform.scale})`,
        opacity: transform.opacity,
        filter: `blur(${transform.blur}px)`,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.04em",
          color: "#9AA0AC",
          marginBottom: 12,
        }}
      >
        {label}
      </div>
      <Content />
    </div>
  );
}

/** Static, stacked fallback for narrow viewports / reduced motion — every panel visible at once, no scatter/converge, no scroll coupling. */
function StaticAssembly() {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        padding: "100px 24px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: "clamp(24px,6vw,36px)",
          textAlign: "center",
          lineHeight: 1.2,
          marginBottom: 12,
        }}
      >
        One workspace. Every stage of the channel.
      </div>
      {PANELS.map(({ key, label, Content }) => (
        <div
          key={key}
          style={{
            width: "100%",
            maxWidth: 320,
            padding: 18,
            borderRadius: 14,
            background: "rgba(23,27,34,0.7)",
            border: "1px solid rgba(245,243,238,0.08)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.04em",
              color: "#9AA0AC",
              marginBottom: 12,
            }}
          >
            {label}
          </div>
          <Content />
        </div>
      ))}
    </div>
  );
}

export default function WorkspaceAssembly() {
  const isNarrow = useIsNarrowViewport();
  const reducedMotion = usePrefersReducedMotion();
  const progress = useLandingScrollStore((s) => s.assemblyProgress);

  if (isNarrow || reducedMotion) {
    return (
      <div id="workspace-assembly-track">
        <StaticAssembly />
      </div>
    );
  }

  const panelTransforms = PANELS.map((_, i) => {
    const s = START[i];
    const e = END[i];
    const local = clamp01((progress - STAGGER[i]) / (0.75 - STAGGER[i]));
    const t = easeOutCubic(local);
    return {
      x: lerp(s.x, e.x, t),
      y: lerp(s.y, e.y, t),
      z: lerp(s.z, 0, t),
      rot: lerp(s.rot, 0, t),
      scale: lerp(s.scale, 1, t),
      opacity: lerp(0.45, 1, t),
      blur: lerp(3, 0, t),
    };
  });

  const lockT = clamp01((progress - 0.78) / 0.2);

  return (
    <div
      id="workspace-assembly-track"
      style={{ position: "relative", height: "350vh" }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100svh",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {BEATS.map((range, i) => {
          const mid = (range[0] + range[1]) / 2;
          const half = (range[1] - range[0]) / 2;
          const d = Math.abs(progress - mid);
          const opacity = d < half ? 1 - d / half : 0;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: i === 1 ? "12%" : "50%",
                transform:
                  i === 1 ? "translate(0,-50%)" : "translate(-50%,-50%)",
                maxWidth: i === 0 ? 520 : i === 1 ? 460 : 560,
                textAlign: i === 1 ? "left" : "center",
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "clamp(24px,4vw,44px)",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: i === 2 ? "#F5A623" : "#F5F3EE",
                opacity,
                zIndex: 3,
                pointerEvents: "none",
                textShadow: "0 4px 30px rgba(3,3,4,0.8)",
              }}
            >
              {TEXT_BEATS[i]}
            </div>
          );
        })}

        <svg
          viewBox="0 0 1000 600"
          preserveAspectRatio="xMidYMid meet"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
            opacity: lockT,
          }}
        >
          <line
            x1={500}
            y1={150}
            x2={500}
            y2={300}
            stroke="#F5A623"
            strokeWidth={1}
            opacity={0.6}
          />
          <line
            x1={500}
            y1={300}
            x2={260}
            y2={420}
            stroke="#F5A623"
            strokeWidth={1}
            opacity={0.6}
          />
          <line
            x1={500}
            y1={300}
            x2={740}
            y2={420}
            stroke="#F5A623"
            strokeWidth={1}
            opacity={0.6}
          />
          <line
            x1={500}
            y1={300}
            x2={180}
            y2={220}
            stroke="#F5A623"
            strokeWidth={1}
            opacity={0.6}
          />
          <line
            x1={500}
            y1={300}
            x2={820}
            y2={220}
            stroke="#F5A623"
            strokeWidth={1}
            opacity={0.6}
          />
        </svg>

        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(245,166,35,0.55), transparent 70%)",
            opacity: lockT * 0.8,
            filter: "blur(10px)",
            zIndex: 0,
          }}
        />

        {panelTransforms.map((transform, i) => (
          <Panel key={PANELS[i].key} index={i} transform={transform} />
        ))}
      </div>
    </div>
  );
}
