import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authSecondaryStorage } from "@/lib/auth-rate-limit-storage";
import { sendEmail } from "@/lib/email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  // Backs rate-limit counters (below) with Redis instead of better-auth's
  // default in-memory store, so limits survive a restart and are shared
  // across instances instead of being per-process.
  secondaryStorage: authSecondaryStorage,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
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
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
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
      // API traffic.
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await prisma.workspace.create({
            data: {
              name: `${user.name}'s Workspace`,
              ownerId: user.id,
            },
          });
        },
      },
    },
  },
});
