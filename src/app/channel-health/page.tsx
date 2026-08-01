import type { Metadata } from "next";
import ChannelHealthChecker from "./ChannelHealthChecker";

const TITLE = "Free Channel Health Check — CreatorOS";
const DESCRIPTION =
  "Paste any YouTube channel and get a free, honest preview: upload cadence, recent performance, and one thing worth focusing on next. No login required.";

// Public, unauthenticated, indexable — the whole point is that this is
// shareable and discoverable on its own, unlike the real in-app Health
// Score which needs a signed-in, connected account. See
// src/lib/channel-health-preview/ for why this preview is intentionally
// lighter (public YouTube Data API only, no private analytics).
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function ChannelHealthPage() {
  return <ChannelHealthChecker />;
}
