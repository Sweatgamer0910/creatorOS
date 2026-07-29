import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authSecondaryStorage } from "@/lib/auth-rate-limit-storage";
import { addToAudience } from "@/lib/resend-audience";
import { sendEmail } from "@/lib/email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  // Backs rate-limit counters (below) with Redis instead of better-auth's
  // default in-memory store, so limits survive a restart and are shared
  // across instances instead of being per-process.
  secondaryStorage: authSecondaryStorage,
  // Re-enabled 2026-07-29 now that creatoros.onl has a verified Resend
  // sending domain (see docs/DECISIONS_LOG.md) — the OAuth-only restriction
  // from 2026-07-28 existed only because verification/reset emails to real
  // users required a verified domain, which didn't exist yet. Google/Discord
  // remain available alongside email/password, not replaced by it.
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      try {
        await sendEmail({
          to: user.email,
          subject: "Reset your CreatorOS password",
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
              <h2 style="color: #0e1116;">Reset your password</h2>
              <p style="color: #444;">
                Someone requested a password reset for ${user.email}. If this
                wasn't you, you can ignore this email.
              </p>
              <p>
                <a href="${url}" style="display: inline-block; margin-top: 12px; padding: 10px 20px; background: #f5a623; color: #000; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  Reset password
                </a>
              </p>
              <p style="color: #888; font-size: 13px; margin-top: 24px;">
                Or paste this link into your browser: ${url}
              </p>
            </div>
          `,
        });
      } catch (err) {
        console.error("[auth] Failed to send reset-password email:", err);
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await sendEmail({
          to: user.email,
          subject: "Verify your CreatorOS email",
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
              <h2 style="color: #0e1116;">Verify your email</h2>
              <p style="color: #444;">
                Confirm ${user.email} to finish setting up your CreatorOS account.
              </p>
              <p>
                <a href="${url}" style="display: inline-block; margin-top: 12px; padding: 10px 20px; background: #f5a623; color: #000; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  Verify email
                </a>
              </p>
              <p style="color: #888; font-size: 13px; margin-top: 24px;">
                Or paste this link into your browser: ${url}
              </p>
            </div>
          `,
        });
      } catch (err) {
        // Don't let a provider outage brick sign-up with an unhandled
        // exception — log it server-side so it's visible, but the request
        // itself still completes (the account exists, the link just
        // didn't send; the user can request another one).
        console.error("[auth] Failed to send verification email:", err);
      }
    },
  },
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
  rateLimit: {
    enabled: true,
    window: 60,
    max: 30,
    customRules: {
      // Credential-guessing endpoints get a tighter budget than general
      // API traffic, back now that email/password sign-in exists again.
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
    },
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
            console.error(
              "[auth] Failed to sync new user to Resend audience:",
              err,
            );
          }
        },
      },
    },
  },
});
