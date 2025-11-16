import { memo, type PointerEventHandler } from 'react';

type WordCardWord = {
  id: string | number;
  word: string;
  state: 'idle' | 'locked';
};

type WordCardProps = {
  word: WordCardWord;
  isActive: boolean;
  isSelected: boolean;
  isRejected: boolean;
  onPointerDown: PointerEventHandler<HTMLButtonElement>;
  onClick: () => void;
};

const WORD_CARD_BASE_STYLE =
  'word-card flex flex-col items-center text-center text-base font-semibold uppercase text-[#1a1a1b] transition';

const WordCard = ({
  word,
  isActive,
  isSelected,
  isRejected,
  onPointerDown,
  onClick,
}: WordCardProps) => (
  <button
    type="button"
    className={`${WORD_CARD_BASE_STYLE} ${
      word.state === 'locked' ? 'word-card--locked' : 'hover:-translate-y-0.5'
    } ${isRejected ? 'word-card--flyback' : ''} ${isActive ? 'opacity-60' : ''}`}
    onPointerDown={onPointerDown}
    onClick={onClick}
    aria-label={`Drag word ${word.word}`}
  >
    <div className="flex items-center justify-center gap-0.5 sm:gap-1">
      {word.word.split('').map((letter, index) => (
        <span
          key={`${word.id}-${index}`}
          className={`word-chip-letter uppercase ${isSelected ? 'word-chip-letter--selected' : ''}`}
        >
          {letter}
        </span>
      ))}
    </div>
  </button>
);

export default memo(WordCard);
