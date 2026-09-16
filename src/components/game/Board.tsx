import type { CellState } from '../../lib/game/types';
import type { GameImage } from '../../lib/images/types';
import { degradationBlurPx } from '../../lib/game/theme';
import { Card } from './Card';

interface BoardProps {
  cells: CellState[];
  imageById: Map<string, GameImage>;
  cols: number;
  degradationChance: number;
  blurFatigue: number;
  disabled: boolean;
  shakingCellIds: number[];
  onFlip: (cellId: number) => void;
}

export function Board({
  cells,
  imageById,
  cols,
  degradationChance,
  blurFatigue,
  disabled,
  shakingCellIds,
  onFlip,
}: BoardProps) {
  return (
    <div
      className="mx-auto grid w-full max-w-3xl gap-2 transition-[filter] duration-700 ease-out sm:gap-3"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        filter: `blur(${degradationBlurPx(degradationChance, blurFatigue)}px)`,
      }}
    >
      {cells.map((cell) => (
        <Card
          key={cell.cellId}
          cell={cell}
          image={imageById.get(cell.imageId)}
          disabled={disabled}
          degradationChance={degradationChance}
          shaking={shakingCellIds.includes(cell.cellId)}
          onFlip={onFlip}
        />
      ))}
    </div>
  );
}
