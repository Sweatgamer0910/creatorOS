import { SkeletonBlock, SkeletonCard } from "@/components/ui/Skeleton";

// Mirrors src/app/series/page.tsx: back link, eyebrow, title, description,
// and the series card list.
export default function Loading() {
  return (
    <div
      className="px-4 sm:px-10"
      style={{
        paddingTop: 24,
        paddingBottom: 48,
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <SkeletonBlock width={80} height={13} />
      <SkeletonBlock width={50} height={15} style={{ marginTop: 10 }} />
      <SkeletonBlock
        width="min(260px, 55%)"
        height={38}
        style={{ marginTop: 6 }}
      />
      <div
        style={{
          marginTop: 14,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <SkeletonBlock width="90%" height={16} />
        <SkeletonBlock width="60%" height={16} />
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} className="flex items-center justify-between">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <SkeletonBlock width={150} height={16} />
              <SkeletonBlock width={220} height={13} />
            </div>
            <div className="flex items-center gap-3">
              <SkeletonBlock width={50} height={12} />
              <SkeletonBlock width={40} height={12} />
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
