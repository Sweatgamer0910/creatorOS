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
} = authClient;
