import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authSecondaryStorage } from "@/lib/auth-rate-limit-storage";
import { addToAudience } from "@/lib/resend-audience";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  // Backs rate-limit counters (below) with Redis instead of better-auth's
  // default in-memory store, so limits survive a restart and are shared
  // across instances instead of being per-process.
  secondaryStorage: authSecondaryStorage,
  // OAuth-only as of 2026-07-28 (see docs/DECISIONS_LOG.md) — no
  // emailAndPassword/emailVerification config at all. Google/Discord accounts
  // are considered verified the moment the provider confirms them, so there's
  // no verification-email step, no password to reset, and no dependency on
  // Resend's sending-domain restrictions for sign-up to work.
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      scope: [
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/yt-analytics.readonly",
      ],
      accessType: "offline",
      prompt: "consent",
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "discord"],
    },
  },
  user: {
    additionalFields: {
      // Surfaces onto session.user so OnboardingTourHost can decide to
      // auto-launch client-side without a separate fetch. `input: false`
      // blocks it from any user-facing update-profile call — only
      // completeOnboarding() (src/lib/onboarding/actions.ts) ever writes it.
      onboardingCompletedAt: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  // @upstash/ratelimit was a dependency with nothing using it — this is
  // better-auth's own built-in limiter instead (one less rate-limiting
  // implementation to maintain), stored in the Redis-backed
  // `secondaryStorage` above. Explicitly enabled rather than left on the
  // production-only default, since credential brute-forcing is exactly as
  // possible against a dev/staging deploy.
  // No more "/sign-in/email" / "/sign-up/email" custom rules — those routes
  // don't exist now that auth is OAuth-only. The general 30/60s budget still
  // covers OAuth callback traffic.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 30,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const workspace = await prisma.workspace.create({
            data: {
              name: `${user.name}'s Workspace`,
              ownerId: user.id,
            },
          });

          // Best-effort sync into the Resend audience for marketing/product
          // emails. Never throw from here: a Resend outage or missing env
          // var should not block account creation, same reasoning as the
          // old sendVerificationEmail try/catch.
          try {
            await addToAudience({
              email: user.email,
              name: user.name,
              // `as { plan: string }`: the generated Prisma client in this
              // sandbox predates the `plan` column being added to schema.prisma
              // and can't be regenerated here (network-blocked from
              // binaries.prisma.sh — see docs/DECISIONS_LOG.md). Vercel's
              // `postinstall` (`prisma generate`) runs in an unrestricted
              // environment on every deploy, so the real generated client
              // there has `plan` typed properly — this cast only exists to
              // satisfy this sandbox's stale local types.
              plan: (workspace as unknown as { plan: string }).plan,
            });
          } catch (err) {
            console.error("[auth] Failed to sync new user to Resend audience:", err);
          }
        },
      },
    },
  },
});
