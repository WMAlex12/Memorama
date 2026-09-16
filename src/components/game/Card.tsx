import type { CellState } from '../../lib/game/types';
import type { GameImage } from '../../lib/images/types';
import { cardBackGradient } from '../../lib/game/theme';

interface CardProps {
  cell: CellState;
  image: GameImage | undefined;
  disabled: boolean;
  degradationChance: number;
  shaking: boolean;
  onFlip: (cellId: number) => void;
}

export function Card({ cell, image, disabled, degradationChance, shaking, onFlip }: CardProps) {
  const faceUp = cell.revealed || cell.matched;

  return (
    <button
      type="button"
      disabled={disabled || faceUp}
      onClick={() => onFlip(cell.cellId)}
      className="group aspect-square [perspective:800px]"
      aria-label={faceUp ? image?.name ?? 'carta' : 'carta oculta'}
    >
      <div className={`h-full w-full ${shaking ? 'animate-card-shake' : ''}`}>
        <div
          className={`relative h-full w-full rounded-xl shadow-md transition-transform duration-300 [transform-style:preserve-3d] ${
            faceUp ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl text-2xl transition-colors duration-500 [backface-visibility:hidden]"
            style={{ backgroundImage: cardBackGradient(degradationChance) }}
          >
            🧠
          </div>
          <div
            className={`absolute inset-0 overflow-hidden rounded-xl border-2 border-white bg-white [backface-visibility:hidden] [transform:rotateY(180deg)] ${
              cell.matched ? 'opacity-60' : ''
            }`}
          >
            {image && <img src={image.url} alt={image.name} className="h-full w-full object-cover" />}
            {cell.matched && (
              <span className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white shadow">
                ✓
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
