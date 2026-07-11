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

export async function createContentItem(title: string) {
  const workspaceId = await getWorkspaceId();
  await prisma.contentItem.create({
    data: { title, workspaceId, status: "idea" },
  });
  revalidatePath("/pipeline");
}

export async function updateContentItemStatus(id: string, status: PipelineStatus) {
  await prisma.contentItem.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/pipeline");
}

export async function deleteContentItem(id: string) {
  await prisma.contentItem.delete({ where: { id } });
  revalidatePath("/pipeline");
}

export async function getContentItems() {
  const workspaceId = await getWorkspaceId();
  return prisma.contentItem.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
}
