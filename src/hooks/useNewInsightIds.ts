"use client";

import { useEffect, useState } from "react";

const SEEN_KEY = "creatoros:coach-seen-insight-ids";

function readSeenIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

// Automatic, soft "what's new since your last visit" tracking — same
// localStorage-by-content pattern as src/app/dashboard/ResumeWork.tsx's
// dismiss state. Visiting the page once is what "reads" whatever insights
// are currently shown; no manual per-card dismiss control needed.
export function useNewInsightIds(ids: string[]): Set<string> {
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const seen = readSeenIds();
    const freshlyNew = new Set(ids.filter((id) => !seen.has(id)));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNewIds(freshlyNew);

    const union = new Set([...seen, ...ids]);
    localStorage.setItem(SEEN_KEY, JSON.stringify([...union]));
  }, [ids]);

  return newIds;
}
