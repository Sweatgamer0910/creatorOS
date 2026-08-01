"use client";

import * as Sentry from "@sentry/nextjs";
import posthog from "@/lib/posthog";
import { useEffect } from "react";

// Only triggers for errors in the root layout itself, which is the one
// place a normal error.tsx boundary can't catch (it replaces the layout,
// not just the page) — reported here so it doesn't silently vanish.
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
    posthog.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: "#0e1116",
          color: "#e8eaed",
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>
            Something went wrong
          </h1>
          <p style={{ color: "#8b93a1", marginTop: 8, fontSize: 14 }}>
            We&rsquo;ve been notified — try reloading the page.
          </p>
        </div>
      </body>
    </html>
  );
}
