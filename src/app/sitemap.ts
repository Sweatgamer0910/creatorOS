import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog/posts";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Only the pages a logged-out visitor (or a crawler) can actually reach —
// everything else lives behind auth and redirects to /login anyway.
// /channel-health and /blog are deliberately here too (added alongside
// those features, 2026-07-31) — both exist specifically to be found via
// search, so leaving them out of the sitemap would undercut the whole
// point of building them.
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/login",
    "/signup",
    "/privacy",
    "/terms",
    "/channel-health",
    "/blog",
  ];
  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }));

  const postEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
  }));

  return [...staticEntries, ...postEntries];
}
