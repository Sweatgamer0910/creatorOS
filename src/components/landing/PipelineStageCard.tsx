"use client";

import { confidenceMeta, type PipelineStage } from "./pipelineStages";

export default function PipelineStageCard({
  stage,
  side,
  isActive,
  reducedMotion,
}: {
  stage: PipelineStage;
  side: "left" | "right";
  isActive: boolean;
  reducedMotion: boolean;
}) {
  const confidence = confidenceMeta[stage.confidence];

  return (
    <section
      style={{
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: side === "left" ? "flex-start" : "flex-end",
        padding: "0 32px",
      }}
    >
      <div
        style={{
          maxWidth: 420,
          padding: 32,
          borderRadius: 16,
          background: "rgba(14,17,22,0.55)",
          border: `1px solid ${isActive ? "rgba(245,166,35,0.35)" : "rgba(245,243,238,0.08)"}`,
          backdropFilter: "blur(20px) saturate(140%)",
          WebkitBackdropFilter: "blur(20px) saturate(140%)",
          textAlign: side === "right" ? "right" : "left",
          opacity: isActive ? 1 : 0.35,
          transform: isActive || reducedMotion ? "translateY(0)" : "translateY(14px)",
          boxShadow: isActive ? "0 0 40px -12px rgba(245,166,35,0.55)" : "none",
          transition: reducedMotion
            ? "opacity 0.3s ease, border-color 0.3s ease"
            : "opacity 0.5s ease, transform 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "#F5A623",
            letterSpacing: "0.08em",
            marginBottom: 14,
            display: "block",
          }}
        >
          {stage.index}
        </span>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            marginBottom: 12,
            color: "#F5F3EE",
          }}
        >
          {stage.title}
        </h3>
        <p style={{ color: "#9AA0AC", fontSize: 15, marginBottom: 18, lineHeight: 1.5 }}>
          {stage.body}
        </p>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            borderRadius: 100,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.03em",
            border: "1px solid rgba(245,243,238,0.08)",
            background: "rgba(255,255,255,0.03)",
            color: "#9AA0AC",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: confidence.color,
              flexShrink: 0,
            }}
          />
          {confidence.label}
        </span>
      </div>
    </section>
  );
}
