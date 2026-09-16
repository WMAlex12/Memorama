import { useCallback, useEffect, useMemo, useReducer } from 'react';
import type { GameImage } from '../lib/images/types';
import { gridDims, pairsForLevel, pickBoardImageIds } from '../lib/game/board';
import { currentVisualDegradationChance, type DegradationContext } from '../lib/game/degradation';
import { moveFatigueMultiplier } from '../lib/game/theme';
import { gameReducer } from '../lib/game/gameReducer';
import type { CellState, GameState } from '../lib/game/types';

const MISMATCH_DELAY_MS = 900;

function buildLevel(level: number, imageIds: string[]): CellState[] {
  const pairs = pairsForLevel(level, imageIds.length);
  const deckImageIds = pickBoardImageIds(imageIds, pairs);
  return deckImageIds.map((imageId, cellId) => ({
    cellId,
    imageId,
    matched: false,
    revealed: false,
    timesRevealed: 0,
    changed: false,
  }));
}

const initialState: GameState = {
  level: 1,
  cells: [],
  flippedCellIds: [],
  degradedThisTurn: false,
  score: 0,
  streak: 0,
  bestStreak: 0,
  moves: 0,
  movesThisLevel: 0,
  errorsThisLevel: 0,
  revisitsThisLevel: 0,
  degradationEventsThisLevel: 0,
  status: 'playing',
};

export function useGame(images: GameImage[]) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const imageIds = useMemo(() => images.map((img) => img.id), [images]);
  const imageById = useMemo(() => new Map(images.map((img) => [img.id, img])), [images]);

  useEffect(() => {
    if (imageIds.length < 2) return;
    dispatch({ type: 'NEW_LEVEL', level: 1, cells: buildLevel(1, imageIds) });
    // Only re-seed when the available image pool actually changes size,
    // not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageIds.length]);

  useEffect(() => {
    if (state.status !== 'resolving-mismatch') return;
    const timer = setTimeout(() => dispatch({ type: 'HIDE_UNMATCHED' }), MISMATCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [state.status]);

  const flipCard = useCallback((cellId: number) => {
    dispatch({ type: 'FLIP', cellId });
  }, []);

  const nextLevel = useCallback(() => {
    const level = state.level + 1;
    dispatch({ type: 'NEW_LEVEL', level, cells: buildLevel(level, imageIds) });
  }, [state.level, imageIds]);

  const { cols, rows } = useMemo(() => gridDims(state.cells.length || 1), [state.cells.length]);

  const remainingUnmatched = useMemo(() => state.cells.filter((c) => !c.matched).length, [state.cells]);

  const degradationCtx: DegradationContext = useMemo(
    () => ({
      level: state.level,
      errorsThisLevel: state.errorsThisLevel,
      revisitsThisLevel: state.revisitsThisLevel,
      degradationEventsThisLevel: state.degradationEventsThisLevel,
      cellCount: state.cells.length,
      remainingUnmatched,
    }),
    [
      state.level,
      state.errorsThisLevel,
      state.revisitsThisLevel,
      state.degradationEventsThisLevel,
      state.cells.length,
      remainingUnmatched,
    ],
  );

  // Drives both the swap decision and the card-back tint / board blur —
  // nothing about the player's performance ever lowers it.
  const degradationChance = useMemo(() => currentVisualDegradationChance(degradationCtx), [degradationCtx]);

  const blurFatigue = useMemo(
    () => moveFatigueMultiplier(state.level, state.movesThisLevel),
    [state.level, state.movesThisLevel],
  );

  return {
    state,
    imageById,
    flipCard,
    nextLevel,
    cols,
    rows,
    degradationChance,
    blurFatigue,
  };
}
