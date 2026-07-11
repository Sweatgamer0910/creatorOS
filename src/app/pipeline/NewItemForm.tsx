"use client";

import { useState, useTransition } from "react";
import { createContentItem } from "@/lib/pipeline/actions";
import Spinner from "@/components/Spinner";

function minDelay<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.all([promise, new Promise((r) => setTimeout(r, ms))]).then(
    ([result]) => result
  );
}

export default function NewItemForm() {
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    startTransition(async () => {
      await minDelay(createContentItem(title), 500);
      setTitle("");
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-3 p-5 rounded-2xl"
      style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
    >
      <input
        placeholder="New video title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1 px-3 py-2 rounded-lg outline-none"
        style={{
          backgroundColor: "var(--color-background)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text)",
        }}
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 rounded-lg font-medium flex items-center gap-2"
        style={{ backgroundColor: "var(--color-accent)", color: "#0e1116" }}
      >
        {isPending ? <Spinner size={16} variant="dark" /> : "Add to pipeline"}
      </button>
    </form>
  );
}
