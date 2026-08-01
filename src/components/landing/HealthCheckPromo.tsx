import Link from "next/link";

// Landing page promo for /channel-health — the free, no-login preview
// checker previously only had a small link in the top nav, easy to miss.
// This gives it a real section with its own pitch, right before the
// sign-up section — for a visitor not ready to commit to an account yet,
// this is the lower-friction next step instead of bouncing off entirely.
export default function HealthCheckPromo() {
  return (
    <section
      style={{
        padding: "120px 32px",
        background: "#0E1116",
        borderTop: "1px solid rgba(245,243,238,0.08)",
        borderBottom: "1px solid rgba(245,243,238,0.08)",
      }}
    >
      <div
        className="grid grid-cols-1 lg:grid-cols-2"
        style={{ maxWidth: 1180, margin: "0 auto", gap: 64, alignItems: "center" }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "#5B6270",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 18,
            }}
          >
            Free preview · No login
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px,4vw,40px)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              marginBottom: 18,
              color: "#F5F3EE",
            }}
          >
            Not ready to sign up? Check your channel first.
          </h2>
          <p style={{ color: "#9AA0AC", fontSize: 16, maxWidth: 460, marginBottom: 28 }}>
            Paste any YouTube channel and get a free, honest read on upload
            consistency and recent performance — no account, no email
            required. It&apos;s the same fact/pattern/confidence system as
            everything else in CreatorOS, just built from public data.
          </p>
          <Link
            href="/channel-health"
            className="glow-interactive"
            style={{
              display: "inline-block",
              padding: "13px 28px",
              background: "#F5A623",
              color: "#030304",
              fontWeight: 600,
              fontSize: 15,
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            Check your channel free
          </Link>
        </div>

        <div
          style={{
            padding: "28px 26px",
            borderRadius: 16,
            background: "#171B22",
            border: "1px solid rgba(245,243,238,0.08)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "#5B6270",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Preview Score
          </span>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 48,
              fontWeight: 700,
              color: "#F5A623",
              lineHeight: 1.1,
              margin: "6px 0 2px",
            }}
          >
            74
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#F5F3EE", marginBottom: 20 }}>
            Steady
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(45,212,191,0.08)",
                border: "1px solid rgba(45,212,191,0.18)",
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: "#2DD4BF", textTransform: "uppercase" }}>
                Pattern
              </span>
              <span style={{ fontSize: 12, color: "#9AA0AC" }}>
                Uploads roughly every 6 days
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(245,166,35,0.08)",
                border: "1px solid rgba(245,166,35,0.18)",
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: "#F5A623", textTransform: "uppercase" }}>
                Recommendation
              </span>
              <span style={{ fontSize: 12, color: "#9AA0AC" }}>
                Tighten the schedule to build habit
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
