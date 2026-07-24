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

const selectStyle: React.CSSProperties = {
  backgroundColor: "var(--color-background)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  borderRadius: radius.sm,
  padding: `${spacing.sm}px ${spacing.md}px`,
  outline: "none",
  fontSize: 14,
};

function scriptTitleFor(idea: { title: string }) {
  return `${idea.title}'s script`;
}

export default function NewScriptForm({
  ideas = [],
  initialIdeaId,
}: {
  ideas?: { id: string; title: string }[];
  initialIdeaId?: string;
}) {
  const initialIdea = ideas.find((i) => i.id === initialIdeaId);
  const [title, setTitle] = useState(
    initialIdea ? scriptTitleFor(initialIdea) : "",
  );
  const [ideaId, setIdeaId] = useState(initialIdea?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleIdeaChange(value: string) {
    setIdeaId(value);
    if (!value || title.trim()) return;
    const idea = ideas.find((i) => i.id === value);
    if (idea) setTitle(scriptTitleFor(idea));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    startTransition(async () => {
      const script = await minDelay(
        createScript(title, ideaId || undefined),
        500,
      );
      router.push(`/scripts/${script.id}`);
    });
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-3 flex-wrap">
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
              minWidth: 200,
            }}
          />
          <Button type="submit" loading={isPending}>
            Create
          </Button>
        </div>
        {ideas.length > 0 && (
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              Link to an idea:
            </span>
            <select
              value={ideaId}
              onChange={(e) => handleIdeaChange(e.target.value)}
              style={selectStyle}
            >
              <option value="">Not linked to an idea</option>
              {ideas.map((idea) => (
                <option key={idea.id} value={idea.id}>
                  {idea.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </form>
    </Card>
  );
}
