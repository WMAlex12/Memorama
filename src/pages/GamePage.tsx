import { useImages } from '../hooks/useImages';
import { useGame } from '../hooks/useGame';
import { Board } from '../components/game/Board';
import { Hud } from '../components/game/Hud';
import { LevelCompleteModal } from '../components/game/LevelCompleteModal';

export function GamePage() {
  const { images, loading } = useImages();
  const { state, imageById, flipCard, nextLevel, cols, degradationChance, blurFatigue } = useGame(images);
  const shakingCellIds = state.status === 'resolving-mismatch' ? state.flippedCellIds : [];

  if (loading) {
    return <Centered>Cargando...</Centered>;
  }

  if (images.length < 2) {
    return (
      <Centered>
        Se necesitan al menos 2 imágenes para jugar. Pídele al administrador que suba algunas
        desde el panel de <span className="font-semibold">Admin</span>.
      </Centered>
    );
  }

  return (
    <div className="px-4 py-6">
      <Hud
        level={state.level}
        score={state.score}
        streak={state.streak}
        bestStreak={state.bestStreak}
        moves={state.moves}
      />
      <Board
        cells={state.cells}
        imageById={imageById}
        cols={cols}
        degradationChance={degradationChance}
        blurFatigue={blurFatigue}
        disabled={state.status !== 'playing'}
        shakingCellIds={shakingCellIds}
        onFlip={flipCard}
      />
      {state.status === 'level-complete' && (
        <LevelCompleteModal level={state.level} score={state.score} onContinue={nextLevel} />
      )}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 text-center text-slate-500">
      {children}
    </div>
  );
}
