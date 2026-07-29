"use client";

import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import DiscordSignInButton from "@/components/auth/DiscordSignInButton";
import { linkStyle } from "../auth-form.styles";

// OAuth-only as of 2026-07-28 (see docs/DECISIONS_LOG.md) — no email/password
// form, so no separate "check your email to verify" step either: signIn.social
// redirects straight to /dashboard once the provider confirms the account.
export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Start managing your channel with CreatorOS"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" style={linkStyle}>
            Log in
          </Link>
        </>
      }
    >
      <GoogleSignInButton label="Sign up with Google" />
      <div style={{ height: 12 }} />
      <DiscordSignInButton label="Sign up with Discord" />

      <p
        style={{
          fontSize: 12,
          color: "var(--color-text-muted)",
          marginTop: 14,
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        By creating an account you agree to our{" "}
        <Link href="/terms" style={linkStyle}>
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" style={linkStyle}>
          Privacy Policy
        </Link>
        .
      </p>
    </AuthShell>
  );
}
