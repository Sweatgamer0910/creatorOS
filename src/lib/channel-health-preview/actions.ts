"use server";

import { headers } from "next/headers";
import { redis } from "@/lib/redis";
import {
  ChannelNotFoundError,
  fetchChannelByInput,
  fetchRecentUploads,
} from "./youtube";
import { computePreview } from "./scorer";
import { ChannelHealthPreview } from "./types";

// Same fixed-window pattern as src/lib/waitlist/actions.ts — this is a
// public, unauthenticated write... well, read... endpoint that calls an
// external quota-limited API, so it needs its own limit independent of
// auth. 10/hour/IP is more generous than the waitlist form's 5/hour since
// this IS the product demo, not a lead-capture form, and a genuine visitor
// might reasonably check a few channels.
async function isRateLimited(): Promise<boolean> {
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    "unknown";

  const key = `channel-health-preview-ratelimit:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 3600);
  }
  return count > 10;
}

export async function previewChannelHealth(
  input: string,
): Promise<{ data?: ChannelHealthPreview; error?: string }> {
  const trimmed = input.trim();
  if (!trimmed) {
    return { error: "Enter a YouTube channel handle or URL." };
  }

  if (await isRateLimited()) {
    return { error: "Too many checks in a row — try again in a bit." };
  }

  try {
    const channel = await fetchChannelByInput(trimmed);
    const uploads = await fetchRecentUploads(
      channel.contentDetails.relatedPlaylists.uploads,
    );
    return { data: computePreview(channel, uploads) };
  } catch (err) {
    if (err instanceof ChannelNotFoundError) {
      return {
        error:
          "Couldn't find that channel — try their @handle or the full channel URL.",
      };
    }
    console.error("Channel Health preview failed:", err);
    return {
      error: "Something went wrong looking that channel up. Try again in a moment.",
    };
  }
}
