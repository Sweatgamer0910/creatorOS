import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import NotchNav from "@/components/NotchNav";
import BodyBackgroundSync from "@/components/BodyBackgroundSync";
import LenisProvider from "@/components/providers/LenisProvider";
import MainShell from "@/components/MainShell";
import OnboardingTourProvider from "@/components/onboarding/OnboardingTourProvider";
import ReferralCapture from "@/components/ReferralCapture";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const DESCRIPTION =
  "Mission control for your YouTube channel — plan ideas, write scripts, track your pipeline, and see real analytics and coaching, all in one place.";

// No prior viewport export existed at all — every page was falling back to
// mobile browsers' default ~980px virtual viewport and scaling the whole
// site down to fit, rather than rendering at the device's real width. All
// of NotchNav/MainShell/PipelineBoard's `useIsNarrowViewport` (760px)
// mobile branches were built and shipped against `window.innerWidth`,
// which the browser DOES report honestly even under the default virtual
// viewport — so those branches technically still activate at the right
// physical breakpoint, but the resulting layout renders zoomed out inside
// the oversized virtual viewport instead of filling the real screen at
// 1:1. `viewportFit: "cover"` (paired with the safe-area-inset padding
// already used in NotchNav's bottom tab bar) lets content extend under the
// notch/home-indicator instead of leaving a hard bar of background there.
// themeColor matches --color-background so the iOS status bar / Android
// nav bar blend into the app instead of showing a stray white/default bar.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0e1116",
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "CreatorOS",
    template: "%s — CreatorOS",
  },
  description: DESCRIPTION,
  openGraph: {
    title: "CreatorOS",
    description: DESCRIPTION,
    url: APP_URL,
    siteName: "CreatorOS",
    // No `images` override here — Next's file-convention `opengraph-image.png`
    // (proper 1200x630 card, built from the same brand tokens as the rest
    // of the site) is picked up automatically. Static file rather than the
    // dynamic opengraph-image.tsx it started as: LinkedIn's Post Inspector
    // reproducibly reported "no image found" against the on-demand
    // ImageResponse route (title/description came through fine, just not
    // the image) — a static file removes any function cold-start/runtime
    // variable from the equation entirely. Pre-rendered once via next/og's
    // ImageResponse from the exact same JSX, so the visual is unchanged.
    type: "website",
  },
  twitter: {
    // large-image card now that there's a real 1200x630 image to show —
    // "summary" (small square) was the honest choice while the only
    // available image was the square logo.
    card: "summary_large_image",
    title: "CreatorOS",
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "var(--font-body)" }}>
        <Suspense fallback={null}>
          <ReferralCapture />
        </Suspense>
        <LenisProvider>
          <BodyBackgroundSync />
          <OnboardingTourProvider>
            <NotchNav />
            <MainShell>{children}</MainShell>
          </OnboardingTourProvider>
        </LenisProvider>
        <Analytics />
      </body>
    </html>
  );
}
