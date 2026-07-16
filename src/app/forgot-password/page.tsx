"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/auth-client";
import Button from "@/components/ui/button";
import AuthShell from "@/components/auth/AuthShell";
import {
  authFormStyle,
  fieldStyle,
  labelStyle,
  inputStyle,
  errorBoxStyle,
  successBoxStyle,
  linkStyle,
} from "../auth-form.styles";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    setLoading(false);
    if (error) {
      // Deliberately don't reveal whether the email exists — same message
      // either way, so this branch only fires on real failures (rate
      // limit, provider outage) rather than "account not found."
      setError(error.message ?? "Something went wrong. Try again.");
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <AuthShell title="Check your email">
        <p style={successBoxStyle}>
          If an account exists for <strong>{email}</strong>, we sent a link to
          reset your password.
        </p>
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.5)",
            marginTop: 16,
          }}
        >
          <Link href="/login" style={linkStyle}>
            Back to log in
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link"
      footer={
        <Link href="/login" style={linkStyle}>
          Back to log in
        </Link>
      }
    >
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

        <Button type="submit" loading={loading} style={{ marginTop: 4 }}>
          Send reset link
        </Button>
      </form>

      {error && <p style={{ ...errorBoxStyle, marginTop: 16 }}>{error}</p>}
    </AuthShell>
  );
}
