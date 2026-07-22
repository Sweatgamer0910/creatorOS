import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSeriesById } from "@/lib/series/actions";
import { computeIdeaStage } from "@/lib/series/stage";
import Card from "@/components/ui/Card";

const CADENCE_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Biweekly",
  custom: "Custom",
};

const PIPELINE_STATUS_LABELS: Record<string, string> = {
  idea: "Idea",
  filming: "Filming",
  editing: "Editing",
  published: "Published",
};

const STAGE_COLORS: Record<string, string> = {
  "Idea only": "var(--color-text-muted)",
  Scripted: "#5fb3e0",
  "In pipeline": "var(--color-accent)",
  Published: "var(--color-accent-teal)",
};

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id } = await params;
  const series = await getSeriesById(id);
  if (!series) notFound();

  return (
    <div style={{ padding: "24px 40px 48px", maxWidth: 900, margin: "0 auto" }}>
      <Link
        href="/series"
        className="glow-text"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          color: "var(--color-text-muted)",
          textDecoration: "none",
        }}
      >
        <ArrowLeft size={14} />
        All series
      </Link>

      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(28px, 3.5vw, 36px)",
          marginTop: 10,
        }}
      >
        {series.title}
      </h1>

      <div
        className="flex items-center gap-3 flex-wrap"
        style={{ marginTop: 8 }}
      >
        {series.cadence && (
          <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
            {CADENCE_LABELS[series.cadence] ?? series.cadence} cadence
          </span>
        )}
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "var(--color-text-muted)",
          }}
        >
          {series.ideas.length}{" "}
          {series.ideas.length === 1 ? "episode" : "episodes"}
        </span>
      </div>

      {series.description && (
        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: 16,
            marginTop: 10,
            maxWidth: 640,
            lineHeight: 1.6,
          }}
        >
          {series.description}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3">
        {series.ideas.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
            No ideas in this series yet — add one from the Idea Lab.
          </p>
        ) : (
          series.ideas.map((idea) => {
            const stage = computeIdeaStage(idea);
            return (
              <Card
                key={idea.id}
                padding="sm"
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {idea.episodeNumber != null && (
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                        color: "var(--color-text-muted)",
                        minWidth: 28,
                      }}
                    >
                      #{idea.episodeNumber}
                    </span>
                  )}
                  <span style={{ fontSize: 14 }}>{idea.title}</span>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color:
                      STAGE_COLORS[stage.label] ?? "var(--color-text-muted)",
                  }}
                >
                  {stage.label}
                  {stage.label === "In pipeline" &&
                    ` — ${PIPELINE_STATUS_LABELS[stage.pipelineStatus] ?? stage.pipelineStatus}`}
                </span>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
