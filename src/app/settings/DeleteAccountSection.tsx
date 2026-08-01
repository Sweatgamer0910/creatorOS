"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAccount } from "@/lib/settings/actions";
import { signOut } from "@/lib/auth-client";
import posthog from "@/lib/posthog";
import Button from "@/components/ui/button";

export default function DeleteAccountSection() {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteAccount();
        posthog.reset();
        await signOut();
        router.push("/");
      } catch (err) {
        console.error("[Settings] Failed to delete account:", err);
        setError("Couldn't delete your account — try again.");
      }
    });
  }

  if (!confirming) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setConfirming(true)}
        style={{ borderColor: "#e35d5d", color: "#e35d5d" }}
      >
        Delete my account
      </Button>
    );
  }

  return (
    <div
      className="flex flex-col gap-2"
      style={{
        padding: 12,
        borderRadius: 10,
        border: "1px solid rgba(227,93,93,0.3)",
        backgroundColor: "rgba(227,93,93,0.06)",
        maxWidth: 420,
      }}
    >
      <p
        style={{
          fontSize: 12,
          color: "var(--color-text-muted)",
          lineHeight: 1.5,
        }}
      >
        This permanently deletes your account, workspace, ideas, scripts,
        series, pipeline, and connected YouTube data. There&rsquo;s no recovery
        period — this can&rsquo;t be undone.
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDelete}
          loading={isPending}
          style={{ borderColor: "#e35d5d", color: "#e35d5d" }}
        >
          Yes, delete everything
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </div>
      {error && <span style={{ fontSize: 12, color: "#e35d5d" }}>{error}</span>}
    </div>
  );
}
