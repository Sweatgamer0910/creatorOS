"use client";

import { useState, useTransition } from "react";
import { createContentItem } from "@/lib/pipeline/actions";
import Button from "@/components/ui/button";
import Card from "@/components/ui/Card";
import { radius, spacing } from "@/lib/design-tokens";

function minDelay<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.all([promise, new Promise((r) => setTimeout(r, ms))]).then(
    ([result]) => result,
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
    <Card>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          placeholder="New video title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1"
          style={{
            backgroundColor: "var(--color-background)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
            borderRadius: radius.sm,
            padding: `${spacing.sm}px ${spacing.md}px`,
            outline: "none",
          }}
        />
        <Button type="submit" loading={isPending}>
          Add to pipeline
        </Button>
      </form>
    </Card>
  );
}
