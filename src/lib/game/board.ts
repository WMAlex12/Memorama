/**
 * Board grows in fixed tiers instead of one-pair-per-level, so the shape
 * stays recognizable for a few levels before stepping up:
 *   tier 0, levels 1-2  -> 2x3  (3 pairs)
 *   tier 1, levels 3-5  -> 3x4  (6 pairs)
 *   tier 2, levels 6-8  -> 4x4  (8 pairs)
 *   tier 3, levels 9+   -> 6x5  (15 pairs) — the largest tier; a literal
 *                 5x5 has an odd cell count, impossible to fill with pairs,
 *                 so this is the nearest even board that keeps a "5" side.
 */
const TIER_PAIRS = [3, 6, 8, 15];

function tierIndexForLevel(level: number): number {
  if (level <= 2) return 0;
  if (level <= 5) return 1;
  if (level <= 8) return 2;
  return 3;
}

export function pairsForLevel(level: number, availableImages: number): number {
  return Math.max(2, Math.min(TIER_PAIRS[tierIndexForLevel(level)], availableImages));
}

/** Every board is exactly `pairs` pairs — always fits a clean grid, no leftover cells. */
export function gridDims(n: number): { cols: number; rows: number } {
  const cols = Math.max(1, Math.ceil(Math.sqrt(n)));
  const rows = Math.max(1, Math.ceil(n / cols));
  return { cols, rows };
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Shuffled deck for a level: exactly `pairs * 2` ids, always a clean, fully-pairable board. */
export function pickBoardImageIds(allImageIds: string[], pairs: number): string[] {
  const chosen = shuffle(allImageIds).slice(0, pairs);
  return shuffle([...chosen, ...chosen]);
}
