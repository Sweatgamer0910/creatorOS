"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { Trash2, Link2 } from "lucide-react";
import {
  updateContentItemStatus,
  updateContentItemLink,
  deleteContentItem,
} from "@/lib/pipeline/actions";
import { PIPELINE_STAGES, type PipelineStatus } from "@/lib/pipeline/stages";
import Spinner from "@/components/Spinner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/button";
import SeriesBadge from "@/components/SeriesBadge";
import { radius, spacing } from "@/lib/design-tokens";

interface ContentItem {
  id: string;
  title: string;
  status: string;
  dueDate: Date | null;
  idea: {
    id: string;
    title: string;
    episodeNumber: number | null;
    series: { id: string; title: string } | null;
  } | null;
  script: { id: string; title: string } | null;
}

const columns = PIPELINE_STAGES;

const linkSelectStyle: React.CSSProperties = {
  backgroundColor: "var(--color-background)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  borderRadius: radius.sm,
  padding: `${spacing.xs}px ${spacing.sm}px`,
  outline: "none",
  fontSize: 12,
};

function ItemCard({
  item,
  ideas,
  scripts,
}: {
  item: ContentItem;
  ideas: { id: string; title: string }[];
  scripts: { id: string; title: string }[];
}) {
  const [isDeleting, startDelete] = useTransition();
  const [isLinking, startLinking] = useTransition();
  const [showLinkEditor, setShowLinkEditor] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  function reportCardError(message: string) {
    setCardError(message);
    setTimeout(() => setCardError(null), 4000);
  }

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData("text/plain", item.id);
  }

  function handleDelete() {
    startDelete(async () => {
      try {
        await deleteContentItem(item.id);
      } catch (e) {
        console.error("[PipelineBoard] Failed to delete item:", e);
        reportCardError("Couldn't delete — try again.");
      }
    });
  }

  function handleLink(value: string) {
    const [kind, id] = value ? value.split(":") : ["", ""];
    const link =
      kind === "idea"
        ? { ideaId: id, scriptId: null }
        : kind === "script"
          ? { ideaId: null, scriptId: id }
          : { ideaId: null, scriptId: null };
    setShowLinkEditor(false);
    startLinking(async () => {
      try {
        await updateContentItemLink(item.id, link);
      } catch (e) {
        console.error("[PipelineBoard] Failed to update link:", e);
        reportCardError("Couldn't save that link — try again.");
      }
    });
  }

  const currentLinkValue = item.idea
    ? `idea:${item.idea.id}`
    : item.script
      ? `script:${item.script.id}`
      : "";

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="cursor-grab active:cursor-grabbing"
    >
      <Card padding="sm" style={{ backgroundColor: "var(--color-background)" }}>
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 14 }}>{item.title}</span>
          <Button
            variant="ghost"
            iconOnly
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="Delete item"
            style={{
              border: "none",
              backgroundColor: "transparent",
              color: "var(--color-text-muted)",
            }}
          >
            {isDeleting ? <Spinner size={12} /> : <Trash2 size={14} />}
          </Button>
        </div>

        {!showLinkEditor && (item.idea || item.script) && (
          <div className="flex items-center gap-1" style={{ marginTop: 6 }}>
            <Link
              href={item.idea ? "/ideas" : `/scripts/${item.script!.id}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                textDecoration: "none",
              }}
            >
              from: {item.idea ? item.idea.title : item.script!.title}
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowLinkEditor(true);
              }}
              aria-label="Change link"
              style={{
                background: "none",
                border: "none",
                padding: 2,
                cursor: "pointer",
                color: "var(--color-text-muted)",
                display: "inline-flex",
              }}
            >
              <Link2 size={11} />
            </button>
          </div>
        )}

        {!showLinkEditor && !item.idea && !item.script && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowLinkEditor(true);
            }}
            style={{
              marginTop: 6,
              background: "none",
              border: "none",
              padding: 0,
              fontSize: 11,
              color: "var(--color-accent-teal)",
              cursor: "pointer",
            }}
          >
            + Link
          </button>
        )}

        {showLinkEditor && (
          <div
            className="flex items-center gap-2"
            style={{ marginTop: 6 }}
            onClick={(e) => e.stopPropagation()}
          >
            <select
              value={currentLinkValue}
              onChange={(e) => handleLink(e.target.value)}
              style={linkSelectStyle}
            >
              <option value="">None</option>
              {ideas.length > 0 && (
                <optgroup label="Ideas">
                  {ideas.map((idea) => (
                    <option key={idea.id} value={`idea:${idea.id}`}>
                      {idea.title}
                    </option>
                  ))}
                </optgroup>
              )}
              {scripts.length > 0 && (
                <optgroup label="Scripts">
                  {scripts.map((script) => (
                    <option key={script.id} value={`script:${script.id}`}>
                      {script.title}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowLinkEditor(false);
              }}
            >
              Cancel
            </Button>
            {isLinking && <Spinner size={12} />}
          </div>
        )}

        {item.idea?.series && (
          <div style={{ marginTop: 6 }}>
            <SeriesBadge
              id={item.idea.series.id}
              title={item.idea.series.title}
              episodeNumber={item.idea.episodeNumber}
            />
          </div>
        )}

        {cardError && (
          <div style={{ marginTop: 6, fontSize: 11, color: "#e35d5d" }}>
            {cardError}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function PipelineBoard({
  items: initialItems,
  ideas = [],
  scripts = [],
}: {
  items: ContentItem[];
  ideas?: { id: string; title: string }[];
  scripts?: { id: string; title: string }[];
}) {
  const [items, setItems] = useState(initialItems);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(initialItems);
  }, [initialItems]);

  function handleDrop(e: React.DragEvent, status: PipelineStatus) {
    e.preventDefault();
    setDragOverCol(null);
    const id = e.dataTransfer.getData("text/plain");
    const previousStatus = items.find((i) => i.id === id)?.status;
    if (!previousStatus || previousStatus === status) return;

    setError(null);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));

    startTransition(async () => {
      try {
        await updateContentItemStatus(id, status);
      } catch {
        // Without this, a failed save left the card visually in the new
        // column even though nothing persisted — silently out of sync with
        // the database until the next full page load.
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: previousStatus } : i)),
        );
        setError("Couldn't save that move — try again.");
        setTimeout(() => setError(null), 4000);
      }
    });
  }

  return (
    <div>
      {error && (
        <div
          style={{
            marginBottom: 12,
            padding: "8px 12px",
            borderRadius: 8,
            backgroundColor: "rgba(227,93,93,0.1)",
            border: "1px solid rgba(227,93,93,0.3)",
            color: "#e35d5d",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {columns.map((col) => {
          const colItems = items.filter((i) => i.status === col.status);
          const isOver = dragOverCol === col.status;

          return (
            <div
              key={col.status}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverCol(col.status);
              }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => handleDrop(e, col.status)}
              className="p-3 flex flex-col gap-2"
              style={{
                backgroundColor: "var(--color-surface)",
                border: isOver
                  ? "1px solid var(--color-accent)"
                  : "1px solid var(--color-border)",
                borderRadius: radius.xl,
                minHeight: 300,
                transition: "border-color 0.15s",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  {col.label}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--color-text-muted)",
                  }}
                >
                  {colItems.length}
                </span>
              </div>
              {colItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  ideas={ideas}
                  scripts={scripts}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
