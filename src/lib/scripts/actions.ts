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

export async function createScript(title: string) {
  const workspaceId = await getWorkspaceId();
  const script = await prisma.script.create({
    data: { title, workspaceId },
  });
  revalidatePath("/scripts");
  return script;
}

export async function updateScript(
  id: string,
  fields: Partial<{
    title: string;
    hook: string;
    intro: string;
    body: string;
    outro: string;
  }>,
) {
  const workspaceId = await getWorkspaceId();
  // updateMany (not update) so ownership can be part of the where clause —
  // otherwise any authenticated user could edit any other workspace's
  // script by id, since script ids are otherwise unauthenticated-readable
  // strings, not a secret.
  const { count } = await prisma.script.updateMany({
    where: { id, workspaceId },
    data: fields,
  });
  if (count === 0) throw new Error("Not found");
  revalidatePath("/scripts");
  revalidatePath(`/scripts/${id}`);
}

export async function deleteScript(id: string) {
  const workspaceId = await getWorkspaceId();
  const { count } = await prisma.script.deleteMany({
    where: { id, workspaceId },
  });
  if (count === 0) throw new Error("Not found");
  revalidatePath("/scripts");
}

export async function getScripts() {
  const workspaceId = await getWorkspaceId();
  return prisma.script.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getScript(id: string) {
  const workspaceId = await getWorkspaceId();
  // findFirst + workspaceId, not findUnique(id) — this was previously
  // readable by anyone who knew/guessed a script id, logged in or not.
  return prisma.script.findFirst({ where: { id, workspaceId } });
}
