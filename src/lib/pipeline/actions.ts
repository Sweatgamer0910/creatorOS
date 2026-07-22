"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export type PipelineStatus = "idea" | "filming" | "editing" | "published";

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
      status: "idea",
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
      idea: { select: { id: true, title: true } },
      script: { select: { id: true, title: true } },
    },
  });
}
