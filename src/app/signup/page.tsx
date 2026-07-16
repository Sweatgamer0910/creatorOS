"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import Button from "@/components/ui/button";
import AuthShell from "@/components/auth/AuthShell";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import {
  authFormStyle,
  fieldStyle,
  labelStyle,
  inputStyle,
  errorBoxStyle,
  successBoxStyle,
  linkStyle,
  dividerRowStyle,
  dividerLineStyle,
  dividerTextStyle,
} from "../auth-form.styles";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // requireEmailVerification is on (src/lib/auth.ts), so a successful
  // signUp.email() does NOT create a session or return an error — there's
  // nothing to redirect to yet. Show an inline "check your email" state
  // instead of the old router.push("/dashboard"), which would just bounce
  // straight back to /login via middleware.
  const [submittedEmail, setSubmittedEmail] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await signUp.email({ name, email, password });

    if (error) {
      setError(error.message ?? "Something went wrong. Try again.");
      setLoading(false);
    } else {
      setSubmittedEmail(email);
      setLoading(false);
    }
  }

  if (submittedEmail) {
    return (
      <AuthShell title="Check your email">
        <p style={successBoxStyle}>
          We sent a verification link to <strong>{submittedEmail}</strong>.
          Confirm it to finish setting up your account, then{" "}
          <Link href="/login" style={linkStyle}>
            log in
          </Link>
          .
        </p>
      </AuthShell>
    );
  }

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

      <div style={dividerRowStyle}>
        <div style={dividerLineStyle} />
        <span style={dividerTextStyle}>OR</span>
        <div style={dividerLineStyle} />
      </div>

      <form onSubmit={handleSubmit} style={authFormStyle}>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="name">
            Name
          </label>
          <input
            id="name"
            className="auth-input"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
        </div>

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
          <label style={labelStyle} htmlFor="password">
            Password
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

        <Button type="submit" loading={loading} style={{ marginTop: 4 }}>
          Create account
        </Button>
      </form>

      {error && <p style={{ ...errorBoxStyle, marginTop: 16 }}>{error}</p>}
    </AuthShell>
  );
}
