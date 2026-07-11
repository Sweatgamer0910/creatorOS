"use client";

import { useState, useTransition } from "react";
import { createIdea } from "@/lib/ideas/actions";

export default function IdeaForm() {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    startTransition(async () => {
      await createIdea(title, notes);
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
        className="self-start px-4 py-2 rounded-lg font-medium"
        style={{ backgroundColor: "var(--color-accent)", color: "#0e1116" }}
      >
        {isPending ? "Saving..." : "Add idea"}
      </button>
    </form>
  );
}
