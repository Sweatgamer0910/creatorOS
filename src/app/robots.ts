import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Everything past the landing/auth/legal pages requires a session —
      // crawling them just produces a login redirect, not real content.
      disallow: [
        "/dashboard",
        "/ideas",
        "/scripts",
        "/pipeline",
        "/analytics",
        "/coach",
        "/series",
        "/settings",
        "/api/",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
