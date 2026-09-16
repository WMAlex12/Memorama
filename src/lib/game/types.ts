export interface CellState {
  cellId: number;
  imageId: string;
  matched: boolean;
  revealed: boolean;
  timesRevealed: number;
  /** Whether this card has already been swapped by the degradation mechanic. A changed card can never change again. */
  changed: boolean;
}

export type GameStatus = 'playing' | 'resolving-mismatch' | 'level-complete';

export interface GameState {
  level: number;
  cells: CellState[];
  flippedCellIds: number[];
  /** Whether a card has already changed during the current pair of flips — at most one per turn. */
  degradedThisTurn: boolean;
  score: number;
  streak: number;
  bestStreak: number;
  moves: number;
  /** Moves made on the current level only — drives the move-fatigue blur. */
  movesThisLevel: number;
  /** Mistakes (mismatches) made on the current level — each one nudges the degradation chance up. */
  errorsThisLevel: number;
  /** Eligible card revisits seen this level — feeds the level 2-5 "pity" ramp. */
  revisitsThisLevel: number;
  /** Actual degradation swaps that have fired this level — capped per level (see degradation.ts). */
  degradationEventsThisLevel: number;
  status: GameStatus;
}

export type GameAction =
  | { type: 'NEW_LEVEL'; level: number; cells: CellState[] }
  | { type: 'FLIP'; cellId: number }
  | { type: 'HIDE_UNMATCHED' };
