import { MAX_DEGRADATION_CHANCE } from './degradation';

type Rgb = [number, number, number];

const VIVID_FROM: Rgb = [99, 102, 241]; // indigo-500 (no degradation)
const VIVID_TO: Rgb = [124, 58, 237]; // violet-600
const FOGGY_FROM: Rgb = [100, 116, 139]; // slate-500 (max degradation)
const FOGGY_TO: Rgb = [51, 65, 85]; // slate-700

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

function mix(from: Rgb, to: Rgb, t: number): string {
  return `rgb(${lerp(from[0], to[0], t)}, ${lerp(from[1], to[1], t)}, ${lerp(from[2], to[2], t)})`;
}

/**
 * Both the tint and the blur are driven by the *actual* current degradation
 * chance (level + budget/pity progress + mistakes this level, from
 * degradation.ts) rather than raw level — so what the player sees always
 * matches what's really about to happen to a revisited card.
 */
function intensity(currentChance: number): number {
  return Math.min(1, currentChance / MAX_DEGRADATION_CHANCE);
}

/**
 * Card-back gradient whose tone drifts from vivid indigo/violet toward a
 * desaturated, foggy slate as the current degradation chance climbs — a
 * visual echo of the memory fading, not just a difficulty number.
 */
export function cardBackGradient(currentChance: number): string {
  const t = intensity(currentChance);
  const from = mix(VIVID_FROM, FOGGY_FROM, t);
  const to = mix(VIVID_TO, FOGGY_TO, t);
  return `linear-gradient(135deg, ${from}, ${to})`;
}

const MAX_BOARD_BLUR_PX = 3.5;

/** From this level on, dragging a level out gets visibly punishing. */
const MOVE_FATIGUE_START_LEVEL = 4;
/** Moves-this-level at which the fatigue multiplier hits its ceiling. */
const MOVE_FATIGUE_MAX_MOVES = 40;
/** At the ceiling, blur reaches this multiple of its normal max (i.e. 200%). */
const MOVE_FATIGUE_MAX_MULTIPLIER = 2;

/**
 * Extra blur multiplier driven purely by how long the player has been
 * stuck on the current level (`movesThisLevel`), on top of the usual
 * degradation-based blur. Only kicks in from level 4 on; ramps linearly
 * from 100% to 200% as moves go from 0 to 40, then holds at 200%.
 */
export function moveFatigueMultiplier(level: number, movesThisLevel: number): number {
  if (level < MOVE_FATIGUE_START_LEVEL) return 1;
  const t = Math.min(1, movesThisLevel / MOVE_FATIGUE_MAX_MOVES);
  return 1 + t * (MOVE_FATIGUE_MAX_MULTIPLIER - 1);
}

/** Board-wide "brain fog" blur: degradation chance sets the base, move fatigue can push it up to 2x. */
export function degradationBlurPx(currentChance: number, fatigueMultiplier: number): number {
  return intensity(currentChance) * MAX_BOARD_BLUR_PX * fatigueMultiplier;
}
