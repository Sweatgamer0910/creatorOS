"use client";

import { useState } from "react";

// Client-side only, ported exactly as authored in the approved prototype
// (no backend call — just the button label swapping to confirm the
// submission was received). If this needs to actually persist an email
// somewhere, that's a follow-up, not something invented here.
export default function ClosingCTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
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
        style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}
      >
        <input
          type="email"
          placeholder="you@channel.com"
          required
          aria-label="Email address"
          value={email}
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
          }}
        />
        <button
          type="submit"
          className="glow-interactive"
          style={{
            padding: "14px 26px",
            background: "#F5A623",
            color: "#030304",
            fontWeight: 600,
            fontSize: 15,
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {submitted ? "Thanks — we'll be in touch" : "Get in touch"}
        </button>
      </form>
    </section>
  );
}
