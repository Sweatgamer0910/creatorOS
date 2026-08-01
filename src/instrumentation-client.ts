import posthog from "posthog-js";
import * as Sentry from "@sentry/nextjs";

const posthogToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (posthogToken && posthogHost) {
  posthog.init(posthogToken, {
    api_host: posthogHost,
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
  });
} else if (process.env.NODE_ENV === "development") {
  const missingVariable = posthogToken
    ? "NEXT_PUBLIC_POSTHOG_HOST"
    : "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN";
  throw new Error(
    `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
  );
}

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
