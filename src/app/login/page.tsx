"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, sendVerificationEmail } from "@/lib/auth-client";
import Button from "@/components/ui/button";
import AuthShell from "@/components/auth/AuthShell";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import {
  authFormStyle,
  fieldStyle,
  labelStyle,
  inputStyle,
  errorBoxStyle,
  linkStyle,
  dividerRowStyle,
  dividerLineStyle,
  dividerTextStyle,
} from "../auth-form.styles";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [unverified, setUnverified] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">(
    "idle",
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setUnverified(false);

    const { error } = await signIn.email({ email, password });

    if (error) {
      // better-auth throws this specific message when the account exists
      // but hasn't confirmed its email yet (see requireEmailVerification
      // in src/lib/auth.ts) — surface a resend action instead of a dead end.
      if (error.message === "Email not verified") {
        setUnverified(true);
      } else {
        setError(error.message ?? "Something went wrong. Try again.");
      }
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  async function handleResend() {
    setResendStatus("sending");
    await sendVerificationEmail({ email });
    setResendStatus("sent");
  }

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

      <div style={dividerRowStyle}>
        <div style={dividerLineStyle} />
        <span style={dividerTextStyle}>OR</span>
        <div style={dividerLineStyle} />
      </div>

      <form onSubmit={handleSubmit} style={authFormStyle}>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="auth-input"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <label style={labelStyle} htmlFor="password">
              Password
            </label>
            <Link
              href="/forgot-password"
              style={{ ...linkStyle, fontSize: 13 }}
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            className="auth-input"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </div>

        <Button type="submit" loading={loading} style={{ marginTop: 4 }}>
          Log in
        </Button>
      </form>

      {error && <p style={{ ...errorBoxStyle, marginTop: 16 }}>{error}</p>}

      {unverified && (
        <div style={{ ...errorBoxStyle, marginTop: 16 }}>
          <p>
            Your email isn&apos;t verified yet. Check your inbox for the link.
          </p>
          {resendStatus === "sent" ? (
            <p style={{ marginTop: 8, color: "#7fd8b8" }}>
              Verification email resent.
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendStatus === "sending"}
              style={{
                marginTop: 8,
                background: "none",
                border: "none",
                padding: 0,
                color: "var(--color-accent)",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {resendStatus === "sending"
                ? "Sending…"
                : "Resend verification email"}
            </button>
          )}
        </div>
      )}
    </AuthShell>
  );
}
