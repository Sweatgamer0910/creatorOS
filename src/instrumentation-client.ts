import * as Sentry from "@sentry/nextjs";

// No-ops safely if NEXT_PUBLIC_SENTRY_DSN is unset.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  // Session replay is off by default (off unless explicitly turned on) —
  // it captures DOM snapshots, which is a meaningfully bigger privacy
  // surface than error/perf data and isn't something this pass decided
  // to take on.
  debug: false,
});

// Sentry's own hook for App Router client-side navigation timing —
// required export when instrumentation-client.ts exists at all (Next.js
// warns otherwise), and gives navigation spans in the perf data above.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
