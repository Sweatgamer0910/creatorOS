"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import Button from "@/components/ui/button";

export default function ConnectYouTubeButton({
  label = "Connect YouTube",
  callbackURL = "/dashboard",
}: {
  label?: string;
  callbackURL?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    setLoading(true);
    await signIn.social({
      provider: "google",
      callbackURL,
    });
  }

  return (
    <Button variant="secondary" onClick={handleConnect} loading={loading}>
      {label}
    </Button>
  );
}
