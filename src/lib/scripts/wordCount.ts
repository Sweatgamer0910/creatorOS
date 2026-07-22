const WORDS_PER_MINUTE = 150;

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function estimateReadSeconds(wordCount: number): number {
  return Math.round((wordCount / WORDS_PER_MINUTE) * 60);
}

// "~1m 30s" / "~45s" — always approximate, never claims precision the
// 150wpm estimate doesn't have.
export function formatReadTime(seconds: number): string {
  if (seconds < 60) return `~${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder === 0 ? `~${minutes}m` : `~${minutes}m ${remainder}s`;
}

export interface SectionStats {
  words: number;
  seconds: number;
}

export interface ScriptSections {
  hook: string;
  intro: string;
  body: string;
  outro: string;
}

export function computeScriptWordStats(
  sections: ScriptSections,
): Record<keyof ScriptSections | "total", SectionStats> {
  const perSection = (Object.keys(sections) as (keyof ScriptSections)[]).reduce(
    (acc, key) => {
      const words = countWords(sections[key]);
      acc[key] = { words, seconds: estimateReadSeconds(words) };
      return acc;
    },
    {} as Record<keyof ScriptSections, SectionStats>,
  );

  const totalWords = Object.values(perSection).reduce(
    (sum, s) => sum + s.words,
    0,
  );

  return {
    ...perSection,
    total: { words: totalWords, seconds: estimateReadSeconds(totalWords) },
  };
}
