import {
  BarChart3,
  Sparkles,
  Lightbulb,
  FileText,
  Kanban,
  LayoutDashboard,
} from "lucide-react";
import Starfield from "@/components/landing/Starfield";
import GridHorizon from "@/components/landing/GridHorizon";
import TiltCard from "@/components/landing/TiltCard";
import GlassPanel from "@/components/landing/GlassPanel";
import Hero from "@/components/landing/Hero";
import LandingFooter from "@/components/landing/LandingFooter";

// Every shipped feature gets a card — the landing page previously only
// advertised 3 of the app's 6 real feature areas (Idea Lab and Script
// Studio weren't represented at all), which under-sold the product and
// left the page looking sparser than the app actually is.
const features = [
  {
    icon: LayoutDashboard,
    title: "Mission control dashboard",
    description:
      "Your channel health score, quick access to every tool, and what to work on next — one screen, no digging.",
  },
  {
    icon: BarChart3,
    title: "Real analytics",
    description:
      "Views, subscribers, and watch time — pulled directly from YouTube, not guessed at.",
  },
  {
    icon: Sparkles,
    title: "AI Growth Coach",
    description:
      "Honest, evidence-backed insights — labeled by confidence, never fabricated.",
  },
  {
    icon: Lightbulb,
    title: "Idea Lab",
    description:
      "Capture video ideas the moment they hit you, before they're gone by the time you sit down to film.",
  },
  {
    icon: FileText,
    title: "Script Studio",
    description:
      "Draft hook, intro, body, and outro section by section — structure that keeps you from staring at a blank page.",
  },
  {
    icon: Kanban,
    title: "Full content pipeline",
    description:
      "Idea, script, and upload schedule in one place — drag a video from idea to published.",
  },
];

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
        <div style={{ maxWidth: 640, marginBottom: 48 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 3.5vw, 40px)",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.15,
            }}
          >
            Everything you need to grow, nothing you don&apos;t
          </h2>
          <p
            style={{
              fontSize: 17,
              color: "rgba(255,255,255,0.6)",
              marginTop: 12,
              lineHeight: 1.6,
            }}
          >
            Six tools, one workspace — from the first spark of an idea to
            tracking how the video actually performed.
          </p>
        </div>

        <div style={{ position: "relative", paddingTop: 16 }}>
          <div style={{ position: "absolute", inset: 0 }}>
            <GridHorizon />
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description }) => (
              <TiltCard key={title}>
                <GlassPanel className="p-8 h-full">
                  <Icon size={30} color="var(--color-accent)" />
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 23,
                      marginTop: 20,
                      color: "#fff",
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontSize: 16,
                      color: "rgba(255,255,255,0.55)",
                      marginTop: 10,
                      lineHeight: 1.6,
                    }}
                  >
                    {description}
                  </p>
                </GlassPanel>
              </TiltCard>
            ))}
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}
