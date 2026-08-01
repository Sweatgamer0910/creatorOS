import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Space_Grotesk, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import NotchNav from "@/components/NotchNav";
import BodyBackgroundSync from "@/components/BodyBackgroundSync";
import LenisProvider from "@/components/providers/LenisProvider";
import MainShell from "@/components/MainShell";
import OnboardingTourProvider from "@/components/onboarding/OnboardingTourProvider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const DESCRIPTION =
  "Mission control for your YouTube channel — plan ideas, write scripts, track your pipeline, and see real analytics and coaching, all in one place.";

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
      <body
        className={`${spaceGrotesk.variable} ${manrope.variable} ${jetbrainsMono.variable}`}
        style={{ fontFamily: "var(--font-body)" }}
      >
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
