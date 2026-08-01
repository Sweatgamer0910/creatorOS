import { SkeletonBlock, SkeletonCard } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div
      className="px-4 sm:px-10"
      style={{ paddingTop: 24, paddingBottom: 64, maxWidth: 720, margin: "0 auto" }}
    >
      <SkeletonBlock width={140} height={13} />
      <SkeletonBlock width="min(220px, 55%)" height={34} style={{ marginTop: 10 }} />
      <SkeletonBlock width="90%" height={16} style={{ marginTop: 12 }} />

      <div className="mt-8">
        <SkeletonCard>
          <SkeletonBlock width={90} height={12} />
          <SkeletonBlock width={70} height={30} style={{ marginTop: 8 }} />
        </SkeletonCard>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i}>
            <SkeletonBlock width="60%" height={16} />
            <SkeletonBlock width="80%" height={13} style={{ marginTop: 8 }} />
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
