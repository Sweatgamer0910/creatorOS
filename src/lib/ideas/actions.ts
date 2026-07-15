"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function getWorkspaceId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");

  const workspace = await prisma.workspace.findUnique({
    where: { ownerId: session.user.id },
  });
  if (!workspace) throw new Error("No workspace found");

  return workspace.id;
}

export async function createIdea(title: string, notes: string) {
  const workspaceId = await getWorkspaceId();
  await prisma.idea.create({
    data: { title, notes, workspaceId },
  });
  revalidatePath("/ideas");
}

export async function deleteIdea(id: string) {
  const workspaceId = await getWorkspaceId();
  const { count } = await prisma.idea.deleteMany({
    where: { id, workspaceId },
  });
  if (count === 0) throw new Error("Not found");
  revalidatePath("/ideas");
}

export async function getIdeas() {
  const workspaceId = await getWorkspaceId();
  return prisma.idea.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
}
