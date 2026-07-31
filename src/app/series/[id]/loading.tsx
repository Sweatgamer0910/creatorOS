import { SkeletonBlock, SkeletonCard } from "@/components/ui/Skeleton";

// Mirrors src/app/series/[id]/page.tsx: back link, title, cadence/episode
// meta row, description, and the list of episode rows.
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
      <SkeletonBlock width={70} height={13} />
      <SkeletonBlock
        width="min(280px, 55%)"
        height={34}
        style={{ marginTop: 10 }}
      />
      <div className="flex items-center gap-3" style={{ marginTop: 8 }}>
        <SkeletonBlock width={90} height={13} />
        <SkeletonBlock width={70} height={13} />
      </div>
      <SkeletonBlock width="80%" height={16} style={{ marginTop: 10 }} />

      <div className="mt-8 flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard
            key={i}
            padding="sm"
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <SkeletonBlock width={22} height={13} />
              <SkeletonBlock width={180} height={14} />
            </div>
            <SkeletonBlock width={70} height={12} />
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
