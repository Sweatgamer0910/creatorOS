import { ImageResponse } from "next/og";

// Edge runtime specifically to avoid the cold-start/timeout problem the
// root OG image hit before (see docs/DECISIONS_LOG.md — that one got
// replaced with a static file because of it). This route can't be static
// since the score/channel vary per share, but Edge functions start in
// single-digit milliseconds instead of a Node serverless cold start, and
// the response is cached forever below since a given (channel, score)
// pair always renders the same image.
export const runtime = "edge";

const BG = "#0e1116";
const ACCENT = "#f5a623";
const TEAL = "#2dd4bf";
const TEXT_MUTED = "#9AA0AC";

// Mirrors PreviewLabel in src/lib/channel-health-preview/types.ts, kept as
// a plain string union here (not imported) because this route runs on the
// Edge runtime and we want zero non-essential imports in the image path.
const LABEL_COLORS: Record<string, string> = {
  "Strong Public Signals": TEAL,
  Steady: ACCENT,
  "Room To Grow": ACCENT,
  "Insufficient Data": TEXT_MUTED,
};

function clampScore(raw: string | null): number | null {
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Every value is untrusted user input reflected into a public image —
  // truncate and clamp rather than trust anything's length or range.
  const channel = (searchParams.get("channel") ?? "A YouTube channel").slice(
    0,
    48,
  );
  const label = (searchParams.get("label") ?? "").slice(0, 32);
  const score = clampScore(searchParams.get("score"));
  const ringColor = LABEL_COLORS[label] ?? ACCENT;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: BG,
        padding: "64px 72px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 4,
            background: ACCENT,
            display: "flex",
          }}
        />
        <span
          style={{
            color: "#F5F3EE",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: -0.5,
          }}
        >
          CreatorOS
        </span>
        <span style={{ color: TEXT_MUTED, fontSize: 18, marginLeft: 4 }}>
          Channel Health Check
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 56 }}>
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: "50%",
            border: `10px solid ${ringColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 84,
              fontWeight: 700,
              color: "#F5F3EE",
              lineHeight: 1,
            }}
          >
            {score ?? "—"}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span
            style={{
              color: "#F5F3EE",
              fontSize: 46,
              fontWeight: 700,
              letterSpacing: -1,
              maxWidth: 700,
            }}
          >
            {channel}
          </span>
          {label && (
            <span style={{ color: ringColor, fontSize: 26, fontWeight: 600 }}>
              {label}
            </span>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid rgba(245,243,238,0.12)",
          paddingTop: 24,
        }}
      >
        <span style={{ color: TEXT_MUTED, fontSize: 20 }}>
          Free, honest preview from public data — no login
        </span>
        <span style={{ color: ACCENT, fontSize: 20, fontWeight: 600 }}>
          creatoros.onl/channel-health
        </span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: {
        // Deterministic per (channel, score, label) — safe to cache
        // indefinitely rather than regenerate on every share-link open.
        "Cache-Control": "public, immutable, no-transform, max-age=31536000",
      },
    },
  );
}
