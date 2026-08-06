import { ChannelHealthPreview, PreviewInsight, PreviewLabel } from "./types";
import { RawChannel, RecentUpload } from "./youtube";
// This used to have its own local formatCount capped at "M" with no
// ceiling above a million - a big, established channel (billions of
// lifetime views) came through here as "5520.0M total views" in the
// narrative insight text instead of "5.52B", even after the sibling
// formatter in ChannelHealthChecker.tsx was fixed to handle B, because
// that fix only touched the OTHER copy of this function. Now both import
// the same one. See @/lib/format for the full story.
import { formatCount } from "@/lib/format";

function daysBetween(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / 86_400_000;
}

// Pure scoring function — takes already-fetched public data and returns a
// ChannelHealthPreview, no network calls. Kept separate from youtube.ts so
// the scoring logic itself is unit-testable without mocking fetch, same
// split as src/lib/health-score/scorer.ts + youtubeProvider.ts.
export function computePreview(
  channel: RawChannel,
  uploads: RecentUpload[],
): ChannelHealthPreview {
  const subscriberCount = channel.statistics.hiddenSubscriberCount
    ? null
    : Number(channel.statistics.subscriberCount || 0);
  const viewCount = Number(channel.statistics.viewCount || 0);
  const videoCount = Number(channel.statistics.videoCount || 0);
  const publishedAt = new Date(channel.snippet.publishedAt);
  const now = new Date();

  const base: Omit<ChannelHealthPreview, "score" | "label" | "insights"> = {
    channelTitle: channel.snippet.title,
    channelThumbnail: channel.snippet.thumbnails?.default?.url || null,
    channelUrl: `https://www.youtube.com/channel/${channel.id}`,
    subscriberCount,
    viewCount,
    videoCount,
  };

  const ageYears = (now.getTime() - publishedAt.getTime()) / (365.25 * 86_400_000);
  const ageDescription =
    ageYears >= 1
      ? `about ${Math.round(ageYears)} year${Math.round(ageYears) === 1 ? "" : "s"}`
      : "less than a year";

  const insights: PreviewInsight[] = [
    {
      type: "fact",
      confidence: "high",
      message: `This channel has been on YouTube for ${ageDescription}, with ${formatCount(
        videoCount,
      )} videos, ${subscriberCount === null ? "a hidden subscriber count" : `${formatCount(subscriberCount)} subscribers`}, and ${formatCount(viewCount)} total views.`,
    },
  ];

  // Not enough public signal to say anything more specific — small
  // channels and channels with too few recent uploads for a cadence
  // reading both land here rather than getting a score dressed up with
  // more confidence than the data supports.
  if (videoCount < 3 || uploads.length < 2) {
    return {
      ...base,
      score: 50,
      label: "Insufficient Data" as PreviewLabel,
      insights: [
        ...insights,
        {
          type: "fact",
          confidence: "high",
          message:
            "There aren't enough public uploads yet to read an upload pattern or a real signal — this preview needs at least a few recent videos to work with.",
        },
      ],
    };
  }

  const sorted = [...uploads].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  const gaps: number[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    gaps.push(
      daysBetween(new Date(sorted[i].publishedAt), new Date(sorted[i + 1].publishedAt)),
    );
  }
  const avgGapDays = gaps.reduce((s, g) => s + g, 0) / gaps.length;
  const meanAbsDev =
    gaps.reduce((s, g) => s + Math.abs(g - avgGapDays), 0) / gaps.length;
  const isRegular = meanAbsDev / Math.max(avgGapDays, 1) < 0.4;
  const daysSinceLastUpload = daysBetween(now, new Date(sorted[0].publishedAt));

  insights.push(
    isRegular
      ? {
          type: "pattern",
          confidence: "high",
          message: `Uploads have landed on a fairly consistent schedule — roughly every ${Math.round(
            avgGapDays,
          )} days over the last ${sorted.length} videos.`,
        }
      : {
          type: "pattern",
          confidence: "medium",
          message: `Upload timing has been irregular over the last ${sorted.length} videos — gaps have averaged around ${Math.round(
            avgGapDays,
          )} days but varied a fair amount rather than following a set rhythm.`,
        },
  );

  insights.push({
    type: "fact",
    confidence: "high",
    message:
      daysSinceLastUpload <= 14
        ? `Actively uploading — the most recent video went up about ${Math.round(daysSinceLastUpload)} day${Math.round(daysSinceLastUpload) === 1 ? "" : "s"} ago.`
        : `It's been about ${Math.round(daysSinceLastUpload)} days since the last upload.`,
  });

  const lifetimeAvgViews = viewCount / Math.max(videoCount, 1);
  const recentAvgViews =
    sorted.reduce((s, u) => s + u.viewCount, 0) / sorted.length;
  const ratio = lifetimeAvgViews > 0 ? recentAvgViews / lifetimeAvgViews : 1;

  if (ratio > 1.2) {
    insights.push({
      type: "pattern",
      confidence: "exploratory",
      message: `The last ${sorted.length} uploads are averaging more views than this channel's lifetime per-video average — a mildly positive signal, though public view counts alone don't show whether that's organic discovery or something else, and there's no watch-time data behind it.`,
    });
  } else if (ratio < 0.8) {
    insights.push({
      type: "pattern",
      confidence: "exploratory",
      message: `The last ${sorted.length} uploads are averaging fewer views than this channel's lifetime per-video average — worth watching, though a small recent sample and public-only data make this a soft signal, not a confirmed trend.`,
    });
  }

  if (!isRegular || avgGapDays > 14) {
    insights.push({
      type: "recommendation",
      confidence: "medium",
      message:
        "Tightening the upload schedule — the same day and time each week, for example — tends to build an audience habit and can help discovery. Worth testing over the next month.",
    });
  } else {
    insights.push({
      type: "recommendation",
      confidence: "medium",
      message:
        "The consistent schedule here is a real strength worth protecting. With cadence already solid, testing thumbnails, titles, or format is likely the higher-leverage next move.",
    });
  }

  if (!isRegular && daysSinceLastUpload > 30) {
    insights.push({
      type: "hypothesis",
      confidence: "exploratory",
      message:
        "The gap since the last upload, combined with an irregular schedule, may be costing this channel some algorithmic momentum — though that can't be confirmed without impression and click-through data, which isn't public.",
    });
  }

  let score = 50;
  if (daysSinceLastUpload <= 7) score += 15;
  else if (daysSinceLastUpload <= 14) score += 10;
  else if (daysSinceLastUpload <= 30) score += 5;
  else if (daysSinceLastUpload > 60) score -= 15;

  if (isRegular) score += 15;
  else if (meanAbsDev / Math.max(avgGapDays, 1) < 0.7) score += 5;
  else score -= 10;

  if (ratio > 1.2) score += 10;
  else if (ratio < 0.8) score -= 10;

  if (videoCount >= 20) score += 5;

  score = Math.max(0, Math.min(100, Math.round(score)));

  const label: PreviewLabel =
    score >= 70 ? "Strong Public Signals" : score >= 45 ? "Steady" : "Room To Grow";

  return { ...base, score, label, insights };
}
