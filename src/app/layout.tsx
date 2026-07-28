import type { Metadata } from "next";
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
    // A proper 1200x630 social card isn't cut yet — the logo mark is a
    // reasonable placeholder in the meantime rather than nothing at all.
    images: ["/logo.png"],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "CreatorOS",
    description: DESCRIPTION,
    images: ["/logo.png"],
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
      </body>
    </html>
  );
}
