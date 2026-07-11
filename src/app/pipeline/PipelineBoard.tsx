"use client";

import { useState, useEffect, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { updateContentItemStatus, deleteContentItem, PipelineStatus } from "@/lib/pipeline/actions";
import Spinner from "@/components/Spinner";

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

function Card({ item }: { item: ContentItem }) {
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
      className="flex items-center justify-between p-3 rounded-lg cursor-grab active:cursor-grabbing"
      style={{ backgroundColor: "var(--color-background)", border: "1px solid var(--color-border)" }}
    >
      <span style={{ fontSize: 14 }}>{item.title}</span>
      <button onClick={handleDelete} disabled={isDeleting} style={{ color: "var(--color-text-muted)" }}>
        {isDeleting ? <Spinner size={12} /> : <Trash2 size={14} />}
      </button>
    </div>
  );
}

export default function PipelineBoard({ items: initialItems }: { items: ContentItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  function handleDrop(e: React.DragEvent, status: PipelineStatus) {
    e.preventDefault();
    setDragOverCol(null);
    const id = e.dataTransfer.getData("text/plain");

    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    startTransition(async () => {
      await updateContentItemStatus(id, status);
    });
  }

  return (
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
            className="p-3 rounded-2xl min-h-[300px] flex flex-col gap-2"
            style={{
              backgroundColor: "var(--color-surface)",
              border: isOver ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
              transition: "border-color 0.15s",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14 }}>
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
              <Card key={item.id} item={item} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
