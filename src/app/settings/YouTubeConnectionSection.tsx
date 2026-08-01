"use client";

import { useState, useTransition } from "react";
import { disconnectYouTube } from "@/lib/settings/actions";
import posthog from "@/lib/posthog";
import ConnectYouTubeButton from "@/components/ConnectYouTubeButton";
import Button from "@/components/ui/button";

export default function YouTubeConnectionSection({
  connected,
}: {
  connected: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!connected) {
    return <ConnectYouTubeButton callbackURL="/settings" />;
  }

  function handleDisconnect() {
    setError(null);
    startTransition(async () => {
      try {
        await disconnectYouTube();
        posthog.capture("youtube_disconnected");
        setConfirming(false);
      } catch (err) {
        console.error("[Settings] Failed to disconnect YouTube:", err);
        setError("Couldn't disconnect — try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2" style={{ alignItems: "flex-start" }}>
      <span
        style={{
          fontSize: 12,
          color: "var(--color-accent-teal)",
          fontFamily: "var(--font-mono)",
        }}
      >
        ● Connected
      </span>

      {!confirming ? (
        <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
          Disconnect YouTube
        </Button>
      ) : (
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
            Google is currently your only way to sign in to CreatorOS.
            Disconnecting removes your YouTube data <strong>and</strong> your
            ability to log in with Google — you can still get back into this
            same account afterward with{" "}
            <span style={{ color: "var(--color-text)" }}>Forgot password</span>{" "}
            using your email.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDisconnect}
              loading={isPending}
              style={{ borderColor: "#e35d5d", color: "#e35d5d" }}
            >
              Yes, disconnect
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {error && <span style={{ fontSize: 12, color: "#e35d5d" }}>{error}</span>}
    </div>
  );
}
