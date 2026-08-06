"use client";

import { useState } from "react";
import Link from "next/link";
import { previewChannelHealth } from "@/lib/channel-health-preview/actions";
import { captureChannelCheckLead } from "@/lib/channel-health-preview/leadCapture";
import {
  ChannelHealthPreview,
  PreviewInsight,
} from "@/lib/channel-health-preview/types";
import Card from "@/components/ui/Card";

const typeLabels: Record<PreviewInsight["type"], string> = {
  fact: "Fact",
  pattern: "Pattern",
  recommendation: "Recommendation",
  hypothesis: "Hypothesis",
};

const typeColors: Record<PreviewInsight["type"], string> = {
  fact: "var(--color-text-muted)",
  pattern: "var(--color-accent-teal)",
  recommendation: "var(--color-accent)",
  hypothesis: "#e0a020",
};

const confidenceLabels: Record<PreviewInsight["confidence"], string> = {
  high: "High confidence",
  medium: "Medium confidence",
  exploratory: "Exploratory",
};

// Trims insignificant trailing zeros before the unit suffix (21.0M -> 21M,
// 5.50B -> 5.5B, 5.00B -> 5B) while keeping real precision (21.1M, 5.52B).
function trimTrailingZero(s: string): string {
  return s.replace(/(\.\d*?)0+(?=[A-Z]$)/, "$1").replace(/\.(?=[A-Z]$)/, "");
}

function formatCount(n: number): string {
  // Large, well-established channels (MKBHD-scale and up) clear a billion
  // total views — the old M-only formatter had no ceiling above that, so
  // it rendered a channel with 5.52B views as "5520.0M views" instead of
  // rolling over to a B suffix. Caught in live QA against a real channel.
  if (n >= 1_000_000_000)
    return trimTrailingZero(`${(n / 1_000_000_000).toFixed(2)}B`);
  if (n >= 1_000_000) return trimTrailingZero(`${(n / 1_000_000).toFixed(1)}M`);
  if (n >= 1_000) return trimTrailingZero(`${(n / 1_000).toFixed(1)}K`);
  return String(n);
}

