"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { createIdea } from "@/lib/ideas/actions";
import Button from "@/components/ui/button";
import Card from "@/components/ui/Card";
import LockedFeature from "@/components/LockedFeature";
import { spacing, radius } from "@/lib/design-tokens";

function minDelay<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.all([promise, new Promise((r) => setTimeout(r, ms))]).then(
    ([result]) => result,
  );
}

export default function IdeaForm() {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    startTransition(async () => {
      await minDelay(createIdea(title, notes), 500);
      setTitle("");
      setNotes("");
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
