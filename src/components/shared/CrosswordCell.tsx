import { GameLevelWord } from '../game/GameField';
import { BASE_PLAYABLE_CELL_STYLE, CLUE_NUMBER_BADGE_STYLE } from '../../styles/constants';

type CellVisualState = 'correct' | 'error' | 'current' | 'selected' | 'filled' | 'empty';

const CELL_STATE_CLASS_MAP: Record<CellVisualState, string> = {
  correct: 'bg-[#6aaa64] border-[#6aaa64] text-white shadow-inner',
  error: 'border-yellow-400 bg-yellow-100',
  current: 'border-blue-500 bg-blue-50',
  selected: 'border-green-500 bg-green-50',
  filled: 'border-[#d3d6da] bg-white/80',
  empty: 'border-[#d3d6da] bg-white/80 hover:bg-gray-50',
};

const doesWordCoverCell = (word: GameLevelWord, row: number, col: number) => {
  for (let i = 0; i < word.word.length; i += 1) {
    const wordRow = word.startRow + (word.direction === 'down' ? i : 0);
    const wordCol = word.startCol + (word.direction === 'across' ? i : 0);
    if (wordRow === row && wordCol === col) {
      return true;
    }
  }
  return false;
};

const findClueNumber = (words: GameLevelWord[], row: number, col: number) => {
  const match = words.find(
    (word) => word.startRow === row && word.startCol === col && word.clueNumber,
  );
  return match?.clueNumber;
};

const getCellState = (
  puzzleWords: GameLevelWord[],
  row: number,
  col: number,
  selectedWord: GameLevelWord | null,
  currentLetterIndex: number,
  errorWords: Set<string>,
  correctWords: Set<string>,
) => {
  const clueNumber = findClueNumber(puzzleWords, row, col);
  const isSelected = selectedWord ? doesWordCoverCell(selectedWord, row, col) : false;

  const isCurrent = selectedWord
    ? row ===
        selectedWord.startRow + (selectedWord.direction === 'down' ? currentLetterIndex : 0) &&
      col === selectedWord.startCol + (selectedWord.direction === 'across' ? currentLetterIndex : 0)
    : false;

  const checkWords = (wordSet: Set<string>) =>
    puzzleWords.some(
      (word) => wordSet.has(word.id.toString()) && doesWordCoverCell(word, row, col),
    );

  const isError = checkWords(errorWords);
  const isInCorrectWord = checkWords(correctWords);

  return {
    clueNumber,
    isSelected,
    isCurrent,
    isError,
    isInCorrectWord,
  };
};

const getVisualState = (
  isInCorrectWord: boolean,
  isError: boolean,
  isCurrent: boolean,
  isSelected: boolean,
  letter?: string,
): CellVisualState => {
  if (isInCorrectWord) {
    return 'correct';
  }
  if (isError) {
    return 'error';
  }
  if (isCurrent) {
    return 'current';
  }
  if (isSelected) {
    return 'selected';
  }
  return letter ? 'filled' : 'empty';
};

const buildAriaLabel = (
  row: number,
  col: number,
  clueNumber: number | undefined,
  letter: string | undefined,
  visualState: CellVisualState,
) => {
  const clueText = clueNumber ? `, clue ${clueNumber}` : '';
  const letterText = letter ? `, letter ${letter}` : ', empty';
  const statusText: Record<CellVisualState, string> = {
    correct: ', correct',
    error: ', incorrect',
    current: ', current',
    selected: ', in selected word',
    filled: '',
    empty: '',
  };
  return `Cell row ${row + 1}, column ${col + 1}${clueText}${letterText}${statusText[visualState]}`;
};

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

  const { clueNumber, isSelected, isCurrent, isError, isInCorrectWord } = getCellState(
    puzzleWords,
    row,
    col,
    selectedWord,
    currentLetterIndex,
    errorWords,
    correctWords,
  );

  const letter = typedLetters[cellKey];
  const visualState = getVisualState(
    isInCorrectWord,
    isError,
    isCurrent,
    Boolean(isSelected),
    letter,
  );
  const cellClassName = `${cellSizeStyle} ${BASE_PLAYABLE_CELL_STYLE} relative cursor-pointer transition-colors ${CELL_STATE_CLASS_MAP[visualState]}`;
  const ariaLabel = buildAriaLabel(row, col, clueNumber, letter, visualState);

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
