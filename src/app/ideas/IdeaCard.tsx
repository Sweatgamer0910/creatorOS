"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteIdea } from "@/lib/ideas/actions";

interface Idea {
  id: string;
  title: string;
  notes: string | null;
  createdAt: Date;
}

export default function IdeaCard({ idea }: { idea: Idea }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteIdea(idea.id);
    });
  }

  return (
    <div
      className="flex items-start justify-between p-4 rounded-xl"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
          {idea.title}
        </div>
        {idea.notes && (
          <p
            style={{
              fontSize: 13,
              color: "var(--color-text-muted)",
              marginTop: 4,
            }}
          >
            {idea.notes}
          </p>
        )}
      </div>
      <button
        onClick={handleDelete}
        disabled={isPending}
        style={{ color: "var(--color-text-muted)" }}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
