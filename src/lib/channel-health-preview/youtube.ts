// Public-data fetching for the no-login Channel Health preview
// (src/app/channel-health). Uses the YouTube Data API v3 with a plain API
// key (YOUTUBE_API_KEY, a "public data" key from Google Cloud Console) —
// NOT OAuth, unlike src/lib/analytics/youtubeProvider.ts, which needs a
// signed-in user's access token to call the private Analytics API. That
// distinction is exactly why this preview is lighter than the real
// in-app Health Score: there's no way to get an arbitrary channel's
// private daily growth data without that channel's owner authorizing it.
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export class ChannelNotFoundError extends Error {
  constructor() {
    super("CHANNEL_NOT_FOUND");
  }
}

function apiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    throw new Error(
      "YOUTUBE_API_KEY is not configured — the public Channel Health preview can't run without it.",
    );
  }
  return key;
}

// Accepts anything a visitor might paste: a full channel URL (@handle,
// /channel/UC…, legacy /c/ or /user/ custom URLs), or a bare handle/name.
// Legacy /c/ and /user/ URLs are resolved by guessing the same slug works
// as an @handle, which is true for the large majority of channels that
// existed before handles launched and claimed the matching one — if it
// doesn't resolve, the caller surfaces a clear "try the @handle" error
// rather than spending a 100-unit search.list quota call on a fallback.
export function parseChannelInput(raw: string): {
  mode: "id" | "handle";
  value: string;
} {
  let s = raw.trim();

  const urlMatch = s.match(/(?:youtube\.com|youtu\.be)\/(.+)/i);
  if (urlMatch) s = urlMatch[1];
  s = s.replace(/^\/+/, "").split(/[?#]/)[0].replace(/\/+$/, "");

  if (/^channel\//i.test(s)) {
    return { mode: "id", value: s.split("/")[1] };
  }
  if (/^UC[\w-]{22}$/.test(s)) {
    return { mode: "id", value: s };
  }
  if (/^@/.test(s)) {
    return { mode: "handle", value: s.split("/")[0] };
  }
  if (/^c\//i.test(s) || /^user\//i.test(s)) {
    const slug = s.split("/")[1];
    return { mode: "handle", value: `@${slug}` };
  }
  return { mode: "handle", value: s.startsWith("@") ? s : `@${s}` };
}

interface RawChannel {
  id: string;
  snippet: {
    title: string;
    publishedAt: string;
    thumbnails?: { default?: { url: string } };
  };
  statistics: {
    subscriberCount?: string;
    hiddenSubscriberCount?: boolean;
    viewCount?: string;
    videoCount?: string;
  };
  contentDetails: {
    relatedPlaylists: { uploads: string };
  };
}

async function fetchChannel(
  params: Record<string, string>,
): Promise<RawChannel> {
  const url = new URL(`${YOUTUBE_API_BASE}/channels`);
  url.searchParams.set("part", "snippet,statistics,contentDetails");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("key", apiKey());

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(
      `YouTube Data API error: ${response.status} - ${await response.text()}`,
    );
  }
  const data = await response.json();
  const channel = data.items?.[0];
  if (!channel) throw new ChannelNotFoundError();
  return channel;
}

export async function fetchChannelByInput(input: string): Promise<RawChannel> {
  const parsed = parseChannelInput(input);
  return parsed.mode === "id"
    ? fetchChannel({ id: parsed.value })
    : fetchChannel({ forHandle: parsed.value });
}

export interface RecentUpload {
  publishedAt: string;
  viewCount: number;
}

// Two calls, ~2 quota units total (well within the default 10,000/day
// budget even at real traffic): playlistItems.list to get the last 10
// video IDs from the channel's uploads playlist, then a single batched
// videos.list for all 10 view counts at once.
export async function fetchRecentUploads(
  uploadsPlaylistId: string,
  max = 10,
): Promise<RecentUpload[]> {
  const itemsUrl = new URL(`${YOUTUBE_API_BASE}/playlistItems`);
  itemsUrl.searchParams.set("part", "contentDetails");
  itemsUrl.searchParams.set("playlistId", uploadsPlaylistId);
  itemsUrl.searchParams.set("maxResults", String(max));
  itemsUrl.searchParams.set("key", apiKey());

  const itemsRes = await fetch(itemsUrl.toString());
  if (!itemsRes.ok) return [];
  const itemsData = await itemsRes.json();
  const items: { contentDetails: { videoId: string; videoPublishedAt: string } }[] =
    itemsData.items || [];
  if (items.length === 0) return [];

  const videosUrl = new URL(`${YOUTUBE_API_BASE}/videos`);
  videosUrl.searchParams.set("part", "statistics");
  videosUrl.searchParams.set(
    "id",
    items.map((i) => i.contentDetails.videoId).join(","),
  );
  videosUrl.searchParams.set("key", apiKey());

  const videosRes = await fetch(videosUrl.toString());
  const viewsById: Record<string, number> = {};
  if (videosRes.ok) {
    const videosData = await videosRes.json();
    for (const v of videosData.items || []) {
      viewsById[v.id] = Number(v.statistics?.viewCount || 0);
    }
  }

  return items.map((i) => ({
    publishedAt: i.contentDetails.videoPublishedAt,
    viewCount: viewsById[i.contentDetails.videoId] ?? 0,
  }));
}

export type { RawChannel };
