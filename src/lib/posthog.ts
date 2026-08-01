// Single shared PostHog client instance.
//
// Every component that calls posthog.capture() used to import posthog-js
// directly, same as instrumentation-client.ts (which calls posthog.init).
// That's PostHog's documented pattern and works fine under webpack because
// the bundler dedupes the module either way.
//
// Under Turbopack, instrumentation-client.ts is loaded as its own special,
// separately-bundled entry point (Next.js requires it to live outside the
// normal app chunk graph so it runs before hydration). That isolation is
// what broke here: components ended up capturing against a copy of
// posthog-js that init() was never called on, so every posthog.capture()
// call was a silent no-op in production, confirmed by watching the network
// tab: zero requests to the PostHog ingestion endpoint on actions that
// should have sent an event, with no error thrown.
//
// The fix: this file is now the only place that imports posthog-js and
// calls init(). Every consumer imports the already-initialized instance
// from here instead.
import posthog from "posthog-js";

const posthogToken = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (typeof window !== "undefined" && posthogToken && posthogHost) {
    posthog.init(posthogToken, {
          api_host: posthogHost,
          capture_exceptions: true,
          debug: process.env.NODE_ENV === "development",
    });
} else if (
    typeof window !== "undefined" &&
    process.env.NODE_ENV === "development"
  ) {
    const missingVariable = posthogToken
      ? "NEXT_PUBLIC_POSTHOG_HOST"
          : "NEXT_PUBLIC_POSTHOG_KEY";
    console.warn(
          missingVariable +
            " variable required by PostHog is missing or un-configured, this causes events to be silently missed.",
        );
}

export default posthog;
