"use client";

import { useState } from "react";
import { linkSocial } from "@/lib/auth-client";
import Button from "@/components/ui/button";

export default function ConnectYouTubeButton({
  label = "Connect YouTube",
  callbackURL = "/dashboard",
}: {
  label?: string;
  callbackURL?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    setLoading(true);
    setError(null);
    // linkSocial (not signIn.social) — this button only ever renders for an
    // already-authenticated user adding their YouTube/Google account
    // alongside whatever they originally signed up with. signIn.social
    // starts a fresh sign-in flow instead of linking to the current
    // session, which was silently dropping the existing provider (e.g. a
    // Discord-signup user connecting YouTube lost their Discord link) —
    // caught by the team testing Discord login. linkSocial hits
    // better-auth's /link-social endpoint, which explicitly links to
    // session.user.id rather than resolving to a (possibly different)
    // account.
    const { error: linkError } = await linkSocial({
      provider: "google",
      callbackURL,
    });
    // A successful call redirects the browser to Google's consent screen,
    // so this line only runs on failure (blocked popup, network error,
    // etc.) — same reasoning as the try/catch pattern elsewhere in the
    // auth flow: never leave the button silently stuck on "loading".
    if (linkError) {
      setError(
        linkError.message || "Couldn't start the connection — try again.",
      );
      setLoading(false);
    }
  }

  return (
    <div>
      <Button variant="secondary" onClick={handleConnect} loading={loading}>
        {label}
      </Button>
      {error && (
        <p style={{ color: "#e35d5d", fontSize: 13, marginTop: 8 }}>
          {error}
        </p>
      )}
    </div>
  );
}
