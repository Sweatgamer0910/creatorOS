"use client";

import { useState, useEffect, useTransition } from "react";
import { Trash2 } from "lucide-react";
import {
  updateContentItemStatus,
  deleteContentItem,
  PipelineStatus,
} from "@/lib/pipeline/actions";
import Spinner from "@/components/Spinner";
import Card from "@/components/ui/Card";
import { radius } from "@/lib/design-tokens";

interface ContentItem {
  id: string;
  title: string;
  status: string;
  dueDate: Date | null;
}

const columns: { status: PipelineStatus; label: string }[] = [
  { status: "idea", label: "Idea" },
  { status: "filming", label: "Filming" },
  { status: "editing", label: "Editing" },
  { status: "published", label: "Published" },
];

function ItemCard({ item }: { item: ContentItem }) {
  const [isDeleting, startDelete] = useTransition();

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData("text/plain", item.id);
  }

  function handleDelete() {
    startDelete(async () => {
      await deleteContentItem(item.id);
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
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
              color: "var(--color-text-muted)",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            {isDeleting ? <Spinner size={12} /> : <Trash2 size={14} />}
          </button>
        </div>
      </Card>
    </div>
  );
}

export default function PipelineBoard({
  items: initialItems,
}: {
  items: ContentItem[];
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
