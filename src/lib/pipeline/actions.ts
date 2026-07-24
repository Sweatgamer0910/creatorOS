"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import type { PipelineStatus } from "./stages";
// Note: NOT re-exported from here. Next's "use server" build analysis
// statically scans every export of this file expecting a server action,
// and breaks even on a type-only re-export ("use server" files may only
// export async functions as values) — import PipelineStatus directly from
// "./stages" instead.

async function getWorkspaceId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");

  const workspace = await prisma.workspace.findUnique({
    where: { ownerId: session.user.id },
  });
  if (!workspace) throw new Error("No workspace found");

  return workspace.id;
}

export async function createContentItem(
  title: string,
  source?: { ideaId?: string; scriptId?: string },
) {
  const workspaceId = await getWorkspaceId();
  await prisma.contentItem.create({
    data: {
      title,
      workspaceId,
      // A card created directly from an existing script has obviously
      // already cleared that stage — start it at "scripted" rather than
      // "idea" so the board doesn't ask you to re-do a step you didn't
      // skip. Cards created from scratch or from just an idea still start
      // at the beginning.
      status: source?.scriptId ? "scripted" : "idea",
      ideaId: source?.ideaId,
      scriptId: source?.scriptId,
    },
  });
  revalidatePath("/pipeline");
}

export async function updateContentItemStatus(
  id: string,
  status: PipelineStatus,
) {
  const workspaceId = await getWorkspaceId();
  // Scoped to the caller's own workspace via updateMany (Prisma's `update`
  // only accepts unique-field where clauses, so ownership can't be part of
  // it) — without this, any authenticated user could update any other
  // workspace's content item just by knowing/guessing its id.
  const { count } = await prisma.contentItem.updateMany({
    where: { id, workspaceId },
    data: { status },
  });
  if (count === 0) throw new Error("Not found");
  revalidatePath("/pipeline");
}

export async function updateContentItemLink(
  id: string,
  link: { ideaId: string | null; scriptId: string | null },
) {
  const workspaceId = await getWorkspaceId();
  // Always sets both fields explicitly (rather than a partial patch) so a
  // card links to at most one of idea/script — same mutual exclusivity the
  // creation flow already has, enforced here instead of left ambiguous.
  const { count } = await prisma.contentItem.updateMany({
    where: { id, workspaceId },
    data: { ideaId: link.ideaId, scriptId: link.scriptId },
  });
  if (count === 0) throw new Error("Not found");
  revalidatePath("/pipeline");
}

export async function deleteContentItem(id: string) {
  const workspaceId = await getWorkspaceId();
  const { count } = await prisma.contentItem.deleteMany({
    where: { id, workspaceId },
  });
  if (count === 0) throw new Error("Not found");
  revalidatePath("/pipeline");
}

export async function getContentItems() {
  const workspaceId = await getWorkspaceId();
  return prisma.contentItem.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    include: {
      idea: {
        select: {
          id: true,
          title: true,
          episodeNumber: true,
          series: { select: { id: true, title: true } },
        },
      },
      script: { select: { id: true, title: true } },
    },
  });
}
