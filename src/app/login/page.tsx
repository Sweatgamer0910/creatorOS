"use client";

import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import DiscordSignInButton from "@/components/auth/DiscordSignInButton";
import { linkStyle } from "../auth-form.styles";

// OAuth-only as of 2026-07-28 (see docs/DECISIONS_LOG.md) — no email/password
// form. Removing it sidesteps needing a verified Resend sending domain for
// verification emails, since Google/Discord accounts are pre-verified by the
// provider. Email/password is planned to come back once there's revenue to
// spend on a verified domain.
export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your CreatorOS account"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={linkStyle}>
            Sign up
          </Link>
        </>
      }
    >
      <GoogleSignInButton label="Continue with Google" />
      <div style={{ height: 12 }} />
      <DiscordSignInButton label="Continue with Discord" />
    </AuthShell>
  );
}
