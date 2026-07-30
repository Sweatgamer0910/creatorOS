import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Low-risk hardening only — confirmed via a live header check (2026-07-30)
  // that nothing beyond HSTS (which Vercel adds automatically) was set. A
  // real Content-Security-Policy is deliberately NOT included here: this
  // app loads Spline/Three.js/GSAP, reports to Sentry, and redirects through
  // Google/Discord OAuth, and a wrong CSP would silently break any of those
  // rather than fail loudly — needs to be built and tested against each of
  // them deliberately, not bolted on in the same pass as these headers.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // `|| undefined`: .env currently declares these as empty strings, not
  // absent — the plugin needs a real `undefined` to know to skip
  // source-map upload rather than trying (and failing) to authenticate
  // with an empty token.
  org: process.env.SENTRY_ORG || undefined,
  project: process.env.SENTRY_PROJECT || undefined,
  authToken: process.env.SENTRY_AUTH_TOKEN || undefined,
  // Without an authToken (unset until a real Sentry project exists) the
  // plugin just skips source-map upload rather than failing the build —
  // this wrapper is safe to ship ahead of that.
  silent: true,
  widenClientFileUpload: true,
  // disableLogger/automaticVercelMonitors both only apply to webpack
  // builds — this project builds with Turbopack (see the route table any
  // `next build` prints), where the plugin already no-ops them and just
  // warns that they're deprecated if set at all.
});
