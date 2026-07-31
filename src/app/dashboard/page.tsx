import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getChannelAnalytics, isYouTubeConnected } from "@/lib/analytics";
import { getHealthScore } from "@/lib/health-score";
import { getRecentWork } from "@/lib/dashboard/actions";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BarChart3, Sparkles, Lightbulb, FileText, Kanban } from "lucide-react";
import ConnectYouTubePrompt from "@/components/ConnectYouTubePrompt";
import ReconnectYouTubeNotice from "@/components/ReconnectYouTubeNotice";
import SignalBar from "./SignalBar";
import QuickAccessCard from "./QuickAccessCard";
import ResumeWork from "./ResumeWork";
import InteractiveCard from "@/components/ui/InteractiveCard";
import PageHeader from "@/components/ui/PageHeader";
import { labelColors } from "@/app/analytics/HealthScoreCard";
import type { HealthScore } from "@/lib/health-score";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [workspace, recentWork] = await Promise.all([
    prisma.workspace.findUnique({ where: { ownerId: session.user.id } }),
    getRecentWork(),
  ]);

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
    <div className="mx-auto max-w-[1160px] px-4 pt-6 pb-12 sm:px-10">
      <PageHeader
        eyebrow={workspace?.name ?? "Your workspace"}
        title={`Good to see you, ${firstName}`}
        description="Here's where your channel stands right now, plus quick access to every tool — analytics, coaching, ideas, scripts, and your upload pipeline."
      />

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
        <Link href="/analytics" className="mt-8 block no-underline">
          <InteractiveCard className="flex items-center justify-between">
            <div>
              <div className="text-sm tracking-[1px] text-[var(--color-text-muted)] uppercase">
                Channel Health
              </div>
              <div className="mt-[6px] flex items-baseline gap-[10px]">
                <span className="font-mono text-[34px] font-bold">
                  {healthScore.score}
                </span>
                <span
                  className="font-display text-base font-semibold"
                  style={{ color: labelColors[healthScore.label] }}
                >
                  {healthScore.label}
                </span>
              </div>
              <div className="mt-[10px] text-[13px] font-medium text-[var(--color-accent)]">
                View details →
              </div>
            </div>
            <SignalBar score={healthScore.score} />
          </InteractiveCard>
        </Link>
      )}

      <ResumeWork items={recentWork} />

      <h2 className="font-display mt-12 mb-4 text-[22px]">Quick access</h2>
      <div
        data-tour="quick-access"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
      >
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
