"use client";

import { useState, useTransition } from "react";
import { updateWorkspaceName } from "@/lib/settings/actions";
import Button from "@/components/ui/button";
import { radius, spacing } from "@/lib/design-tokens";

const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--color-background)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  borderRadius: radius.sm,
  padding: `${spacing.sm}px ${spacing.md}px`,
  outline: "none",
  fontSize: 14,
  minWidth: 220,
};

export default function WorkspaceNameForm({
  initialName,
}: {
  initialName: string;
}) {
  const [name, setName] = useState(initialName);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || name === initialName) return;
    setStatus("idle");
    startTransition(async () => {
      try {
        await updateWorkspaceName(name);
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2500);
      } catch (err) {
        console.error("[Settings] Failed to update workspace name:", err);
        setStatus("error");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-wrap">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={inputStyle}
        aria-label="Workspace name"
      />
      <Button
        type="submit"
        variant="secondary"
        size="sm"
        loading={isPending}
        disabled={!name.trim() || name === initialName}
      >
        Save
      </Button>
      {status === "saved" && (
        <span style={{ fontSize: 12, color: "var(--color-accent-teal)" }}>
          Saved
        </span>
      )}
      {status === "error" && (
        <span style={{ fontSize: 12, color: "#e35d5d" }}>
          Couldn&rsquo;t save — try again.
        </span>
      )}
    </form>
  );
}
