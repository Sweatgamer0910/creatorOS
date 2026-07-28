import * as Sentry from "@sentry/nextjs";

// Covers proxy.ts (Next's middleware) and any edge-runtime route —
// separate init from sentry.server.config.ts because the edge runtime is
// its own environment (no Node APIs), not because the config differs.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
});
