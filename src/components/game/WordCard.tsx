import { memo, type PointerEventHandler } from 'react';

type WordCardWord = {
  id: string | number;
  word: string;
  state: 'idle' | 'locked';
};

type WordCardProps = {
  word: WordCardWord;
  isActive: boolean;
  isRejected: boolean;
  onPointerDown: PointerEventHandler<HTMLButtonElement>;
};

const WordCard = ({ word, isActive, isRejected, onPointerDown }: WordCardProps) => (
  <button
    type="button"
    className={`word-card flex flex-col items-center text-center text-base font-semibold uppercase text-[#1a1a1b] transition ${
      word.state === 'locked' ? 'word-card--locked' : 'hover:-translate-y-0.5'
    } ${isRejected ? 'word-card--flyback' : ''} ${isActive ? 'opacity-60' : ''}`}
    onPointerDown={onPointerDown}
    aria-label={`Drag word ${word.word}`}
  >
    <div className="flex items-center justify-center gap-1">
      {word.word
        .toUpperCase()
        .split('')
        .map((letter, index) => (
          <span key={`${word.id}-${index}`} className="word-chip-letter">
            {letter}
          </span>
        ))}
    </div>
  </button>
);

export default memo(WordCard);
