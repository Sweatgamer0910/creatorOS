"use client";

import Link from "next/link";

export default function SeriesBadge({
  id,
  title,
  episodeNumber,
}: {
  id: string;
  title: string;
  episodeNumber?: number | null;
}) {
  return (
    <Link
      href={`/series/${id}`}
      onClick={(e) => e.stopPropagation()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        fontFamily: "var(--font-mono)",
        fontWeight: 600,
        color: "var(--color-accent-teal)",
        backgroundColor: "rgba(45,212,191,0.12)",
        border: "1px solid rgba(45,212,191,0.24)",
        borderRadius: 999,
        padding: "3px 8px",
        textDecoration: "none",
        whiteSpace: "nowrap",
      }}
    >
      {episodeNumber != null ? `#${episodeNumber} · ${title}` : title}
    </Link>
  );
}
