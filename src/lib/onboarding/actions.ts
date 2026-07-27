"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Called on both Finish and Skip — dismissing the tour permanently marks
// it done (same "don't show again" idiom as ResumeWork.tsx's dismiss
// state), not "remind me later". Replaying afterward is opt-in via the
// nav's help icon, which starts the tour locally without touching this.
export async function completeOnboarding() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingCompletedAt: new Date() },
  });
}
