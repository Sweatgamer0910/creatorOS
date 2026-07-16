"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/lib/auth-client";
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

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <AuthShell title="Invalid link">
        <p style={errorBoxStyle}>
          This password reset link is missing or expired.{" "}
          <Link href="/forgot-password" style={linkStyle}>
            Request a new one
          </Link>
          .
        </p>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title="Password updated">
        <p style={successBoxStyle}>
          Your password has been reset.{" "}
          <Link href="/login" style={linkStyle}>
            Log in
          </Link>{" "}
          with your new password.
        </p>
      </AuthShell>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await resetPassword({
      newPassword: password,
      token: token!,
    });

    setLoading(false);
    if (error) {
      setError(error.message ?? "Something went wrong. Try again.");
    } else {
      setDone(true);
    }
  }

  return (
    <AuthShell title="Set a new password">
      <form onSubmit={handleSubmit} style={authFormStyle}>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="password">
            New password
          </label>
          <input
            id="password"
            className="auth-input"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="confirmPassword">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            className="auth-input"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={inputStyle}
          />
        </div>

        <Button type="submit" loading={loading} style={{ marginTop: 4 }}>
          Reset password
        </Button>
      </form>

      {error && <p style={{ ...errorBoxStyle, marginTop: 16 }}>{error}</p>}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
