import Link from "next/link";
import { ArrowRight, BarChart3, Sparkles, Lightbulb } from "lucide-react";
import Starfield from "@/components/landing/Starfield";
import GridHorizon from "@/components/landing/GridHorizon";
import TiltCard from "@/components/landing/TiltCard";
import GlassPanel from "@/components/landing/GlassPanel";
import ScrollScene from "@/components/landing/ScrollScene";

export default function LandingPage() {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: "#000000",
      }}
    >
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <Starfield />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1000,
          margin: "0 auto",
          padding: "120px 40px 0",
        }}
      >
        <div style={{ textAlign: "center" }}>
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
              marginBottom: 24,
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
              fontSize: "clamp(40px, 6vw, 68px)",
              lineHeight: 1.1,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            Grow your channel
            <br />
            with real signal, not noise.
          </h1>

          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 18,
              maxWidth: 560,
              margin: "24px auto 0",
              lineHeight: 1.6,
            }}
          >
            Analytics, AI-backed insights, and your entire content pipeline — in
            one command center built for creators, not spreadsheets.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              marginTop: 36,
            }}
          >
            <Link
              href="/signup"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium"
              style={{ backgroundColor: "var(--color-accent)", color: "#000" }}
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
              }}
            >
              Log in
            </Link>
          </div>
        </div>
      </div>

      <ScrollScene />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1000,
          margin: "0 auto",
          padding: "40px 40px 80px",
        }}
      >
        <div style={{ position: "relative", paddingTop: 40 }}>
          <div style={{ position: "absolute", inset: 0 }}>
            <GridHorizon />
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-6">
            <TiltCard>
              <GlassPanel className="p-6 h-full">
                <BarChart3 size={22} color="var(--color-accent)" />
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 18,
                    marginTop: 16,
                    color: "#fff",
                  }}
                >
                  Real analytics
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.55)",
                    marginTop: 8,
                    lineHeight: 1.6,
                  }}
                >
                  Views, subscribers, and watch time — pulled directly from
                  YouTube, not guessed at.
                </p>
              </GlassPanel>
            </TiltCard>

            <TiltCard>
              <GlassPanel className="p-6 h-full">
                <Sparkles size={22} color="var(--color-accent)" />
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 18,
                    marginTop: 16,
                    color: "#fff",
                  }}
                >
                  AI Growth Coach
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.55)",
                    marginTop: 8,
                    lineHeight: 1.6,
                  }}
                >
                  Honest, evidence-backed insights — labeled by confidence,
                  never fabricated.
                </p>
              </GlassPanel>
            </TiltCard>

            <TiltCard>
              <GlassPanel className="p-6 h-full">
                <Lightbulb size={22} color="var(--color-accent)" />
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 18,
                    marginTop: 16,
                    color: "#fff",
                  }}
                >
                  Full content pipeline
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.55)",
                    marginTop: 8,
                    lineHeight: 1.6,
                  }}
                >
                  Ideas, scripts, and your upload schedule — all in one place,
                  start to finish.
                </p>
              </GlassPanel>
            </TiltCard>
          </div>
        </div>
      </div>
    </div>
  );
}
