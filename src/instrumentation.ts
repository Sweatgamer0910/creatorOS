// Next.js's own instrumentation hook — runs once per server/edge runtime
// on boot, before any request is handled. This is where Sentry's non-
// browser SDKs get initialized (server + edge each need their own
// Sentry.init since they're separate runtimes with separate config
// shapes); the browser side lives in instrumentation-client.ts instead.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = async (
  ...args: Parameters<typeof import("@sentry/nextjs").captureRequestError>
) => {
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(...args);
};
