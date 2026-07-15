import { redis } from "@/lib/redis";

// better-auth's `secondaryStorage` option (used here for rate-limit
// counters) is structurally typed — get/set/delete — so this doesn't need
// to import a type from a deep better-auth subpath that may move between
// versions. Backed by the same Upstash Redis instance already used
// elsewhere in the app, rather than better-auth's default in-memory
// storage, which wouldn't survive a server restart or work across more
// than one instance.
export const authSecondaryStorage = {
  async get(key: string) {
    return redis.get(key);
  },
  async set(key: string, value: string, ttl?: number) {
    if (ttl) {
      await redis.set(key, value, { ex: ttl });
    } else {
      await redis.set(key, value);
    }
  },
  async delete(key: string) {
    await redis.del(key);
  },
};
