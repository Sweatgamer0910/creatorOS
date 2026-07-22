import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSeriesList } from "@/lib/series/actions";
import InteractiveCard from "@/components/ui/InteractiveCard";
import EmptySeries from "./EmptySeries";

const CADENCE_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Biweekly",
  custom: "Custom",
};

export default async function SeriesListPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const seriesList = await getSeriesList();

  return (
    <div style={{ padding: "24px 40px 48px", maxWidth: 900, margin: "0 auto" }}>
      <p style={{ color: "var(--color-text-muted)", fontSize: 15 }}>Series</p>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(30px, 3.5vw, 38px)",
          marginTop: 6,
        }}
      >
        Your series
      </h1>
      <p
        style={{
          color: "var(--color-text-muted)",
          fontSize: 16,
          marginTop: 10,
          maxWidth: 640,
          lineHeight: 1.6,
        }}
      >
        Ideas that belong together — track a whole arc from first idea to
        published video. Start one from the Idea Lab.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {seriesList.length === 0 ? (
          <EmptySeries />
        ) : (
          seriesList.map((series) => (
            <Link
              key={series.id}
              href={`/series/${series.id}`}
              style={{ textDecoration: "none" }}
            >
              <InteractiveCard className="flex items-center justify-between">
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      color: "var(--color-text)",
                    }}
                  >
                    {series.title}
                  </div>
                  {series.description && (
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--color-text-muted)",
                        marginTop: 4,
                        maxWidth: 480,
                      }}
                    >
                      {series.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {series.cadence && (
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {CADENCE_LABELS[series.cadence] ?? series.cadence}
                    </span>
                  )}
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {series._count.ideas}{" "}
                    {series._count.ideas === 1 ? "idea" : "ideas"}
                  </span>
                </div>
              </InteractiveCard>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
