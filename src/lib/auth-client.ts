import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
// Type-only — erased at build time, so this doesn't pull server code
// (Prisma, the auth secret, etc.) into the client bundle. Without this,
// `useSession().data.user` wouldn't know about `onboardingCompletedAt`
// (src/lib/auth.ts's `user.additionalFields`) at the type level, even
// though the field is genuinely present in the response at runtime.
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  requestPasswordReset,
  resetPassword,
  sendVerificationEmail,
  // Adds a provider to the CURRENTLY signed-in user's account, hitting
  // better-auth's /link-social endpoint. Distinct from signIn.social, which
  // starts a fresh sign-in/sign-up flow — calling signIn.social while
  // already authenticated (e.g. "Connect YouTube" for a user who signed up
  // with Discord) doesn't add Google alongside the existing session, it can
  // resolve to a different account entirely and drop the Discord link.
  // See ConnectYouTubeButton.tsx for the one call site that needs this
  // instead of signIn.social.
  linkSocial,
} = authClient;
