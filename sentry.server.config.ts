import * as Sentry from "@sentry/nextjs";

// No-ops safely if NEXT_PUBLIC_SENTRY_DSN is unset — lets this ship now
// and start reporting the moment a real DSN is added to .env, with no
// code change required.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  // Errors and performance data only — see src/app/privacy/page.tsx for
  // what CreatorOS otherwise collects; this doesn't add PII beyond
  // whatever a stack trace/request path incidentally contains.
  debug: false,
});
