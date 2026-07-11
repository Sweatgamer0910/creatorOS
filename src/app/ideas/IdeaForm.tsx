"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { createIdea } from "@/lib/ideas/actions";
import Spinner from "@/components/Spinner";
import LockedFeature from "@/components/LockedFeature";

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

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 p-5 rounded-2xl"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
          New idea
        </span>
        <LockedFeature label="AI-suggested ideas">
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
            style={{
              backgroundColor: "var(--color-surface-hover)",
              color: "var(--color-text)",
            }}
          >
            <Sparkles size={14} />
            Suggest ideas with AI
          </button>
        </LockedFeature>
      </div>

      <input
        placeholder="Idea title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="px-3 py-2 rounded-lg outline-none"
        style={{
          backgroundColor: "var(--color-background)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text)",
        }}
      />
      <textarea
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        className="px-3 py-2 rounded-lg outline-none resize-none"
        style={{
          backgroundColor: "var(--color-background)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text)",
        }}
      />
      <button
        type="submit"
        disabled={isPending}
        className="self-start px-4 py-2 rounded-lg font-medium flex items-center gap-2"
        style={{ backgroundColor: "var(--color-accent)", color: "#0e1116" }}
      >
        {isPending ? (
          <>
            <Spinner size={16} variant="dark" />
            Saving...
          </>
        ) : (
          "Add idea"
        )}
      </button>
    </form>
  );
}
