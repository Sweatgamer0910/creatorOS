import { auth } from "@/lib/auth";
import { ChannelAnalytics, DailyDataPoint } from "./types";

async function getAccessToken(userId: string): Promise<string> {
  const { accessToken } = await auth.api.getAccessToken({
    body: {
      providerId: "google",
      userId,
    },
  });

  if (!accessToken) {
    throw new Error("No YouTube access token found for this user");
  }

  return accessToken;
}

async function getChannelSnapshot(accessToken: string) {
  const response = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.ok) {
    throw new Error(
      `YouTube Data API error: ${response.status} - ${await response.text()}`,
    );
  }

  const data = await response.json();
  const channel = data.items?.[0];

  if (!channel) {
    throw new Error("No YouTube channel found on this account");
  }

  return channel;
}

async function getHistoricalData(
  accessToken: string,
  days: number,
): Promise<DailyDataPoint[]> {
  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const params = new URLSearchParams({
    ids: "channel==MINE",
    startDate,
    endDate,
    metrics: "views,subscribersGained,estimatedMinutesWatched",
    dimensions: "day",
    sort: "day",
  });

  const response = await fetch(
    `https://youtubeanalytics.googleapis.com/v2/reports?${params}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.ok) {
    throw new Error(
      `YouTube Analytics API error: ${response.status} - ${await response.text()}`,
    );
  }

  const data = await response.json();

  return (data.rows || []).map((row: [string, number, number, number]) => ({
    date: row[0],
    views: row[1],
    subscribersGained: row[2],
    watchTimeMinutes: row[3],
  }));
}

export async function getYouTubeAnalytics(
  userId: string,
): Promise<ChannelAnalytics> {
  const accessToken = await getAccessToken(userId);
  const channel = await getChannelSnapshot(accessToken);
  // A single Analytics API report call regardless of range, so fetching a
  // full year up front is free relative to fetching 30 days — lets the
  // chart's date-range picker work entirely client-side, no re-fetching.
  const history = await getHistoricalData(accessToken, 365);
  const last30Days = history.slice(-30);

  return {
    channelTitle: channel.snippet.title,
    currentStats: {
      subscriberCount: Number(channel.statistics.subscriberCount || 0),
      viewCount: Number(channel.statistics.viewCount || 0),
      videoCount: Number(channel.statistics.videoCount || 0),
      watchTimeMinutes: last30Days.reduce(
        (sum, d) => sum + d.watchTimeMinutes,
        0,
      ),
    },
    last30Days,
    history,
  };
}
