import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

// Excludes 0/O/1/I — the code is meant to be pasted into a URL, but people
// do sometimes read these out loud or retype them, and those four
// characters are the ones most often confused for each other.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;

function randomCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

// Called once, right after a new User row exists (databaseHooks.user.create.after
// in src/lib/auth.ts) — not a Prisma @default(cuid()) on the column, because
// a short, human-shareable code is the whole point (creatoros.onl/?ref=<code>
// reads a lot better than the row's own ~25-char cuid). Collisions are
// astronomically unlikely at this scale (33^8 ≈ 1.1 trillion possibilities),
// but the retry loop costs nothing and removes the theoretical risk of a
// unique-constraint crash blocking signup.
export async function assignReferralCode(userId: string): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { referralCode: code },
      });
      return code;
    } catch (err) {
      const isUniqueConflict =
        err !== null &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code?: string }).code === "P2002";
      if (!isUniqueConflict) throw err;
    }
  }
  throw new Error(
    "assignReferralCode: could not generate a unique code after 5 attempts",
  );
}

export async function countReferrals(code: string): Promise<number> {
  return prisma.user.count({ where: { referredByCode: code } });
}

// Every real read path (currently just Settings' Invite panel) goes through
// this instead of reading user.referralCode directly, so accounts created
// before this feature shipped get a code lazily on first view instead of
// showing a broken/empty invite link forever.
export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });
  if (user?.referralCode) return user.referralCode;
  return assignReferralCode(userId);
}
