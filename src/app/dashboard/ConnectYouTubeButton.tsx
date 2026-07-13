"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import Button from "@/components/ui/button";

export default function ConnectYouTubeButton() {
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    setLoading(true);
    await signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  }

  return (
    <Button variant="secondary" onClick={handleConnect} loading={loading}>
      Connect YouTube
    </Button>
  );
}
