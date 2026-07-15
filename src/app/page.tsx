import { BarChart3, Sparkles, Lightbulb } from "lucide-react";
import Starfield from "@/components/landing/Starfield";
import GridHorizon from "@/components/landing/GridHorizon";
import TiltCard from "@/components/landing/TiltCard";
import GlassPanel from "@/components/landing/GlassPanel";
import Hero3D from "@/components/landing/Hero3D";
import LandingFooter from "@/components/landing/LandingFooter";

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

      {/* Hero3D now owns the headline/CTA content — it renders in the same
          pinned first frame as the 3D object, so there's no dead zone
          before the scene appears. */}
      <Hero3D />

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

      <LandingFooter />
    </div>
  );
}
