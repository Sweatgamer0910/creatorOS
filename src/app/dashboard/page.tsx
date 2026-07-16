import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getChannelAnalytics } from "@/lib/analytics";
import { getHealthScore } from "@/lib/health-score";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BarChart3, Sparkles, Lightbulb, FileText, Kanban } from "lucide-react";
import ConnectYouTubeButton from "./ConnectYouTubeButton";
import SignalBar from "./SignalBar";
import QuickAccessCard from "./QuickAccessCard";
import Card from "@/components/ui/Card";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const workspace = await prisma.workspace.findUnique({
    where: { ownerId: session.user.id },
  });

  const data = await getChannelAnalytics("growing");
  const healthScore = await getHealthScore(data);

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

      <Card padding="lg" className="mt-8 flex items-center justify-between">
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
              gap: 12,
              marginTop: 8,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 48,
                fontWeight: 700,
              }}
            >
              {healthScore.score}
            </span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>
              {healthScore.label}
            </span>
          </div>
          <p
            style={{
              fontSize: 14,
              color: "var(--color-text-muted)",
              marginTop: 10,
              maxWidth: 440,
              lineHeight: 1.5,
            }}
          >
            {healthScore.summary}
          </p>
        </div>
        <SignalBar score={healthScore.score} />
      </Card>

      <div className="mt-4">
        <ConnectYouTubeButton />
      </div>

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
