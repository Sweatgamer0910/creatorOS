import { prisma } from "@/lib/prisma";
import { ChannelAnalytics } from "./types";
import { getYouTubeAnalytics } from "./youtubeProvider";

export async function isYouTubeConnected(userId: string): Promise<boolean> {
  const account = await prisma.account.findFirst({
    where: { userId, providerId: "google" },
  });
  return account !== null;
}

// Returns null when the user hasn't connected a YouTube channel yet — callers
// render a connect prompt for that case. A connected account whose fetch
// fails (expired token, API error) throws instead, so callers can tell
// "never connected" apart from "connected but something went wrong."
export async function getChannelAnalytics(
  userId: string,
): Promise<ChannelAnalytics | null> {
  const connected = await isYouTubeConnected(userId);
  if (!connected) return null;
  return getYouTubeAnalytics(userId);
}

export type { ChannelAnalytics, ChannelStats, DailyDataPoint } from "./types";
