import { RefObject } from 'react';
import { GameLevelWord, GameLevel } from '../game/GameField';
import { getCellKey } from '../../lib/gridUtils';
import { CrosswordCell } from './CrosswordCell';

interface CrosswordBoardProps {
  boardRef: RefObject<HTMLDivElement | null>;
  puzzleLevel: GameLevel;
  boardContainerStyle: string;
  gapStyle: string;
  cellSizeStyle: string;
  selectedWord: GameLevelWord | null;
  currentLetterIndex: number;
  typedLetters: Record<string, string>;
  errorWords: Set<string>;
  correctWords: Set<string>;
  onCellClick: (row: number, col: number) => void;
}

export function CrosswordBoard({
  boardRef,
  puzzleLevel,
  boardContainerStyle,
  gapStyle,
  cellSizeStyle,
  selectedWord,
  currentLetterIndex,
  typedLetters,
  errorWords,
  correctWords,
  onCellClick,
}: CrosswordBoardProps) {
  return (
    <div
      ref={boardRef}
      className={`${boardContainerStyle} ${gapStyle}`}
      style={{
        gridTemplateColumns: `repeat(${puzzleLevel.grid.width}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${puzzleLevel.grid.height}, minmax(0, 1fr))`,
      }}
      role="grid"
      aria-label={puzzleLevel.name ? `${puzzleLevel.name} crossword grid` : 'Crossword puzzle grid'}
      aria-rowcount={puzzleLevel.grid.height}
      aria-colcount={puzzleLevel.grid.width}
    >
      {Array.from({ length: puzzleLevel.grid.height }).map((_, row) =>
        Array.from({ length: puzzleLevel.grid.width }).map((_, col) => {
          const cellKey = getCellKey(row, col);
          const isPlayable = puzzleLevel.words.some((word) => {
            for (let i = 0; i < word.word.length; i++) {
              const wordRow = word.startRow + (word.direction === 'down' ? i : 0);
              const wordCol = word.startCol + (word.direction === 'across' ? i : 0);
              if (wordRow === row && wordCol === col) return true;
            }
            return false;
          });

          return (
            <CrosswordCell
              key={cellKey}
              row={row}
              col={col}
              cellKey={cellKey}
              isPlayable={isPlayable}
              cellSizeStyle={cellSizeStyle}
              puzzleWords={puzzleLevel.words}
              selectedWord={selectedWord}
              currentLetterIndex={currentLetterIndex}
              typedLetters={typedLetters}
              errorWords={errorWords}
              correctWords={correctWords}
              onCellClick={onCellClick}
            />
          );
        }),
      )}
    </div>
  );
}
