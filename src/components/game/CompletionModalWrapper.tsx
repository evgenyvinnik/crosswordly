import GameCompletionModal from './GameCompletionModal';
import type { GameLevel } from './GameField';
import type { PlacedWord } from './wordPlacementUtils';

type CompletionModalWrapperProps = {
  isComplete: boolean;
  level: GameLevel;
  placedWords: Record<string, PlacedWord | null>;
  committedLetters: Record<string, string>;
  levelTitle?: string;
  onExit?: () => void;
};

const CompletionModalWrapper = ({
  isComplete,
  level,
  placedWords,
  committedLetters,
  levelTitle,
  onExit,
}: CompletionModalWrapperProps) => {
  if (!isComplete) {
    return null;
  }

  return (
    <GameCompletionModal
      onExit={onExit}
      level={level}
      committedLetters={committedLetters}
      placedWords={placedWords}
      levelTitle={levelTitle}
    />
  );
};

export default CompletionModalWrapper;
