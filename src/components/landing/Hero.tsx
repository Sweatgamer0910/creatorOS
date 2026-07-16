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
        minHeight: "74vh",
        display: "flex",
        alignItems: "center",
        padding: "0 40px",
      }}
    >
      <div style={{ maxWidth: 1100, width: "100%", margin: "0 auto" }}>
        <div style={{ maxWidth: 760 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              padding: "8px 16px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.1)",
              fontSize: 14,
              color: "rgba(255,255,255,0.6)",
              backgroundColor: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: "var(--color-accent)",
              }}
            />
            Mission control for YouTube creators
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(56px, 8.5vw, 104px)",
              lineHeight: 1.02,
              fontWeight: 700,
              color: "#fff",
              marginTop: 28,
            }}
          >
            CreatorOS
          </h1>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 4.2vw, 44px)",
              lineHeight: 1.25,
              fontWeight: 600,
              color: "rgba(255,255,255,0.85)",
              marginTop: 16,
            }}
          >
            Grow your channel with real signal, not noise.
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 20,
              maxWidth: 580,
              marginTop: 20,
              lineHeight: 1.6,
            }}
          >
            Analytics, AI-backed insights, and your entire content pipeline — in
            one command center built for creators, not spreadsheets.
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              marginTop: 40,
            }}
          >
            <Link
              href="/signup"
              className="glow-interactive flex items-center gap-2 px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl font-medium"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "#000",
                textDecoration: "none",
                fontSize: 17,
                whiteSpace: "nowrap",
              }}
            >
              Get started
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/login"
              className="glow-interactive flex items-center px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl font-medium"
              style={{
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                backgroundColor: "rgba(0,0,0,0.3)",
                textDecoration: "none",
                fontSize: 17,
                whiteSpace: "nowrap",
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
