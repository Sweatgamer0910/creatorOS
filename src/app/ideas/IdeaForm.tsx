"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { createIdea } from "@/lib/ideas/actions";
import { createSeries, SeriesCadence } from "@/lib/series/actions";
import Button from "@/components/ui/button";
import Card from "@/components/ui/Card";
import LockedFeature from "@/components/LockedFeature";
import { spacing, radius } from "@/lib/design-tokens";

function minDelay<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.all([promise, new Promise((r) => setTimeout(r, ms))]).then(
    ([result]) => result,
  );
}

const CADENCE_OPTIONS: { value: SeriesCadence; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "custom", label: "Custom" },
];

export default function IdeaForm({
  seriesList = [],
}: {
  seriesList?: { id: string; title: string }[];
}) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [showSeries, setShowSeries] = useState(false);
  const [seriesChoice, setSeriesChoice] = useState(""); // "" | "new" | <seriesId>
  const [newSeriesTitle, setNewSeriesTitle] = useState("");
  const [newSeriesCadence, setNewSeriesCadence] =
    useState<SeriesCadence>("weekly");
  const [episodeNumber, setEpisodeNumber] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    startTransition(async () => {
      let seriesId: string | undefined;

      if (seriesChoice === "new" && newSeriesTitle.trim()) {
        const series = await createSeries(newSeriesTitle, {
          cadence: newSeriesCadence,
        });
        seriesId = series.id;
      } else if (seriesChoice) {
        seriesId = seriesChoice;
      }

      const parsedEpisode = episodeNumber ? Number(episodeNumber) : undefined;

      await minDelay(
        createIdea(title, notes, {
          seriesId,
          episodeNumber:
            parsedEpisode !== undefined && !Number.isNaN(parsedEpisode)
              ? parsedEpisode
              : undefined,
        }),
        500,
      );
      setTitle("");
      setNotes("");
      setShowSeries(false);
      setSeriesChoice("");
      setNewSeriesTitle("");
      setEpisodeNumber("");
    });
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--color-background)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text)",
    borderRadius: radius.sm,
    padding: `${spacing.sm}px ${spacing.md}px`,
    outline: "none",
    fontFamily: "var(--font-body)",
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
            New idea
          </span>
          <LockedFeature label="AI-suggested ideas">
            <Button type="button" variant="secondary" size="sm">
              <Sparkles size={14} />
              Suggest ideas with AI
            </Button>
          </LockedFeature>
        </div>

        <input
          placeholder="Idea title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
        />
        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: "none" }}
        />

        {!showSeries ? (
          <button
            type="button"
            onClick={() => setShowSeries(true)}
            style={{
              alignSelf: "flex-start",
              background: "none",
              border: "none",
              padding: 0,
              fontSize: 13,
              color: "var(--color-accent-teal)",
              cursor: "pointer",
            }}
          >
            + Part of a series?
          </button>
        ) : (
          <div
            className="flex flex-col gap-2"
            style={{
              padding: spacing.md,
              borderRadius: radius.sm,
              border: "1px solid var(--color-border)",
            }}
          >
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
              Part of a series
            </span>
            <select
              value={seriesChoice}
              onChange={(e) => setSeriesChoice(e.target.value)}
              style={inputStyle}
            >
              <option value="">Not part of a series</option>
              {seriesList.map((series) => (
                <option key={series.id} value={series.id}>
                  {series.title}
                </option>
              ))}
              <option value="new">+ Create a new series</option>
            </select>

            {seriesChoice === "new" && (
              <div className="flex gap-2 flex-wrap">
                <input
                  placeholder="Series title"
                  value={newSeriesTitle}
                  onChange={(e) => setNewSeriesTitle(e.target.value)}
                  style={{ ...inputStyle, flex: 1, minWidth: 160 }}
                />
                <select
                  value={newSeriesCadence}
                  onChange={(e) =>
                    setNewSeriesCadence(e.target.value as SeriesCadence)
                  }
                  style={inputStyle}
                >
                  {CADENCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {seriesChoice && (
              <input
                type="number"
                placeholder="Episode number (optional)"
                value={episodeNumber}
                onChange={(e) => setEpisodeNumber(e.target.value)}
                style={{ ...inputStyle, maxWidth: 200 }}
              />
            )}
          </div>
        )}

        <Button
          type="submit"
          loading={isPending}
          style={{ alignSelf: "flex-start" }}
        >
          Add idea
        </Button>
      </form>
    </Card>
  );
}
