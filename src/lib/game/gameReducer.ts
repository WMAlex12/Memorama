import type { CellState, GameAction, GameState, GameStatus } from './types';
import { currentDegradationChance, DEGRADATION_START_LEVEL } from './degradation';
import { pointsForMatch } from './scoring';

interface RevealResult {
  cells: CellState[];
  degraded: boolean;
  wasEligibleRevisit: boolean;
}

/** A valid swap partner: a different, still-in-play card that has never changed before either. */
function pickSwapTarget(cells: CellState[], self: CellState): CellState | null {
  const candidates = cells.filter(
    (c) => c.cellId !== self.cellId && !c.matched && !c.revealed && !c.changed && c.imageId !== self.imageId,
  );
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Re-flipping a card the player has seen before is exactly the moment the
 * "memory degradation" mechanic can kick in: swap this card's image with
 * another real card's from the same board (a transposition, so the deck
 * never changes and the board always stays solvable). Only cards that have
 * never changed before are eligible, on either side of the swap — once a
 * card has changed once, it's done changing for the rest of the level.
 */
function revealWithPossibleDegradation(cells: CellState[], cellId: number, state: GameState): RevealResult {
  const next = cells.map((c) => ({ ...c }));
  const cell = next.find((c) => c.cellId === cellId)!;
  const isRevisit = cell.timesRevealed > 0;
  const wasEligibleRevisit = isRevisit && state.level >= DEGRADATION_START_LEVEL && !cell.changed;
  let degraded = false;

  // At most one card per turn may change — if the first card you flipped
  // already changed, the second one flips normally.
  if (wasEligibleRevisit && !state.degradedThisTurn) {
    const chance = currentDegradationChance({
      level: state.level,
      errorsThisLevel: state.errorsThisLevel,
      revisitsThisLevel: state.revisitsThisLevel,
      degradationEventsThisLevel: state.degradationEventsThisLevel,
      cellCount: state.cells.length,
      remainingUnmatched: next.filter((c) => !c.matched).length,
    });
    if (Math.random() < chance) {
      const target = pickSwapTarget(next, cell);
      if (target) {
        const tmp = cell.imageId;
        cell.imageId = target.imageId;
        target.imageId = tmp;
        cell.changed = true;
        target.changed = true;
        degraded = true;
      }
    }
  }

  cell.revealed = true;
  cell.timesRevealed += 1;
  return { cells: next, degraded, wasEligibleRevisit };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NEW_LEVEL':
      return {
        level: action.level,
        cells: action.cells,
        flippedCellIds: [],
        degradedThisTurn: false,
        score: state.score,
        streak: state.streak,
        bestStreak: state.bestStreak,
        moves: state.moves,
        movesThisLevel: 0,
        errorsThisLevel: 0,
        revisitsThisLevel: 0,
        degradationEventsThisLevel: 0,
        status: 'playing',
      };

    case 'FLIP': {
      if (state.status !== 'playing') return state;
      const targetCell = state.cells.find((c) => c.cellId === action.cellId);
      if (!targetCell || targetCell.matched || targetCell.revealed) return state;

      const { cells, degraded, wasEligibleRevisit } = revealWithPossibleDegradation(state.cells, action.cellId, state);
      const revisitsThisLevel = state.revisitsThisLevel + (wasEligibleRevisit ? 1 : 0);
      const degradationEventsThisLevel = state.degradationEventsThisLevel + (degraded ? 1 : 0);
      const degradedThisTurn = state.degradedThisTurn || degraded;
      const flippedCellIds = [...state.flippedCellIds, action.cellId];

      if (flippedCellIds.length < 2) {
        return { ...state, cells, flippedCellIds, revisitsThisLevel, degradationEventsThisLevel, degradedThisTurn };
      }

      const [aId, bId] = flippedCellIds;
      const a = cells.find((c) => c.cellId === aId)!;
      const b = cells.find((c) => c.cellId === bId)!;
      const moves = state.moves + 1;
      const movesThisLevel = state.movesThisLevel + 1;

      if (a.imageId === b.imageId) {
        a.matched = true;
        b.matched = true;
        const streak = state.streak + 1;
        const score = state.score + pointsForMatch(state.level, streak);
        const allMatched = cells.every((c) => c.matched);
        const status: GameStatus = allMatched ? 'level-complete' : 'playing';
        return {
          ...state,
          cells,
          flippedCellIds: [],
          degradedThisTurn: false,
          moves,
          movesThisLevel,
          revisitsThisLevel,
          degradationEventsThisLevel,
          streak,
          bestStreak: Math.max(state.bestStreak, streak),
          score,
          status,
        };
      }

      return {
        ...state,
        cells,
        flippedCellIds,
        degradedThisTurn,
        moves,
        movesThisLevel,
        revisitsThisLevel,
        degradationEventsThisLevel,
        errorsThisLevel: state.errorsThisLevel + 1,
        streak: 0,
        status: 'resolving-mismatch',
      };
    }

    case 'HIDE_UNMATCHED': {
      if (state.status !== 'resolving-mismatch') return state;
      const cells = state.cells.map((c) =>
        state.flippedCellIds.includes(c.cellId) && !c.matched ? { ...c, revealed: false } : c,
      );
      return { ...state, cells, flippedCellIds: [], degradedThisTurn: false, status: 'playing' };
    }

    default:
      return state;
  }
}
