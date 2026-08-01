"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const COOKIE_NAME = "co_ref";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days — long enough to cover
// "saw the link, signed up a few weeks later," short enough that a code
// doesn't linger forever attributing an unrelated future signup.

// Mounted once in the root layout. Reads `?ref=<code>` off any page a
// visitor lands on (not just the landing page — a shared link could point
// anywhere) and remembers it in a plain, non-httpOnly cookie so the signup
// hook (src/lib/auth.ts's databaseHooks.user.create.after) can read it days
// later, whenever the visitor actually signs up. Doesn't touch src/proxy.ts
// deliberately — that file is the auth-gating security boundary, and this
// has nothing to do with it.
export default function ReferralCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (!ref) return;
    // A referral code is always exactly 8 of our alphabet's characters
    // (see src/lib/referral.ts) — reject anything else before it ever
    // touches a cookie, since this value gets echoed back into a DB query
    // on signup.
    if (!/^[A-Z2-9]{8}$/.test(ref)) return;

    document.cookie = `${COOKIE_NAME}=${ref}; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Lax`;
  }, [searchParams]);

  return null;
}
