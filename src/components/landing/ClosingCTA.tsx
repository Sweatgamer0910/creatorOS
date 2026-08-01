"use client";

import { useState } from "react";
import Link from "next/link";
import { joinWaitlist } from "@/lib/waitlist/actions";
import posthog from "posthog-js";

// The app is live and self-serve (Google/Discord sign-in, one click), so
// the primary path here is a direct link to /signup — same button style
// as Hero.tsx's — rather than routing everyone through an email-capture
// form first. The smaller form below is now explicitly secondary: an
// opt-in to occasional updates for people not ready to connect a channel
// yet, not the main call to action. Still writes to the same WaitlistEntry
// table + Resend audience (src/lib/waitlist/actions.ts) — nothing about
// the backend changed, only which action is presented as primary.
export default function ClosingCTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await joinWaitlist(email);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      posthog.capture("waitlist_joined");
      setSubmitted(true);
    }
  }

  return (
    <section
      id="access"
      style={{
        padding: "180px 32px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(32px,5.5vw,64px)",
          fontWeight: 600,
          letterSpacing: "-0.03em",
          maxWidth: 780,
          marginBottom: 20,
          color: "#F5F3EE",
        }}
      >
        Your channel deserves an operating system, not a pile of tabs
      </h2>
      <p style={{ color: "#9AA0AC", fontSize: 16, marginBottom: 32 }}>
        Free to start, no credit card — connect your channel and see your
        real Health Score in minutes.
      </p>

      <Link
        href="/signup"
        className="glow-interactive"
        style={{
          padding: "14px 32px",
          background: "#F5A623",
          color: "#030304",
          fontWeight: 600,
          fontSize: 16,
          borderRadius: 10,
          boxShadow:
            "0 0 0 1px rgba(245,166,35,0.4), 0 8px 24px -8px rgba(245,166,35,0.55)",
          textDecoration: "none",
        }}
      >
        Sign up free
      </Link>

      <div style={{ marginTop: 56, paddingTop: 32, borderTop: "1px solid rgba(245,243,238,0.08)" }}>
        {submitted ? (
          <p style={{ color: "#9AA0AC", fontSize: 13 }}>
            You&apos;re on the list — we&apos;ll keep you posted.
          </p>
        ) : (
          <>
            <p style={{ color: "#6B7280", fontSize: 13, marginBottom: 14 }}>
              Not ready to connect a channel yet? Get occasional updates
              instead.
            </p>
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <input
                type="email"
                placeholder="you@channel.com"
                required
                aria-label="Email address"
                value={email}
                disabled={loading}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid rgba(245,243,238,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  color: "#F5F3EE",
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  minWidth: 220,
                }}
              />
              <button
                type="submit"
                className="glow-text"
                disabled={loading}
                style={{
                  padding: "10px 18px",
                  background: "transparent",
                  border: "1px solid rgba(245,243,238,0.14)",
                  color: "#9AA0AC",
                  fontWeight: 500,
                  fontSize: 13,
                  borderRadius: 8,
                  cursor: loading ? "default" : "pointer",
                  fontFamily: "inherit",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Joining…" : "Get updates"}
              </button>
            </form>
            {error && (
              <p style={{ color: "#e08a8a", fontSize: 12, marginTop: 10 }}>
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
