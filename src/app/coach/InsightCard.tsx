import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CoachInsight } from "@/lib/growth-coach";
import Card from "@/components/ui/Card";
import Sparkline from "@/components/Sparkline";
import { insightActions } from "./insightActions";

const typeLabels: Record<CoachInsight["type"], string> = {
  fact: "Fact",
  pattern: "Pattern",
  recommendation: "Recommendation",
  hypothesis: "Hypothesis",
};

const typeColors: Record<CoachInsight["type"], string> = {
  fact: "var(--color-text-muted)",
  pattern: "var(--color-accent-teal)",
  recommendation: "var(--color-accent)",
  hypothesis: "#e0a020",
};

const confidenceLabels: Record<CoachInsight["confidence"], string> = {
  high: "High confidence",
  medium: "Medium confidence",
  exploratory: "Exploratory",
};

// `emphasized` gives a recommendation-type insight the "your next move"
// treatment (bigger padding/type, no confidence-label content change) when
// it's promoted to the top of the page — same Fact/Pattern/Recommendation/
// Hypothesis labeling either way, this only changes prominence.
export default function InsightCard({
  insight,
  emphasized = false,
  isNew = false,
}: {
  insight: CoachInsight;
  emphasized?: boolean;
  isNew?: boolean;
}) {
  const action = insightActions[insight.id];

  return (
    <Card
      padding={emphasized ? "md" : "sm"}
      accentBorder={typeColors[insight.type]}
      style={
        emphasized ? { backgroundColor: "rgba(245,166,35,0.05)" } : undefined
      }
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span
            style={{
              color: typeColors[insight.type],
              fontWeight: 700,
              fontSize: emphasized ? 12 : 11,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {typeLabels[insight.type]}
          </span>
          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            {confidenceLabels[insight.confidence]}
          </span>
        </div>
        {isNew && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              color: "var(--color-accent)",
              backgroundColor: "rgba(245,166,35,0.14)",
              border: "1px solid rgba(245,166,35,0.3)",
              borderRadius: 999,
              padding: "2px 8px",
              flexShrink: 0,
            }}
          >
            New
          </span>
        )}
      </div>
      <p
        style={{
          margin: 0,
          color: "var(--color-text)",
          fontSize: emphasized ? 16 : 14,
          fontWeight: emphasized ? 500 : 400,
          lineHeight: 1.6,
        }}
      >
        {insight.message}
      </p>
      {insight.evidence && (
        <p
          style={{
            marginTop: 8,
            fontSize: 12,
            color: "var(--color-text-muted)",
            fontStyle: "italic",
          }}
        >
          {insight.evidence}
        </p>
      )}
      {insight.trendData && insight.trendData.length >= 2 && (
        <div style={{ marginTop: 10, maxWidth: 220 }}>
          <Sparkline
            data={insight.trendData}
            color={typeColors[insight.type]}
            height={24}
          />
        </div>
      )}
      {action && (
        <Link
          href={action.href}
          className="glow-text"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: 12,
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-accent)",
            textDecoration: "none",
          }}
        >
          {action.label}
          <ArrowRight size={14} />
        </Link>
      )}
    </Card>
  );
}
