"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createScript } from "@/lib/scripts/actions";
import Button from "@/components/ui/button";
import Card from "@/components/ui/Card";
import { radius, spacing } from "@/lib/design-tokens";

function minDelay<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.all([promise, new Promise((r) => setTimeout(r, ms))]).then(
    ([result]) => result,
  );
}

export default function NewScriptForm() {
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    startTransition(async () => {
      const script = await minDelay(createScript(title), 500);
      router.push(`/scripts/${script.id}`);
    });
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          placeholder="New script title"
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
          Create
        </Button>
      </form>
    </Card>
  );
}
