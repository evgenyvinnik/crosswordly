import { useMemo } from 'react';
import type { GameLevel } from '../game/GameField';
import { getCellKey } from '../../utils/gridUtils';

/**
 * Renders a miniature preview of a puzzle grid.
 * Used in level tiles to give a visual representation of the level layout.
 *
 * @param props - Component properties
 * @param props.puzzle - The puzzle data to preview
 */
const MiniPuzzlePreview = ({ puzzle }: { puzzle: GameLevel }) => {
  const playableCells = useMemo(() => {
    const cells = new Set<string>();
    puzzle.words.forEach((word) => {
      word.word.split('').forEach((_, index) => {
        const row = word.startRow + (word.direction === 'down' ? index : 0);
        const col = word.startCol + (word.direction === 'across' ? index : 0);
        cells.add(getCellKey(row, col));
      });
    });
    return cells;
  }, [puzzle]);

  const renderedCells = [];
  for (let row = 0; row < puzzle.grid.height; row += 1) {
    for (let col = 0; col < puzzle.grid.width; col += 1) {
      const key = getCellKey(row, col);
      const isPlayable = playableCells.has(key);
      renderedCells.push(
        <span
          key={key}
          className={`block aspect-square rounded-[3px] border ${
            isPlayable
              ? 'border-[#787c7e] bg-[#787c7e]'
              : 'border-transparent bg-transparent opacity-30'
          }`}
        />,
      );
    }
  }

  return (
    <div className="mini-puzzle-preview flex h-full w-full items-center justify-center p-1">
      <div
        className="grid gap-[2px]"
        style={{
          gridTemplateColumns: `repeat(${puzzle.grid.width}, 1fr)`,
          gridTemplateRows: `repeat(${puzzle.grid.height}, 1fr)`,
          aspectRatio: `${puzzle.grid.width} / ${puzzle.grid.height}`,
          maxWidth: '100%',
          maxHeight: '100%',
          width: puzzle.grid.width >= puzzle.grid.height ? '100%' : 'auto',
          height: puzzle.grid.height > puzzle.grid.width ? '100%' : 'auto',
        }}
        aria-hidden="true"
      >
        {renderedCells}
      </div>
    </div>
  );
};

export default MiniPuzzlePreview;
