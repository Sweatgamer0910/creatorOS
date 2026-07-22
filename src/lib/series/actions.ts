"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export type SeriesCadence = "daily" | "weekly" | "biweekly" | "custom";

async function getWorkspaceId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");

  const workspace = await prisma.workspace.findUnique({
    where: { ownerId: session.user.id },
  });
  if (!workspace) throw new Error("No workspace found");

  return workspace.id;
}

export async function createSeries(
  title: string,
  options?: { description?: string; cadence?: SeriesCadence },
) {
  const workspaceId = await getWorkspaceId();
  const series = await prisma.series.create({
    data: {
      title,
      description: options?.description,
      cadence: options?.cadence,
      workspaceId,
    },
  });
  revalidatePath("/series");
  revalidatePath("/ideas");
  return series;
}

export async function getSeriesList() {
  const workspaceId = await getWorkspaceId();
  return prisma.series.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { ideas: true } } },
  });
}

export async function getSeriesById(id: string) {
  const workspaceId = await getWorkspaceId();
  return prisma.series.findFirst({
    where: { id, workspaceId },
    include: {
      ideas: {
        orderBy: [{ episodeNumber: "asc" }, { createdAt: "asc" }],
        include: {
          scripts: {
            select: {
              id: true,
              contentItems: { select: { id: true, status: true } },
            },
          },
          contentItems: { select: { id: true, status: true } },
        },
      },
    },
  });
}
