import { memo } from 'react';
import WordCard from '../game/WordCard';
import { GameWord } from '../game/gameScreenUtils';

type WordBankColumnProps = {
  words: GameWord[];
  activeDragWordId: string | number | null;
  selectedWordId: string | number | null;
  rejectedWordId: string | number | null;
  onPointerDown: (word: GameWord) => (event: React.PointerEvent<HTMLButtonElement>) => void;
  onClick: (word: GameWord) => () => void;
  ariaLabel: string;
};

/**
 * Renders a column of word cards in the word bank
 */
const WordBankColumn = memo(
  ({
    words,
    activeDragWordId,
    selectedWordId,
    rejectedWordId,
    onPointerDown,
    onClick,
    ariaLabel,
  }: WordBankColumnProps) => {
    return (
      <nav className="w-full max-w-3xl lg:w-auto lg:max-w-[30rem]" aria-label={ariaLabel}>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-1">
          {words.map((word) => (
            <WordCard
              key={word.id}
              word={word}
              isActive={activeDragWordId === word.id}
              isSelected={selectedWordId === word.id}
              isRejected={rejectedWordId === word.id}
              onPointerDown={onPointerDown(word)}
              onClick={onClick(word)}
            />
          ))}
        </div>
      </nav>
    );
  },
);

WordBankColumn.displayName = 'WordBankColumn';

export default WordBankColumn;
