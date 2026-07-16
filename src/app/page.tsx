import { BarChart3, Sparkles, Lightbulb } from "lucide-react";
import Starfield from "@/components/landing/Starfield";
import GridHorizon from "@/components/landing/GridHorizon";
import TiltCard from "@/components/landing/TiltCard";
import GlassPanel from "@/components/landing/GlassPanel";
import Hero from "@/components/landing/Hero";
import LandingFooter from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: "#000000",
        overflowX: "hidden",
      }}
    >
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <Starfield />
      </div>

      <Hero />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 40px 96px",
        }}
      >
        <div style={{ position: "relative", paddingTop: 16 }}>
          <div style={{ position: "absolute", inset: 0 }}>
            <GridHorizon />
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8">
            <TiltCard>
              <GlassPanel className="p-8 h-full">
                <BarChart3 size={30} color="var(--color-accent)" />
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 23,
                    marginTop: 20,
                    color: "#fff",
                  }}
                >
                  Real analytics
                </h3>
                <p
                  style={{
                    fontSize: 16,
                    color: "rgba(255,255,255,0.55)",
                    marginTop: 10,
                    lineHeight: 1.6,
                  }}
                >
                  Views, subscribers, and watch time — pulled directly from
                  YouTube, not guessed at.
                </p>
              </GlassPanel>
            </TiltCard>

            <TiltCard>
              <GlassPanel className="p-8 h-full">
                <Sparkles size={30} color="var(--color-accent)" />
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 23,
                    marginTop: 20,
                    color: "#fff",
                  }}
                >
                  AI Growth Coach
                </h3>
                <p
                  style={{
                    fontSize: 16,
                    color: "rgba(255,255,255,0.55)",
                    marginTop: 10,
                    lineHeight: 1.6,
                  }}
                >
                  Honest, evidence-backed insights — labeled by confidence,
                  never fabricated.
                </p>
              </GlassPanel>
            </TiltCard>

            <TiltCard>
              <GlassPanel className="p-8 h-full">
                <Lightbulb size={30} color="var(--color-accent)" />
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 23,
                    marginTop: 20,
                    color: "#fff",
                  }}
                >
                  Full content pipeline
                </h3>
                <p
                  style={{
                    fontSize: 16,
                    color: "rgba(255,255,255,0.55)",
                    marginTop: 10,
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

      <LandingFooter />
    </div>
  );
}
