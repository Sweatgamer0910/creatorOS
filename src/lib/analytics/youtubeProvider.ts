import { auth } from "@/lib/auth";
import { ChannelAnalytics } from "./types";

export async function getYouTubeAnalytics(
  userId: string,
): Promise<ChannelAnalytics> {
  const { accessToken } = await auth.api.getAccessToken({
    body: {
      providerId: "google",
      userId,
    },
  });

  if (!accessToken) {
    throw new Error("No YouTube access token found for this user");
  }

  const response = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`YouTube API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const channel = data.items?.[0];

  if (!channel) {
    throw new Error("No YouTube channel found on this account");
  }

  return {
    channelTitle: channel.snippet.title,
    currentStats: {
      subscriberCount: Number(channel.statistics.subscriberCount || 0),
      viewCount: Number(channel.statistics.viewCount || 0),
      videoCount: Number(channel.statistics.videoCount || 0),
      watchTimeMinutes: 0, // Requires YouTube Analytics API, separate call - later
    },
    last30Days: [], // Requires YouTube Analytics API, separate call - later
  };
}
