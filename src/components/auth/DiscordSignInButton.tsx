"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import Button from "@/components/ui/button";

// Discord's official "Clyde" mark, reproduced unmodified per Discord's
// branding guidelines — same reasoning as GoogleSignInButton's inlined G.
function DiscordIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#5865F2"
        d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.07.07 0 0 0-.074.035c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.6 12.6 0 0 0-.617-1.25.077.077 0 0 0-.075-.036 19.74 19.74 0 0 0-4.885 1.516.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.076.076 0 0 0-.04.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.955 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
      />
    </svg>
  );
}

export default function DiscordSignInButton({
  label = "Continue with Discord",
}: {
  label?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await signIn.social({ provider: "discord", callbackURL: "/dashboard" });
  }

  return (
    <Button
      type="button"
      variant="secondary"
      loading={loading}
      onClick={handleClick}
      style={{ width: "100%" }}
    >
      {!loading && <DiscordIcon />}
      {label}
    </Button>
  );
}
