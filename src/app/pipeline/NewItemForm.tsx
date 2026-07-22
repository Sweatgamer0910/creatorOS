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

const selectStyle: React.CSSProperties = {
  backgroundColor: "var(--color-background)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  borderRadius: radius.sm,
  padding: `${spacing.sm}px ${spacing.md}px`,
  outline: "none",
  fontSize: 14,
};

export default function NewItemForm({
  ideas = [],
  scripts = [],
}: {
  ideas?: { id: string; title: string }[];
  scripts?: { id: string; title: string }[];
}) {
  const [title, setTitle] = useState("");
  const [source, setSource] = useState(""); // "" | `idea:<id>` | `script:<id>`
  const [isPending, startTransition] = useTransition();

  function handleSourceChange(value: string) {
    setSource(value);
    if (!value) return;
    const [kind, id] = value.split(":");
    const list = kind === "idea" ? ideas : scripts;
    const match = list.find((item) => item.id === id);
    if (match && !title.trim()) setTitle(match.title);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const [kind, id] = source ? source.split(":") : [];
    const linkedSource =
      kind === "idea"
        ? { ideaId: id }
        : kind === "script"
          ? { scriptId: id }
          : undefined;

    startTransition(async () => {
      await minDelay(createContentItem(title, linkedSource), 500);
      setTitle("");
      setSource("");
    });
  }

  const hasLinkableItems = ideas.length > 0 || scripts.length > 0;

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-3 flex-wrap">
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
              minWidth: 200,
            }}
          />
          <Button type="submit" loading={isPending}>
            Add to pipeline
          </Button>
        </div>
        {hasLinkableItems && (
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              Link to:
            </span>
            <select
              value={source}
              onChange={(e) => handleSourceChange(e.target.value)}
              style={selectStyle}
            >
              <option value="">None</option>
              {ideas.length > 0 && (
                <optgroup label="Ideas">
                  {ideas.map((idea) => (
                    <option key={idea.id} value={`idea:${idea.id}`}>
                      {idea.title}
                    </option>
                  ))}
                </optgroup>
              )}
              {scripts.length > 0 && (
                <optgroup label="Scripts">
                  {scripts.map((script) => (
                    <option key={script.id} value={`script:${script.id}`}>
                      {script.title}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
        )}
      </form>
    </Card>
  );
}
