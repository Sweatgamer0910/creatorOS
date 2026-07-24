"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PIPELINE_STAGE_LABELS } from "@/lib/pipeline/stages";

async function getWorkspaceId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");

  const workspace = await prisma.workspace.findUnique({
    where: { ownerId: session.user.id },
  });
  if (!workspace) throw new Error("No workspace found");

  return workspace.id;
}

const PIPELINE_ACTION_LABELS: Record<string, string> = {
  idea: "Move it forward",
  scripted: "Start filming",
  filming: "Keep filming",
  editing: "Keep editing",
};

export type RecentWorkItem = {
  id: string;
  type: "idea" | "script" | "pipeline";
  title: string;
  stageLabel: string;
  actionLabel: string;
  href: string;
  updatedAt: Date;
};

// Surfaces unfinished work across ideas/scripts/pipeline cards for the
// Dashboard's "pick up where you left off" widget. Excludes anything
// already superseded further down the idea -> script -> pipeline-card
// chain, same dual-path check (direct link or via the idea) that
// src/lib/series/stage.ts's computeIdeaStage uses.
export async function getRecentWork(): Promise<RecentWorkItem[]> {
  const workspaceId = await getWorkspaceId();

  const [ideas, scripts, contentItems] = await Promise.all([
    prisma.idea.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        updatedAt: true,
        scripts: { select: { id: true } },
        contentItems: { select: { id: true } },
      },
    }),
    prisma.script.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        updatedAt: true,
        contentItems: { select: { id: true } },
        idea: { select: { contentItems: { select: { id: true } } } },
      },
    }),
    prisma.contentItem.findMany({
      where: { workspaceId, status: { not: "published" } },
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
      },
    }),
  ]);

  const items: RecentWorkItem[] = [];

  for (const idea of ideas) {
    if (idea.scripts.length > 0 || idea.contentItems.length > 0) continue;
    items.push({
      id: idea.id,
      type: "idea",
      title: idea.title,
      stageLabel: "Idea",
      actionLabel: "Write a script",
      href: `/scripts?ideaId=${idea.id}`,
      updatedAt: idea.updatedAt,
    });
  }

  for (const script of scripts) {
    const hasPipelineCard =
      script.contentItems.length > 0 ||
      (script.idea?.contentItems.length ?? 0) > 0;
    if (hasPipelineCard) continue;
    items.push({
      id: script.id,
      type: "script",
      title: script.title,
      stageLabel: "Scripted",
      actionLabel: "Continue writing",
      href: `/scripts/${script.id}`,
      updatedAt: script.updatedAt,
    });
  }

  for (const item of contentItems) {
    items.push({
      id: item.id,
      type: "pipeline",
      title: item.title,
      stageLabel:
        (PIPELINE_STAGE_LABELS as Record<string, string>)[item.status] ??
        "In pipeline",
      actionLabel: PIPELINE_ACTION_LABELS[item.status] ?? "Continue",
      href: "/pipeline",
      updatedAt: item.updatedAt,
    });
  }

  return items
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 4);
}
