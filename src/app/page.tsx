import LandingScrollTracker from "@/components/landing/LandingScrollTracker";
import LandingScene from "@/components/landing/LandingScene";
import LandingNav from "@/components/landing/LandingNav";
import Hero from "@/components/landing/Hero";
import PipelineSection from "@/components/landing/PipelineSection";
import WorkspaceAssembly from "@/components/landing/WorkspaceAssembly";
import Manifesto from "@/components/landing/Manifesto";
import FeatureGrid from "@/components/landing/FeatureGrid";
import ConfidenceSystem from "@/components/landing/ConfidenceSystem";
import LandingFooter from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: "#030304",
        backgroundImage:
          "radial-gradient(ellipse at 50% 20%, rgba(245,166,35,0.10), transparent 60%)",
      }}
    >
      <LandingScrollTracker />
      <LandingScene />

      <div style={{ position: "relative", zIndex: 1 }}>
        <LandingNav />
        <Hero />
        <PipelineSection />
        <WorkspaceAssembly />
        <Manifesto />
        <FeatureGrid />
        <ConfidenceSystem />
        <LandingFooter />
      </div>
    </div>
  );
}
