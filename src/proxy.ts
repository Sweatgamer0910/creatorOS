import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Centralized route protection. Before this existed, every app page had to
// remember to add its own `if (!session) redirect("/login")` — three of
// them (pipeline, ideas, scripts) didn't, and two server actions had no
// auth check at all. This is a fast, cookie-presence check (no DB hit,
// safe to run on every request) that closes the gap at the routing layer
// instead of relying on every page getting it right individually. It does
// NOT replace the per-page `auth.api.getSession()` checks — those still
// validate the session for real and scope data to the workspace; this is
// just the first, cheap gate.
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/privacy",
  "/terms",
  "/channel-health",
];

// Prefix-matched rather than exact-matched, unlike PUBLIC_PATHS above —
// /blog has real sub-routes (/blog/[slug], one per post) that an exact-path
// allowlist can't cover without listing every slug by hand. Added
// alongside /channel-health to PUBLIC_PATHS 2026-07-31: both are public,
// no-login growth pages built after this file, and neither was in the
// allowlist — every anonymous visitor to either one was silently bounced
// to /login instead of seeing the actual page.
const PUBLIC_PATH_PREFIXES = ["/blog"];

// API routes whose callers are never a logged-in browser, so a session
// cookie should never be required: Inngest Cloud calls /api/inngest with
// its own signing key, not a cookie; mail clients and logged-out humans
// call /api/unsubscribe directly from an email; social-card crawlers fetch
// /api/og/channel-health with no cookie at all. Verified 2026-08-09 that
// all three were previously falling through to the session-cookie check
// below and getting redirected to /login instead of ever reaching their
// route handlers — silently breaking background jobs, the CAN-SPAM
// unsubscribe flow, and shared-link preview images.
const PUBLIC_API_PATHS = [
  "/api/inngest",
  "/api/unsubscribe",
  "/api/og/channel-health",
];

// Any request for a file with an extension (.glb, .svg, .png, .woff2, ...)
// is a static asset from public/, never a protected page or API route —
// this app's page routes never have extensions in their paths. Checking
// this generically, instead of adding each new asset to PUBLIC_PATHS by
// hand, is what this fixes: the landing page's 3D scene fetches
// /models/nova.glb client-side, that path wasn't in PUBLIC_PATHS, so
// every anonymous visitor got redirected to /login mid-request — the
// browser tried to parse the returned /login HTML as a binary model and
// the whole page crashed. A file-extension check can't go stale the same
// way an exact-path allowlist does.
const STATIC_FILE_PATTERN = /\.[a-zA-Z0-9]+$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    PUBLIC_API_PATHS.includes(pathname) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    STATIC_FILE_PATTERN.test(pathname)
  ) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
