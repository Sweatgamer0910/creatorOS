"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { deleteIdea, updateIdea } from "@/lib/ideas/actions";
import InteractiveCard from "@/components/ui/InteractiveCard";
import Button from "@/components/ui/button";
import ConfirmDeleteButton from "@/components/ui/ConfirmDeleteButton";
import SeriesBadge from "@/components/SeriesBadge";
import { radius, spacing } from "@/lib/design-tokens";

export interface Idea {
  id: string;
  title: string;
  notes: string | null;
  createdAt: Date;
  episodeNumber?: number | null;
  series?: { id: string; title: string } | null;
}

const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--color-background)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  borderRadius: radius.sm,
  padding: `${spacing.sm}px ${spacing.md}px`,
  outline: "none",
  fontFamily: "var(--font-body)",
  width: "100%",
};

export default function IdeaCard({ idea }: { idea: Idea }) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(idea.title);
  const [notes, setNotes] = useState(idea.notes ?? "");

  function handleDelete() {
    startTransition(async () => {
      await deleteIdea(idea.id);
    });
  }

  function openEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setTitle(idea.title);
    setNotes(idea.notes ?? "");
    setIsEditing(true);
  }

  function cancelEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setIsEditing(false);
  }

  function handleSave(e: React.MouseEvent) {
    e.stopPropagation();
    if (!title.trim()) return;
    startTransition(async () => {
      await updateIdea(idea.id, title.trim(), notes);
      setIsEditing(false);
    });
  }

  if (isEditing) {
    return (
      <InteractiveCard>
        <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
          <input
            autoFocus
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
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              loading={isPending}
              disabled={!title.trim()}
            >
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelEdit}
              disabled={isPending}
              style={{ border: "none", backgroundColor: "transparent" }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </InteractiveCard>
    );
  }

  return (
    <InteractiveCard onClick={() => setIsEditing(true)}>
      <div className="flex items-start justify-between">
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
            {idea.title}
          </div>
          {idea.series && (
            <div style={{ marginTop: 6 }}>
              <SeriesBadge
                id={idea.series.id}
                title={idea.series.title}
                episodeNumber={idea.episodeNumber}
              />
            </div>
          )}
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
        <div className="flex items-center gap-1" style={{ flexShrink: 0 }}>
          <Button
            variant="ghost"
            iconOnly
            size="sm"
            onClick={openEdit}
            aria-label="Edit idea"
            style={{
              border: "none",
              backgroundColor: "transparent",
              color: "var(--color-text-muted)",
            }}
          >
            <Pencil size={16} />
          </Button>
          <ConfirmDeleteButton
            onConfirm={handleDelete}
            loading={isPending}
            ariaLabel="Delete idea"
          />
        </div>
      </div>
    </InteractiveCard>
  );
}
