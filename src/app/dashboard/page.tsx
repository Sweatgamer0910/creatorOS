import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getChannelAnalytics, isYouTubeConnected } from "@/lib/analytics";
import { getHealthScore } from "@/lib/health-score";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BarChart3, Sparkles, Lightbulb, FileText, Kanban } from "lucide-react";
import ConnectYouTubePrompt from "@/components/ConnectYouTubePrompt";
import ReconnectYouTubeNotice from "@/components/ReconnectYouTubeNotice";
import SignalBar from "./SignalBar";
import QuickAccessCard from "./QuickAccessCard";
import InteractiveCard from "@/components/ui/InteractiveCard";
import { labelColors } from "@/app/analytics/HealthScoreCard";
import type { HealthScore } from "@/lib/health-score";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const workspace = await prisma.workspace.findUnique({
    where: { ownerId: session.user.id },
  });

  const connected = await isYouTubeConnected(session.user.id);
  let healthScore: HealthScore | null = null;
  let fetchFailed = false;

  if (connected) {
    try {
      const data = await getChannelAnalytics(session.user.id);
      healthScore = data && (await getHealthScore(data));
    } catch (e) {
      console.error("[dashboard] Failed to load channel analytics:", e);
      fetchFailed = true;
    }
  }

  const firstName = session.user.name.split(" ")[0];

  return (
    <div
      style={{ padding: "24px 40px 48px", maxWidth: 1160, margin: "0 auto" }}
    >
      <p style={{ color: "var(--color-text-muted)", fontSize: 15 }}>
        {workspace?.name ?? "Your workspace"}
      </p>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(30px, 3.5vw, 38px)",
          marginTop: 6,
        }}
      >
        Good to see you, {firstName}
      </h1>
      <p
        style={{
          color: "var(--color-text-muted)",
          fontSize: 16,
          marginTop: 10,
          maxWidth: 640,
          lineHeight: 1.6,
        }}
      >
        Here&apos;s where your channel stands right now, plus quick access to
        every tool — analytics, coaching, ideas, scripts, and your upload
        pipeline.
      </p>

      {/* Compact "quick glance" tile linking out to Analytics, which owns
          the full detailed/disclaimer-annotated version
          (src/app/analytics/HealthScoreCard.tsx) — this used to duplicate
          that card's explanation almost word for word. Score styling
          (mono font, label color) intentionally echoes that card so this
          reads as "the same metric, smaller," not a different one. */}
      {!connected && (
        <ConnectYouTubePrompt
          description="Connect your YouTube channel to see your Channel Health score and quick stats here."
          callbackURL="/dashboard"
        />
      )}
      {connected && fetchFailed && (
        <ReconnectYouTubeNotice callbackURL="/dashboard" />
      )}
      {connected && healthScore && (
        <Link
          href="/analytics"
          className="mt-8 block"
          style={{ textDecoration: "none" }}
        >
          <InteractiveCard className="flex items-center justify-between">
            <div>
              <div
                style={{
                  fontSize: 14,
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Channel Health
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 10,
                  marginTop: 6,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 34,
                    fontWeight: 700,
                  }}
                >
                  {healthScore.score}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 16,
                    fontWeight: 600,
                    color: labelColors[healthScore.label],
                  }}
                >
                  {healthScore.label}
                </span>
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--color-accent)",
                  marginTop: 10,
                  fontWeight: 500,
                }}
              >
                View details →
              </div>
            </div>
            <SignalBar score={healthScore.score} />
          </InteractiveCard>
        </Link>
      )}

      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 22,
          marginTop: 48,
          marginBottom: 16,
        }}
      >
        Quick access
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <QuickAccessCard
          href="/analytics"
          label="Analytics"
          description="Track views, subs, and watch time"
          icon={BarChart3}
        />
        <QuickAccessCard
          href="/coach"
          label="Growth Coach"
          description="Get AI-backed insights on your channel"
          icon={Sparkles}
        />
        <QuickAccessCard
          href="/ideas"
          label="Idea Lab"
          description="Capture and organize video ideas"
          icon={Lightbulb}
        />
        <QuickAccessCard
          href="/scripts"
          label="Script Studio"
          description="Write and refine your scripts"
          icon={FileText}
        />
        <QuickAccessCard
          href="/pipeline"
          label="Content Pipeline"
          description="Plan your upload schedule"
          icon={Kanban}
        />
      </div>
    </div>
  );
}
