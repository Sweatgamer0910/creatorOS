import Link from "next/link";
import { ArrowRight } from "lucide-react";

// v1 landing hero: static, no scroll-jacking. The previous version
// (HeroFilm + the scroll-choreographed Nova sequence, see
// docs/03-engineering/hero-film.md for why it was removed) tried to do a
// pinned cinematic camera sequence and didn't hold up — overlapping UI,
// no real continuity between beats. This is the plain, reliable version:
// name, punchline, CTAs, then scroll to the feature cards below.
export default function Hero() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        padding: "0 40px",
      }}
    >
      <div style={{ maxWidth: 1000, width: "100%", margin: "0 auto" }}>
        <div style={{ maxWidth: 620 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.1)",
              fontSize: 13,
              color: "rgba(255,255,255,0.6)",
              backgroundColor: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "var(--color-accent)",
              }}
            />
            Mission control for YouTube creators
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(40px, 6vw, 64px)",
              lineHeight: 1.05,
              fontWeight: 700,
              color: "#fff",
              marginTop: 24,
            }}
          >
            CreatorOS
          </h1>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(22px, 3vw, 30px)",
              lineHeight: 1.3,
              fontWeight: 600,
              color: "rgba(255,255,255,0.85)",
              marginTop: 12,
            }}
          >
            Grow your channel with real signal, not noise.
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 17,
              maxWidth: 480,
              marginTop: 16,
              lineHeight: 1.6,
            }}
          >
            Analytics, AI-backed insights, and your entire content pipeline — in
            one command center built for creators, not spreadsheets.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
            <Link
              href="/signup"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "#000",
                textDecoration: "none",
              }}
            >
              Get started
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="flex items-center px-6 py-3 rounded-xl font-medium"
              style={{
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                backgroundColor: "rgba(0,0,0,0.3)",
                textDecoration: "none",
              }}
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
