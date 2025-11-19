import { GameLevelWord } from '../game/GameField';
import { BASE_PLAYABLE_CELL_STYLE, CLUE_NUMBER_BADGE_STYLE } from '../../styles/constants';

interface CrosswordCellProps {
  row: number;
  col: number;
  cellKey: string;
  isPlayable: boolean;
  cellSizeStyle: string;
  puzzleWords: GameLevelWord[];
  selectedWord: GameLevelWord | null;
  currentLetterIndex: number;
  typedLetters: Record<string, string>;
  errorWords: Set<string>;
  correctWords: Set<string>;
  onCellClick: (row: number, col: number) => void;
}

export function CrosswordCell({
  row,
  col,
  cellKey,
  isPlayable,
  cellSizeStyle,
  puzzleWords,
  selectedWord,
  currentLetterIndex,
  typedLetters,
  errorWords,
  correctWords,
  onCellClick,
}: CrosswordCellProps) {
  if (!isPlayable) {
    return (
      <div
        key={cellKey}
        className={`${BASE_PLAYABLE_CELL_STYLE} ${cellSizeStyle} border-transparent bg-transparent text-transparent`}
      />
    );
  }

  const clueNumber = puzzleWords.find((word) => {
    return word.startRow === row && word.startCol === col && word.clueNumber;
  })?.clueNumber;

  const isSelected =
    selectedWord &&
    puzzleWords.some((word) => {
      if (word.id !== selectedWord.id) return false;
      for (let i = 0; i < word.word.length; i++) {
        const wordRow = word.startRow + (word.direction === 'down' ? i : 0);
        const wordCol = word.startCol + (word.direction === 'across' ? i : 0);
        if (wordRow === row && wordCol === col) return true;
      }
      return false;
    });

  const isCurrent =
    selectedWord &&
    row === selectedWord.startRow + (selectedWord.direction === 'down' ? currentLetterIndex : 0) &&
    col === selectedWord.startCol + (selectedWord.direction === 'across' ? currentLetterIndex : 0);

  const isError = puzzleWords.some(
    (word) =>
      errorWords.has(word.id.toString()) &&
      Array.from({ length: word.word.length }).some((_, i) => {
        const wordRow = word.startRow + (word.direction === 'down' ? i : 0);
        const wordCol = word.startCol + (word.direction === 'across' ? i : 0);
        return wordRow === row && wordCol === col;
      }),
  );

  const letter = typedLetters[cellKey];

  // Check if this cell belongs to a correctly guessed word
  const isInCorrectWord = puzzleWords.some((word) => {
    if (!correctWords.has(word.id.toString())) return false;
    for (let i = 0; i < word.word.length; i++) {
      const wordRow = word.startRow + (word.direction === 'down' ? i : 0);
      const wordCol = word.startCol + (word.direction === 'across' ? i : 0);
      if (wordRow === row && wordCol === col) return true;
    }
    return false;
  });

  // Use same base styling as GameField
  const cellClassName = `${cellSizeStyle} ${BASE_PLAYABLE_CELL_STYLE} relative cursor-pointer transition-colors ${
    isInCorrectWord
      ? 'bg-[#6aaa64] border-[#6aaa64] text-white shadow-inner'
      : isError
        ? 'border-yellow-400 bg-yellow-100'
        : isCurrent
          ? 'border-blue-500 bg-blue-50'
          : isSelected
            ? 'border-green-500 bg-green-50'
            : letter
              ? 'border-[#d3d6da] bg-white/80'
              : 'border-[#d3d6da] bg-white/80 hover:bg-gray-50'
  }`;

  const ariaLabel = `Cell row ${row + 1}, column ${col + 1}${clueNumber ? `, clue ${clueNumber}` : ''}${letter ? `, letter ${letter}` : ', empty'}${isInCorrectWord ? ', correct' : isError ? ', incorrect' : isCurrent ? ', current' : isSelected ? ', in selected word' : ''}`;

  return (
    <button
      key={cellKey}
      type="button"
      data-cell-key={cellKey}
      onClick={() => onCellClick(row, col)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCellClick(row, col);
        }
      }}
      className={cellClassName}
      role="gridcell"
      aria-label={ariaLabel}
      aria-selected={isSelected || isCurrent || undefined}
      tabIndex={0}
    >
      {clueNumber !== undefined && (
        <span className={CLUE_NUMBER_BADGE_STYLE} aria-hidden="true">
          {clueNumber}
        </span>
      )}
      <span aria-hidden="true">{letter || ''}</span>
    </button>
  );
}
