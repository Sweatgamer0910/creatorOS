import { SkeletonBlock, SkeletonCard } from "@/components/ui/Skeleton";

// Mirrors src/app/scripts/page.tsx: eyebrow + title on the left, the
// "Generate a script with AI" button on the right, description, the
// new-script form, and the script list.
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
      <div className="flex items-center justify-between">
        <div>
          <SkeletonBlock width={100} height={15} />
          <SkeletonBlock width={220} height={38} style={{ marginTop: 10 }} />
        </div>
        <SkeletonBlock width={170} height={34} radius="md" />
      </div>

      <div
        style={{
          marginTop: 14,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <SkeletonBlock width="95%" height={16} />
        <SkeletonBlock width="65%" height={16} />
      </div>

      <SkeletonCard className="mt-8">
        <SkeletonBlock width="100%" height={40} radius="md" />
      </SkeletonCard>

      <div className="mt-8 flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} className="flex items-center justify-between">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <SkeletonBlock width={160} height={16} />
              <SkeletonBlock width={110} height={12} />
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
