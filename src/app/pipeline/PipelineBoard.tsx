"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { Trash2, Link2 } from "lucide-react";
import {
  updateContentItemStatus,
  updateContentItemLink,
  deleteContentItem,
} from "@/lib/pipeline/actions";
import {
  PIPELINE_STAGES,
  PIPELINE_STAGE_LABELS,
  type PipelineStatus,
} from "@/lib/pipeline/stages";
import Spinner from "@/components/Spinner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/button";
import SeriesBadge from "@/components/SeriesBadge";
import { radius, spacing } from "@/lib/design-tokens";
import { useIsNarrowViewport } from "@/hooks/useIsNarrowViewport";

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
  // Flex items default to a content-based min-width, so a <select> with a
  // long selected option (or just its native OS-rendered arrow chrome) can
  // demand more width than the row has and spill past the card's edge
  // instead of shrinking — this is what was going off the card on mobile.
  flex: "1 1 0%",
  minWidth: 0,
  width: "100%",
};

function ItemCard({
  item,
  ideas,
  scripts,
  onMove,
}: {
  item: ContentItem;
  ideas: { id: string; title: string }[];
  scripts: { id: string; title: string }[];
  // Only passed on mobile. Desktop moves cards by dragging between columns,
  // which has no touch equivalent — this renders an explicit "Move to"
  // control instead so a stage change is still possible on a phone. Left
  // undefined on desktop, so nothing here changes there.
  onMove?: (id: string, status: PipelineStatus) => void;
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

  // Idea and script are independent — changing one leaves the other exactly
  // as it was, so a card can end up linked to both at once instead of the
  // old one-or-the-other behavior.
  function handleLinkChange(field: "idea" | "script", value: string) {
    const nextIdeaId =
      field === "idea" ? value || null : (item.idea?.id ?? null);
    const nextScriptId =
      field === "script" ? value || null : (item.script?.id ?? null);
    startLinking(async () => {
      try {
        await updateContentItemLink(item.id, {
          ideaId: nextIdeaId,
          scriptId: nextScriptId,
        });
      } catch (e) {
        console.error("[PipelineBoard] Failed to update link:", e);
        reportCardError("Couldn't save that link — try again.");
      }
    });
  }

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
          <div
            className="flex items-start justify-between gap-1"
            style={{ marginTop: 6 }}
          >
            <div className="flex flex-col" style={{ gap: 2 }}>
              {item.idea && (
                <Link
                  href="/ideas"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                    textDecoration: "none",
                  }}
                >
                  idea: {item.idea.title}
                </Link>
              )}
              {item.script && (
                <Link
                  href={`/scripts/${item.script.id}`}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                    textDecoration: "none",
                  }}
                >
                  script: {item.script.title}
                </Link>
              )}
            </div>
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
                flexShrink: 0,
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
            className="flex flex-col gap-2"
            style={{ marginTop: 6 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span
                style={{
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  width: 36,
                  flexShrink: 0,
                }}
              >
                Idea
              </span>
              <select
                value={item.idea?.id ?? ""}
                onChange={(e) => handleLinkChange("idea", e.target.value)}
                style={linkSelectStyle}
              >
                <option value="">None</option>
                {ideas.map((idea) => (
                  <option key={idea.id} value={idea.id}>
                    {idea.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span
                style={{
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  width: 36,
                  flexShrink: 0,
                }}
              >
                Script
              </span>
              <select
                value={item.script?.id ?? ""}
                onChange={(e) => handleLinkChange("script", e.target.value)}
                style={linkSelectStyle}
              >
                <option value="">None</option>
                {scripts.map((script) => (
                  <option key={script.id} value={script.id}>
                    {script.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLinkEditor(false);
                }}
              >
                Done
              </Button>
              {isLinking && <Spinner size={12} />}
            </div>
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

        {onMove && (
          <div
            className="flex items-center gap-2"
            style={{ marginTop: 8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <span
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                flexShrink: 0,
              }}
            >
              Move to
            </span>
            <select
              value={item.status}
              onChange={(e) =>
                onMove(item.id, e.target.value as PipelineStatus)
              }
              style={linkSelectStyle}
            >
              {PIPELINE_STAGES.map((stage) => (
                <option key={stage.status} value={stage.status}>
                  {stage.label}
                </option>
              ))}
            </select>
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
  const isNarrow = useIsNarrowViewport();
  const [activeStatus, setActiveStatus] = useState<PipelineStatus>(
    columns[0].status,
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(initialItems);
  }, [initialItems]);

  // Shared by desktop drag-and-drop and mobile's explicit "Move to" select —
  // both just need "change this item's status, optimistically, roll back on
  // failure." Only how the new status is chosen differs per input method.
  function moveItem(id: string, status: PipelineStatus) {
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

  function handleDrop(e: React.DragEvent, status: PipelineStatus) {
    e.preventDefault();
    setDragOverCol(null);
    const id = e.dataTransfer.getData("text/plain");
    moveItem(id, status);
  }

  const errorBanner = error && (
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
  );

  // Mobile: dragging between columns doesn't exist as a touch gesture, and
  // stacking all 5 full-width columns vertically (the desktop grid's
  // grid-cols-1 fallback) meant scrolling past every card in "Idea" before
  // a new user even discovered "Scripted," "Filming," etc. existed. Instead:
  // every stage is a small tab (all visible at once, no scrolling needed to
  // see there are 5 stages), and picking one filters the list below to just
  // that stage's cards. Desktop's grid-of-columns branch further down is
  // completely untouched and is the only branch that renders when isNarrow
  // is false.
  if (isNarrow) {
    const activeItems = items.filter((i) => i.status === activeStatus);
    return (
      <div data-tour="pipeline-board">
        {errorBanner}
        <div className="flex flex-wrap gap-2" style={{ marginBottom: 16 }}>
          {columns.map((col) => {
            const count = items.filter((i) => i.status === col.status).length;
            const isActive = col.status === activeStatus;
            return (
              <button
                key={col.status}
                type="button"
                onClick={() => setActiveStatus(col.status)}
                className="flex items-center gap-1.5"
                style={{
                  padding: "6px 12px",
                  borderRadius: radius.full,
                  border: `1px solid ${isActive ? "var(--color-accent)" : "var(--color-border)"}`,
                  backgroundColor: isActive
                    ? "rgba(245, 166, 35, 0.12)"
                    : "var(--color-surface)",
                  color: isActive ? "var(--color-accent)" : "var(--color-text)",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {col.label}
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    opacity: 0.7,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {activeItems.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
            Nothing in {PIPELINE_STAGE_LABELS[activeStatus]} yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {activeItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                ideas={ideas}
                scripts={scripts}
                onMove={moveItem}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div data-tour="pipeline-board">
      {errorBanner}
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
