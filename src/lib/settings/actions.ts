"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");
  return session;
}

// Best-effort — tells Google to actually invalidate the grant, not just
// forget our local copy of it. A failure here (expired token, network
// blip) shouldn't block the user from disconnecting/deleting locally.
async function revokeGoogleToken(accessToken: string | null) {
  if (!accessToken) return;
  try {
    await fetch(
      `https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(accessToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );
  } catch (e) {
    console.error(
      "[settings] Failed to revoke Google token (continuing anyway):",
      e,
    );
  }
}

export async function updateWorkspaceName(name: string) {
  const session = await getSession();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Workspace name can't be empty");

  await prisma.workspace.update({
    where: { ownerId: session.user.id },
    data: { name: trimmed },
  });
  revalidatePath("/settings");
}

// Deletes the Google-linked Account row — this is the only thing
// isYouTubeConnected() checks (src/lib/analytics/index.ts), so it's what
// actually disconnects the channel app-wide. Note: since Google is
// currently this app's only sign-in method, this also removes the user's
// way to log in with Google — Settings' UI says so plainly before calling
// this, and "Forgot password" still gets them back into the same account.
export async function disconnectYouTube() {
  const session = await getSession();
  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, providerId: "google" },
  });
  if (!account) return;

  await revokeGoogleToken(account.accessToken);
  await prisma.account.delete({ where: { id: account.id } });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  revalidatePath("/coach");
}

// Every child row (Workspace and everything under it, Session, Account)
// cascades from User per prisma/schema.prisma's onDelete: Cascade chain —
// one delete call removes the whole account. The caller is responsible
// for signing out and redirecting afterward (this only touches the DB).
export async function deleteAccount() {
  const session = await getSession();

  const googleAccount = await prisma.account.findFirst({
    where: { userId: session.user.id, providerId: "google" },
  });
  await revokeGoogleToken(googleAccount?.accessToken ?? null);

  await prisma.user.delete({ where: { id: session.user.id } });
}
