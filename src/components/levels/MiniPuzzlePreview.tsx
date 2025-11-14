import { useMemo } from 'react';
import type { GameLevel } from '../GameField';

const MiniPuzzlePreview = ({ puzzle }: { puzzle: GameLevel }) => {
  const playableCells = useMemo(() => {
    const cells = new Set<string>();
    puzzle.words.forEach((word) => {
      word.answer.split('').forEach((_, index) => {
        const row = word.start.row + (word.direction === 'down' ? index : 0);
        const col = word.start.col + (word.direction === 'across' ? index : 0);
        cells.add(`${row}-${col}`);
      });
    });
    return cells;
  }, [puzzle]);

  const renderedCells = [];
  for (let row = 0; row < puzzle.rows; row += 1) {
    for (let col = 0; col < puzzle.cols; col += 1) {
      const isPlayable = playableCells.has(`${row}-${col}`);
      renderedCells.push(
        <span
          key={`${row}-${col}`}
          className={`block rounded-[3px] border ${
            isPlayable
              ? 'border-[#6e4a1b] bg-[#f7ead5]'
              : 'border-transparent bg-transparent opacity-20'
          }`}
        />,
      );
    }
  }

  return (
    <div
      className="grid h-full w-full gap-[2px] rounded-xl bg-[#fff6ea] p-1 shadow-inner"
      style={{ gridTemplateColumns: `repeat(${puzzle.cols}, minmax(0, 1fr))` }}
      aria-hidden="true"
    >
      {renderedCells}
    </div>
  );
};

export default MiniPuzzlePreview;
