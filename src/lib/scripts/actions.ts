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
  await prisma.script.update({
    where: { id },
    data: fields,
  });
  revalidatePath("/scripts");
  revalidatePath(`/scripts/${id}`);
}

export async function deleteScript(id: string) {
  await prisma.script.delete({ where: { id } });
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
  return prisma.script.findUnique({ where: { id } });
}
