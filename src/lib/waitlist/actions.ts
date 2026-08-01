"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redis } from "@/lib/redis";
import { addWaitlistContact } from "@/lib/resend-audience";
import { inngest } from "@/lib/inngest";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Fixed-window counter in the same Upstash Redis instance already used for
// auth rate limiting (src/lib/auth-rate-limit-storage.ts) — this is a public,
// unauthenticated write endpoint (anyone on the internet can hit the landing
// page), so it needs its own limit rather than relying on better-auth's
// limiter, which only covers its own routes. 5 submissions/hour/IP is
// generous for a real visitor filling out one form, tight enough to blunt a
// script hammering it to spam the waitlist table / run up Resend API calls.
async function isRateLimited(): Promise<boolean> {
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    "unknown";

  const key = `waitlist-ratelimit:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 3600);
  }
  return count > 5;
}

export async function joinWaitlist(email: string): Promise<{ error?: string }> {
  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_RE.test(trimmed)) {
    return { error: "Enter a valid email address." };
  }

  if (await isRateLimited()) {
    return { error: "Too many attempts — try again in a bit." };
  }

  // Raw SQL rather than prisma.waitlistEntry.upsert(...): the generated
  // Prisma client on disk needs `prisma generate` to have run against the
  // updated schema, which happens automatically via the `postinstall`
  // script on every real deploy, but this keeps the action correct
  // regardless of codegen timing — same reasoning as the migrate-scripted-
  // stage script using raw `pg` (see docs/DECISIONS_LOG.md, 2026-07-23).
  // ON CONFLICT DO NOTHING makes a repeat submission from the same email a
  // harmless no-op instead of an error.
  // RETURNING "id" (empty result on a conflict) is how we tell a genuinely
  // new signup apart from a repeat submission — the nurture sequence below
  // should only ever start once per email, not restart every time someone
  // re-submits the same address.
  const inserted = await prisma.$queryRaw<{ id: string }[]>`
    INSERT INTO "waitlist_entry" ("id", "email")
    VALUES (${crypto.randomUUID()}, ${trimmed})
    ON CONFLICT ("email") DO NOTHING
    RETURNING "id"
  `;
  const isNewSignup = inserted.length > 0;

  // Resend sync is best-effort — the table above is the source of truth,
  // same pattern as addToAudience being fire-and-forget from the signup
  // hook in src/lib/auth.ts.
  try {
    await addWaitlistContact(trimmed);
  } catch {
    // Swallow — a failed Resend sync shouldn't make the form look broken
    // to the visitor when their email was actually saved.
  }

  // Kicks off src/lib/inngest/waitlistNurture.ts — best-effort, same
  // reasoning as the Resend sync above, and only on a genuinely new row.
  if (isNewSignup) {
    try {
      await inngest.send({
        name: "app/waitlist.joined",
        data: { email: trimmed },
      });
    } catch {
      // Swallow — a failed event send shouldn't make the form look broken
      // to the visitor when their email was actually saved.
    }
  }

  return {};
}
