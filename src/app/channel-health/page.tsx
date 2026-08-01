import type { Metadata } from "next";
import ChannelHealthChecker from "./ChannelHealthChecker";

const TITLE = "Free Channel Health Check — CreatorOS";
const DESCRIPTION =
  "Paste any YouTube channel and get a free, honest preview: upload cadence, recent performance, and one thing worth focusing on next. No login required.";

type SearchParams = { [key: string]: string | string[] | undefined };

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

// Public, unauthenticated, indexable — the whole point is that this is
// shareable and discoverable on its own, unlike the real in-app Health
// Score which needs a signed-in, connected account. See
// src/lib/channel-health-preview/ for why this preview is intentionally
// lighter (public YouTube Data API only, no private analytics).
//
// When a visitor lands here via a shared result link (?channel=&score=),
// the OG/Twitter card is personalized to that specific result instead of
// the generic checker pitch — see src/app/api/og/channel-health/route.tsx
// for the image itself.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const channel = first(sp.channel);
  const score = first(sp.score);
  const label = first(sp.label);

  if (channel && score) {
    const title = `${channel} scored ${score}/100 — CreatorOS Channel Health Check`;
    const ogParams = new URLSearchParams({ channel, score });
    if (label) ogParams.set("label", label);
    const ogUrl = `/api/og/channel-health?${ogParams.toString()}`;

    return {
      title,
      description: DESCRIPTION,
      openGraph: {
        title,
        description: DESCRIPTION,
        type: "website",
        images: [{ url: ogUrl, width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: DESCRIPTION,
        images: [ogUrl],
      },
    };
  }

  return {
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
}

export default async function ChannelHealthPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const shared =
    first(sp.channel) && first(sp.score)
      ? {
          channel: first(sp.channel) as string,
          score: first(sp.score) as string,
        }
      : null;

  return <ChannelHealthChecker shared={shared} />;
}
