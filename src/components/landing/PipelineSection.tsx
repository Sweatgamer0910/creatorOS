"use client";

import { useLandingScrollStore } from "@/lib/landing-scroll-store";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import PipelineStageCard from "./PipelineStageCard";
import { pipelineStages } from "./pipelineStages";

const STAGE_COUNT = pipelineStages.length;

export default function PipelineSection() {
  const reducedMotion = usePrefersReducedMotion();
  // Selector returns the rounded stage index, not the raw float progress —
  // this only re-renders the 6 cards when the ACTIVE stage actually
  // changes, not on every fractional pixel of scroll.
  const activeIndex = useLandingScrollStore((s) =>
    Math.round(s.pipelineProgress * (STAGE_COUNT - 1)),
  );

  return (
    <div id="pipeline-track" style={{ position: "relative" }}>
      {pipelineStages.map((stage, i) => (
        <PipelineStageCard
          key={stage.index}
          stage={stage}
          side={i % 2 === 0 ? "left" : "right"}
          isActive={i === activeIndex}
          reducedMotion={reducedMotion}
        />
      ))}
    </div>
  );
}
