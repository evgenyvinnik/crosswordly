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

// The vertical padding stretches the card to a 40px touch target on phones without bigger letters
const WORD_CARD_BASE_STYLE =
  'word-card flex flex-col items-center py-1.5 text-center text-base font-semibold uppercase text-[#1a1a1b] transition';

/**
 * Renders a single word card in the word bank.
 * Represents a word that can be dragged or tapped to place on the board. Placed words stay
 * pressable so tapping them sends them back to the bank.
 *
 * @param props - Component properties
 * @param props.word - The word data
 * @param props.isActive - Whether the word is currently being dragged
 * @param props.isSelected - Whether the word is currently selected
 * @param props.isRejected - Whether the word was recently rejected (for animation)
 * @param props.onPointerDown - Handler for pointer down events
 * @param props.onClick - Handler for click events
 */
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
    // Pressing and holding picks the word up; keep Android from opening a context menu instead
    onContextMenu={(event) => event.preventDefault()}
    aria-label={`${word.state === 'locked' ? 'Remove placed' : 'Select'} word ${word.word}`}
    aria-pressed={isSelected}
  >
    <div className="flex items-center justify-center gap-0.5 sm:gap-1" aria-hidden="true">
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
