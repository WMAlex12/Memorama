export function pointsForMatch(level: number, streak: number): number {
  const base = 100 * level;
  const streakBonus = streak * 15;
  return base + streakBonus;
}
