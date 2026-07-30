"use client";

import { useState } from "react";
import { joinWaitlist } from "@/lib/waitlist/actions";

// Persists to the WaitlistEntry table + syncs to Resend (src/lib/waitlist/
// actions.ts) so pre-launch content has somewhere real to send people —
// this used to just flip the button label with no backend call (see git
// history), which was a deliberate placeholder, not a design decision.
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
      <p style={{ color: "#9AA0AC", fontSize: 16, marginBottom: 40 }}>
        Email us if you&apos;d like to learn more about CreatorOS and
        what&apos;s next for your channel.
      </p>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: 10,
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
          disabled={submitted || loading}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "14px 18px",
            borderRadius: 10,
            border: "1px solid rgba(245,243,238,0.08)",
            background: "rgba(255,255,255,0.03)",
            color: "#F5F3EE",
            fontFamily: "var(--font-body)",
            fontSize: 14,
            minWidth: 260,
            opacity: submitted ? 0.6 : 1,
          }}
        />
        <button
          type="submit"
          className="glow-interactive"
          disabled={submitted || loading}
          style={{
            padding: "14px 26px",
            background: "#F5A623",
            color: "#030304",
            fontWeight: 600,
            fontSize: 15,
            borderRadius: 10,
            border: "none",
            cursor: submitted || loading ? "default" : "pointer",
            fontFamily: "inherit",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {submitted
            ? "Thanks — we'll be in touch"
            : loading
              ? "Joining…"
              : "Get in touch"}
        </button>
      </form>
      {error && (
        <p style={{ color: "#e08a8a", fontSize: 13, marginTop: 12 }}>{error}</p>
      )}
    </section>
  );
}