export default function ChannelHealthChecker({
  shared,
}: {
  /** Present when a visitor landed via a shared result link (?channel=&score=)
   *  — see page.tsx's generateMetadata for the OG-card side of this loop. */
  shared?: { channel: string; score: string } | null;
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ChannelHealthPreview | null>(null);
  const [copied, setCopied] = useState(false);

  const [leadEmail, setLeadEmail] = useState("");
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadError, setLeadError] = useState("");

  function buildShareUrl(r: ChannelHealthPreview): string {
    const params = new URLSearchParams({
      channel: r.channelTitle,
      score: String(r.score),
      label: r.label,
    });
    return `${window.location.origin}/channel-health?${params.toString()}`;
  }

  async function handleCopyLink() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(buildShareUrl(result));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail in some embedded/in-app browsers — the
      // share link itself is still visible/copyable via "Share on X" so
      // this isn't a dead end, just a missed convenience.
    }
  }

  function handleShareToX() {
    if (!result) return;
    const text = `"${result.channelTitle}" scored ${result.score}/100 on the CreatorOS Channel Health Check. What's yours?`;
    const url = buildShareUrl(result);
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(intent, "_blank", "noopener,noreferrer");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLeadEmail("");
    setLeadSubmitted(false);
    setLeadError("");
    setLoading(true);
    const { data, error } = await previewChannelHealth(input);
    setLoading(false);
    if (error) setError(error);
    else if (data) setResult(data);
  }

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!result) return;
    setLeadError("");
    setLeadSubmitting(true);
    const { error } = await captureChannelCheckLead({
      email: leadEmail,
      channelTitle: result.channelTitle,
      score: result.score,
    });
    setLeadSubmitting(false);
    if (error) setLeadError(error);
    else setLeadSubmitted(true);
  }

  return (
    <div
      style={{
        maxWidth: 680,
        margin: "0 auto",
        padding: "64px 24px 120px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <span
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: 12,
            letterSpacing: 2,
            color: "var(--color-accent)",
            textTransform: "uppercase",
          }}
        >
          Free preview · No login
        </span>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(28px,4.5vw,44px)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            margin: "12px 0",
            color: "var(--color-text)",
          }}
        >
          What&rsquo;s your channel&rsquo;s Health Check?
        </h1>
        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: 15,
            maxWidth: 480,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Paste any YouTube channel&rsquo;s @handle or URL — yours or one
          you&rsquo;re curious about — and get a free, honest read using only
          public data: upload cadence, recent performance, and where to focus
          next.
        </p>
      </div>

      {shared && !result && (
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span
            style={{
              display: "inline-block",
              padding: "10px 18px",
              borderRadius: 999,
              background: "rgba(245,166,35,0.1)",
              border: "1px solid rgba(245,166,35,0.25)",
              color: "var(--color-text)",
              fontSize: 13,
            }}
          >
            <strong>{shared.channel}</strong> scored{" "}
            <strong style={{ color: "var(--color-accent)" }}>
              {shared.score}/100
            </strong>{" "}
            — check yours below
          </span>
        </div>
      )}

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
          type="text"
          placeholder="@yourchannel or youtube.com/@yourchannel"
          required
          aria-label="YouTube channel handle or URL"
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: "1 1 320px",
            padding: "14px 16px",
            borderRadius: 10,
            border: "1px solid rgba(245,243,238,0.1)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--color-text)",
            fontFamily: "var(--font-body)",
            fontSize: 14,
          }}
        />
        <button
          type="submit"
          className="glow-interactive"
          disabled={loading}
          style={{
            padding: "14px 28px",
            background: "var(--color-accent)",
            color: "#030304",
            fontWeight: 600,
            fontSize: 15,
            borderRadius: 10,
            border: "none",
            cursor: loading ? "default" : "pointer",
            fontFamily: "inherit",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Checking…" : "Check my channel"}
        </button>
      </form>

      {error && (
        <p
          style={{
            color: "#e08a8a",
            fontSize: 13,
            textAlign: "center",
            marginTop: 16,
          }}
        >
          {error}
        </p>
      )}

      {result && (
        <div style={{ marginTop: 48 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 24,
            }}
          >
            {result.channelThumbnail && (
              // eslint-disable-next-line @next/next/no-img-element -- external YouTube CDN thumbnail, not worth a next/image remote-pattern config for one small avatar
              <img
                src={result.channelThumbnail}
                alt=""
                width={56}
                height={56}
                style={{ borderRadius: "50%" }}
              />
            )}
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 600,
                  color: "var(--color-text)",
                }}
              >
                {result.channelTitle}
              </h2>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                }}
              >
                {result.subscriberCount !== null
                  ? `${formatCount(result.subscriberCount)} subscribers · `
                  : ""}
                {formatCount(result.viewCount)} views ·{" "}
                {formatCount(result.videoCount)} videos
              </p>
            </div>
          </div>

          <Card padding="lg" style={{ textAlign: "center", marginBottom: 24 }}>
            <span
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Preview Score
            </span>
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: "var(--color-accent)",
                lineHeight: 1.1,
              }}
            >
              {result.score}
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "var(--color-text)",
              }}
            >
              {result.label}
            </div>
            <p
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                marginTop: 10,
                maxWidth: 380,
                marginInline: "auto",
              }}
            >
              This is a preview built from public data only. Your real Health
              Score (available once you connect your channel) uses private
              analytics this preview can&rsquo;t see — watch time, traffic
              sources, and day-by-day growth.
            </p>
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                flexWrap: "wrap",
                marginTop: 18,
              }}
            >
              <button
                type="button"
                onClick={handleShareToX}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid rgba(245,243,238,0.14)",
                  background: "transparent",
                  color: "var(--color-text)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Share on X
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid rgba(245,243,238,0.14)",
                  background: "transparent",
                  color: "var(--color-text)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {copied ? "Link copied" : "Copy link"}
              </button>
            </div>
          </Card>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {result.insights.map((insight, i) => (
              <Card
                key={i}
                padding="sm"
                accentBorder={typeColors[insight.type]}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    marginBottom: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      color: typeColors[insight.type],
                      fontWeight: 700,
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {typeLabels[insight.type]}
                  </span>
                  <span
                    style={{ fontSize: 12, color: "var(--color-text-muted)" }}
                  >
                    {confidenceLabels[insight.confidence]}
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "var(--color-text)",
                  }}
                >
                  {insight.message}
                </p>
              </Card>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link
              href="/signup"
              className="glow-interactive"
              style={{
                display: "inline-block",
                padding: "14px 32px",
                background: "var(--color-accent)",
                color: "#030304",
                fontWeight: 600,
                fontSize: 15,
                borderRadius: 10,
                textDecoration: "none",
              }}
            >
              Get your real Health Score — free
            </Link>
          </div>

          <div
            style={{
              marginTop: 32,
              paddingTop: 24,
              borderTop: "1px solid rgba(245,243,238,0.08)",
              textAlign: "center",
            }}
          >
            {leadSubmitted ? (
              <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                Got it — we&rsquo;ll send a few tips based on what we just saw.
              </p>
            ) : (
              <>
                <p style={{ color: "#6B7280", fontSize: 13, marginBottom: 14 }}>
                  Not ready to sign up? Get a few tips based on this specific
                  score, sent to your inbox.
                </p>
                <form
                  onSubmit={handleLeadSubmit}
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
                    value={leadEmail}
                    disabled={leadSubmitting}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1px solid rgba(245,243,238,0.08)",
                      background: "rgba(255,255,255,0.03)",
                      color: "var(--color-text)",
                      fontFamily: "var(--font-body)",
                      fontSize: 13,
                      minWidth: 220,
                    }}
                  />
                  <button
                    type="submit"
                    className="glow-text"
                    disabled={leadSubmitting}
                    style={{
                      padding: "10px 18px",
                      background: "transparent",
                      border: "1px solid rgba(245,243,238,0.14)",
                      color: "#9AA0AC",
                      fontWeight: 500,
                      fontSize: 13,
                      borderRadius: 8,
                      cursor: leadSubmitting ? "default" : "pointer",
                      fontFamily: "inherit",
                      opacity: leadSubmitting ? 0.7 : 1,
                    }}
                  >
                    {leadSubmitting ? "Sending…" : "Email me tips"}
                  </button>
                </form>
                {leadError && (
                  <p style={{ color: "#e08a8a", fontSize: 12, marginTop: 10 }}>
                    {leadError}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
