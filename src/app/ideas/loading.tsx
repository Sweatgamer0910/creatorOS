import { SkeletonBlock, SkeletonCard } from "@/components/ui/Skeleton";

// Mirrors src/app/ideas/page.tsx: eyebrow + "View all series" link, title,
// description, the new-idea form area, and the idea card list.
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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <SkeletonBlock width={80} height={15} />
        <SkeletonBlock width={110} height={13} />
      </div>
      <SkeletonBlock
        width="min(260px, 55%)"
        height={38}
        style={{ marginTop: 10 }}
      />
      <div
        style={{
          marginTop: 14,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <SkeletonBlock width="95%" height={16} />
        <SkeletonBlock width="70%" height={16} />
      </div>

      <SkeletonCard className="mt-8">
        <SkeletonBlock width="100%" height={40} radius="md" />
      </SkeletonCard>

      <div className="mt-8 flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} className="flex items-start justify-between">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                flex: 1,
              }}
            >
              <SkeletonBlock width="45%" height={16} />
              <SkeletonBlock width="80%" height={13} />
            </div>
            <SkeletonBlock width={16} height={16} radius="sm" />
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
