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
    hookComplete: boolean;
    introComplete: boolean;
    bodyComplete: boolean;
    outroComplete: boolean;
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

// Manual only — snapshots are taken on explicit user action ("save
// version"), never on every autosave, or the table would fill up with a
// row per keystroke-debounce cycle.
export async function createScriptVersion(scriptId: string) {
  const workspaceId = await getWorkspaceId();
  const script = await prisma.script.findFirst({
    where: { id: scriptId, workspaceId },
  });
  if (!script) throw new Error("Not found");

  const version = await prisma.scriptVersion.create({
    data: {
      scriptId,
      hook: script.hook,
      intro: script.intro,
      body: script.body,
      outro: script.outro,
    },
  });
  revalidatePath(`/scripts/${scriptId}`);
  return version;
}

export async function getScriptVersions(scriptId: string) {
  const workspaceId = await getWorkspaceId();
  const script = await prisma.script.findFirst({
    where: { id: scriptId, workspaceId },
  });
  if (!script) throw new Error("Not found");

  return prisma.scriptVersion.findMany({
    where: { scriptId },
    orderBy: { createdAt: "desc" },
  });
}

export async function restoreScriptVersion(
  scriptId: string,
  versionId: string,
) {
  const workspaceId = await getWorkspaceId();
  const script = await prisma.script.findFirst({
    where: { id: scriptId, workspaceId },
  });
  if (!script) throw new Error("Not found");

  // ScriptVersion has no workspaceId of its own — ownership is enforced by
  // first verifying the parent script above, then scoping this lookup to
  // that already-verified scriptId.
  const version = await prisma.scriptVersion.findFirst({
    where: { id: versionId, scriptId },
  });
  if (!version) throw new Error("Version not found");

  await prisma.script.updateMany({
    where: { id: scriptId, workspaceId },
    data: {
      hook: version.hook,
      intro: version.intro,
      body: version.body,
      outro: version.outro,
    },
  });
  revalidatePath(`/scripts/${scriptId}`);
}
