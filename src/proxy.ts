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
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
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
