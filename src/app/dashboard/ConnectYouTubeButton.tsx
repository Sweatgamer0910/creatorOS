"use client";

import { signIn } from "@/lib/auth-client";

export default function ConnectYouTubeButton() {
  async function handleConnect() {
    await signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  }

  return (
    <button
      onClick={handleConnect}
      style={{ marginTop: 20, padding: "10px 20px" }}
    >
      Connect YouTube
    </button>
  );
}
