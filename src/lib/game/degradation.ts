/** Levels below this play as a plain, unmodified memory game. */
export const DEGRADATION_START_LEVEL = 2;

/** Ceiling on the degradation probability, however it's computed. */
export const MAX_DEGRADATION_CHANCE = 0.85;

/** Each mistake this level nudges the fog up a little more, on top of whatever level/budget math applies. */
export const ERROR_DEGRADATION_STEP = 0.05;

/**
 * Levels 2-5 don't use a flat per-flip probability — they spend a small
 * fixed "budget" of degradation events across the whole level: 1 at level
 * 2 (barely noticeable), 2 at level 3, then doubled from level 4 on — 12 at
 * level 4, 18 at level 5. From level 6 on there's no budget: the original
 * flat per-revisit curve applies, still gated by the one-change-per-card
 * rule (see gameReducer.ts).
 */
const LEVEL_DEGRADATION_BUDGET: Record<number, number> = { 2: 1, 3: 2, 4: 12, 5: 18 };

function degradationBudgetForLevel(level: number): number | undefined {
  return LEVEL_DEGRADATION_BUDGET[level];
}

function flatDegradationChance(level: number): number {
  if (level < DEGRADATION_START_LEVEL) return 0;
  const raw = 0.25 + (level - DEGRADATION_START_LEVEL) * 0.12;
  return Math.min(raw, MAX_DEGRADATION_CHANCE);
}

export interface DegradationContext {
  level: number;
  errorsThisLevel: number;
  revisitsThisLevel: number;
  degradationEventsThisLevel: number;
  cellCount: number;
  /** How many cards on the board are still unmatched (including the one being revealed). */
  remainingUnmatched: number;
}

/**
 * Once this few cards are left unmatched, no more swaps are allowed to fire
 * — without this, the "pity" ramp (which climbs toward certainty as the
 * level runs out of room) could saturate right as the player is down to
 * the last pair or two, trapping them in an endless fail loop they can
 * never close out. This only ever gates the real swap decision
 * (`currentDegradationChance`) — it's a completability guarantee, not a
 * visual "all clear", so the tint/blur (`currentVisualDegradationChance`)
 * keep reflecting the level's real severity right up to the last card.
 */
const ENDGAME_SAFE_CARDS = 4;

function baseChance(ctx: DegradationContext): number {
  const { level, errorsThisLevel, revisitsThisLevel, degradationEventsThisLevel, cellCount } = ctx;
  if (level < DEGRADATION_START_LEVEL) return 0;

  const errorBoost = errorsThisLevel * ERROR_DEGRADATION_STEP;
  const budget = degradationBudgetForLevel(level);

  let base: number;
  if (budget !== undefined) {
    const remaining = Math.max(0, budget - degradationEventsThisLevel);
    if (remaining === 0) {
      base = 0;
    } else {
      const remainingWindow = Math.max(1, cellCount - revisitsThisLevel);
      base = remaining / remainingWindow;
    }
  } else {
    base = flatDegradationChance(level);
  }

  return Math.min(MAX_DEGRADATION_CHANCE, base + errorBoost);
}

/**
 * Probability that the *next* eligible card revisit swaps it with another
 * card from this same board's deck.
 *
 * Levels 2-5: a "pity" ramp spends a small fixed budget of events over the
 * level's expected length — rare while the budget could still land later,
 * climbing toward certain the closer the level gets to running out without
 * having spent it. That's what makes level 2 read as "it happened once,
 * barely noticeable" and level 5 as "it happened about eighteen times".
 *
 * Level 6+: the original flat per-revisit curve, unchanged.
 *
 * Every mistake this level adds a flat boost on top. Nothing about the
 * player's performance (streaks, skill) ever lowers this — it only ever
 * climbs with level, budget/pity progress and mistakes. This is the real
 * mechanic's probability, used to decide whether a card actually changes —
 * it drops to zero in the last few cards so the level always stays
 * completable. For the card-back tint / board blur, use
 * `currentVisualDegradationChance` instead, which keeps showing the
 * level's real severity through that endgame window.
 */
export function currentDegradationChance(ctx: DegradationContext): number {
  if (ctx.remainingUnmatched <= ENDGAME_SAFE_CARDS) return 0;
  return baseChance(ctx);
}

/**
 * Same formula as `currentDegradationChance`, but without the endgame
 * safeguard — the tint and blur should keep reading as "this is how bad
 * level N really is" all the way to the last card, even though the game
 * has quietly stopped actually swapping cards by then.
 */
export function currentVisualDegradationChance(ctx: DegradationContext): number {
  return baseChance(ctx);
}
