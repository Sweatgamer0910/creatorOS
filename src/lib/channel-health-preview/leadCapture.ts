"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redis } from "@/lib/redis";
import { addChannelCheckLead } from "@/lib/resend-audience";
import { inngest } from "@/lib/inngest";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Same fixed-window pattern as waitlist/actions.ts and the preview action
// itself — a public, unauthenticated write endpoint needs its own limit.
async function isRateLimited(): Promise<boolean> {
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    "unknown";

  const key = `channel-check-lead-ratelimit:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 3600);
  }
  return count > 10;
}

// Called when a visitor to /channel-health opts in to "email me tips"
// after seeing their free preview — optional, not required to see the
// score (see ChannelHealthChecker.tsx). Records the lead, syncs to
// Resend, and starts the nurture sequence (src/lib/inngest/
// channelCheckNurture.ts) — but only the first time this email shows up
// here, so checking a second channel later doesn't start a second,
// overlapping email sequence.
export async function captureChannelCheckLead({
  email,
  channelTitle,
  score,
}: {
  email: string;
  channelTitle: string;
  score: number;
}): Promise<{ error?: string }> {
  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_RE.test(trimmed)) {
    return { error: "Enter a valid email address." };
  }

  if (await isRateLimited()) {
    return { error: "Too many attempts — try again in a bit." };
  }

  const existing = await prisma.$queryRaw<{ id: string }[]>`
    SELECT "id" FROM "channel_check_lead" WHERE "email" = ${trimmed} LIMIT 1
  `;
  const isFirstCapture = existing.length === 0;

  await prisma.$executeRaw`
    INSERT INTO "channel_check_lead" ("id", "email", "channelTitle", "score")
    VALUES (${crypto.randomUUID()}, ${trimmed}, ${channelTitle}, ${score})
  `;

  try {
    await addChannelCheckLead(trimmed);
  } catch {
    // Swallow — best-effort, same reasoning as every other Resend sync in
    // this codebase (a failed sync shouldn't make the form look broken).
  }

  if (isFirstCapture) {
    try {
      await inngest.send({
        name: "app/channel-health.captured",
        data: { email: trimmed, channelTitle, score },
      });
    } catch {
      // Swallow — best-effort, same reasoning as joinWaitlist's event send.
    }
  }

  return {};
}
