import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";

// Founder-only activation funnel view. Not linked from anywhere in the
// app's nav — reached by URL only, and gated below by comparing the
// signed-in user's email against ADMIN_EMAIL rather than a real roles
// system, since there's exactly one person who needs this today. If a
// second admin ever needs access, this should become a real role check
// instead of stacking more emails into one env var.
//
// The underlying question this answers: of everyone who's signed up, how
// many actually reached the "aha moment" (a connected YouTube channel)
// and kept going from there? That's the number that should gate spending
// real effort on marketing — not raw signup count. Mirrors the exact
// workspace-state logic already used to decide which lifecycle email to
// send (src/lib/inngest/activationSequence.ts's getWorkspaceState), just
// aggregated across every user instead of one at a time.
export default async function ActivationDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || session.user.email !== adminEmail) {
    redirect("/dashboard");
  }

  const totalUsers = await prisma.user.count();
  const workspaces = await prisma.workspace.findMany({
    select: {
      channels: { select: { id: true }, take: 1 },
      ideas: { select: { id: true }, take: 1 },
      scripts: { select: { id: true }, take: 1 },
      contentItems: { select: { id: true }, take: 1 },
    },
  });

  type WorkspaceStats = {
    channels: { id: string }[];
    ideas: { id: string }[];
    scripts: { id: string }[];
    contentItems: { id: string }[];
  };

  const totalWorkspaces = workspaces.length;
  const connected = workspaces.filter((w: WorkspaceStats) => w.channels.length > 0);
  const connectedCount = connected.length;
  const ideaOrScriptCount = connected.filter(
    (w: WorkspaceStats) => w.ideas.length > 0 || w.scripts.length > 0,
  ).length;
  const activeCount = workspaces.filter((w: WorkspaceStats) => {
    const featuresUsed = [
      w.channels.length > 0,
      w.ideas.length > 0,
      w.scripts.length > 0,
      w.contentItems.length > 0,
    ].filter(Boolean).length;
    return featuresUsed >= 2;
  }).length;

  const pct = (n: number) =>
    totalWorkspaces === 0 ? "—" : `${Math.round((n / totalWorkspaces) * 100)}%`;

  const rows = [
    {
      label: "Connected a YouTube channel",
      count: connectedCount,
      pct: pct(connectedCount),
      detail: "The real activation event — everything before this is just interest.",
    },
    {
      label: "...and created an idea or script",
      count: ideaOrScriptCount,
      pct: pct(ideaOrScriptCount),
      detail: "Went from seeing their data to actually doing something with it.",
    },
    {
      label: "Active (2+ features used)",
      count: activeCount,
      pct: pct(activeCount),
      detail: "Same threshold the day-14 upsell email checks for.",
    },
  ];

  return (
    <div
      className="px-4 sm:px-10"
      style={{ paddingTop: 24, paddingBottom: 64, maxWidth: 720, margin: "0 auto" }}
    >
      <PageHeader
        eyebrow="Internal · founder only"
        title="Activation"
        description="How many signups actually reach the moment CreatorOS proves itself, not just how many signed up."
      />

      <div className="mt-8">
        <Card padding="md">
          <div className="text-[13px] text-[var(--color-text-muted)]">
            Total signups
          </div>
          <div className="font-mono mt-1 text-3xl font-bold">
            {totalUsers.toLocaleString()}
          </div>
        </Card>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {rows.map((row) => (
          <Card key={row.label} padding="md">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <div className="text-[15px] font-medium">{row.label}</div>
              <div className="font-mono text-xl font-bold text-[var(--color-accent)]">
                {row.pct}
                <span className="ml-2 text-sm font-normal text-[var(--color-text-muted)]">
                  ({row.count.toLocaleString()})
                </span>
              </div>
            </div>
            <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
              {row.detail}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
