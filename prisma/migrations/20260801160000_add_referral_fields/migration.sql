-- AlterTable
ALTER TABLE "user" ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "referredByCode" TEXT;

-- CreateIndex
-- Nullable + unique: Postgres allows any number of NULL rows under a unique
-- index, so this applies cleanly against the existing user table without an
-- interactive backfill decision (every pre-existing row just gets NULL,
-- lazily assigned a real code on first Settings page view — see
-- getOrCreateReferralCode in src/lib/referral.ts).
CREATE UNIQUE INDEX "user_referralCode_key" ON "user"("referralCode");
