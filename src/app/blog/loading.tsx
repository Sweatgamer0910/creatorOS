import { SkeletonBlock, SkeletonCard } from "@/components/ui/Skeleton";

// Mirrors src/app/blog/page.tsx: eyebrow + title + subtext, then a list of
// post cards (date/tags row, title, excerpt).
export default function Loading() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px 120px" }}>
      <SkeletonBlock width={110} height={12} />
      <SkeletonBlock width="min(320px, 60%)" height={38} style={{ marginTop: 12 }} />
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        <SkeletonBlock width="90%" height={16} />
        <SkeletonBlock width="60%" height={16} />
      </div>

      <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 14 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i}>
            <SkeletonBlock width={140} height={12} />
            <SkeletonBlock width="70%" height={20} style={{ marginTop: 10 }} />
            <SkeletonBlock width="95%" height={14} style={{ marginTop: 8 }} />
            <SkeletonBlock width="80%" height={14} style={{ marginTop: 6 }} />
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
