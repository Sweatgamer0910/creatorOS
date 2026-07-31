import { SkeletonBlock, SkeletonCard } from "@/components/ui/Skeleton";

// Mirrors the real page's structure (src/app/analytics/page.tsx): title,
// the Health Score card (including its type/confidence tag row — see
// HealthScoreCard.tsx), the 4-stat grid, and the chart area.
export default function Loading() {
  return (
    <div
      className="px-4 sm:px-10"
      style={{
        paddingTop: 24,
        paddingBottom: 64,
        maxWidth: 1160,
        margin: "0 auto",
      }}
    >
      <SkeletonBlock width={90} height={15} />
      <SkeletonBlock
        width="min(360px, 55%)"
        height={38}
        style={{ marginTop: 10 }}
      />
      <div
        style={{
          marginTop: 14,
          marginBottom: 20,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <SkeletonBlock width="80%" height={16} />
        <SkeletonBlock width="45%" height={16} />
      </div>

      {/* Health Score card */}
      <SkeletonCard style={{ maxWidth: 500, marginTop: 20, marginBottom: 20 }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 10 }}>
          <SkeletonBlock width={48} height={11} />
          <SkeletonBlock width={90} height={11} />
        </div>
        <div className="flex items-baseline gap-3">
          <SkeletonBlock width={64} height={36} />
          <SkeletonBlock width={100} height={18} />
        </div>
        <div
          style={{
            marginTop: 12,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <SkeletonBlock width="95%" height={14} />
          <SkeletonBlock width="70%" height={14} />
        </div>
        <SkeletonBlock width="60%" height={12} style={{ marginTop: 10 }} />
      </SkeletonCard>

      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} padding="sm">
            <SkeletonBlock width="70%" height={13} />
            <SkeletonBlock width="50%" height={24} style={{ marginTop: 8 }} />
          </SkeletonCard>
        ))}
      </div>

      {/* Chart area */}
      <div className="mt-8">
        <SkeletonCard>
          <SkeletonBlock width="100%" height={280} radius="md" />
        </SkeletonCard>
      </div>
    </div>
  );
}
