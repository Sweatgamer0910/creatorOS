import type { Metadata } from "next";
import { Space_Grotesk, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import NotchNav from "@/components/NotchNav";
import BodyBackgroundSync from "@/components/BodyBackgroundSync";
import LenisProvider from "@/components/providers/LenisProvider";
import MainShell from "@/components/MainShell";

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

export const metadata: Metadata = {
  title: "CreatorOS",
  description: "Mission control for your YouTube channel",
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
          <NotchNav />
          <MainShell>{children}</MainShell>
        </LenisProvider>
      </body>
    </html>
  );
}
