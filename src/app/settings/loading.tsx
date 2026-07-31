import { SkeletonBlock, SkeletonCard } from "@/components/ui/Skeleton";

// Mirrors src/app/settings/page.tsx: title, then the 5 stacked settings
// cards (Profile, Workspace, YouTube connection, Tour, Danger zone).
export default function Loading() {
  return (
    <div
      className="px-4 sm:px-10"
      style={{
        paddingTop: 24,
        paddingBottom: 64,
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <SkeletonBlock width={70} height={15} />
      <SkeletonBlock
        width="min(280px, 55%)"
        height={34}
        style={{ marginTop: 10 }}
      />

      <div className="flex flex-col gap-4" style={{ marginTop: 32 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i}>
            <SkeletonBlock width={140} height={16} />
            <SkeletonBlock width="80%" height={13} style={{ marginTop: 8 }} />
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
