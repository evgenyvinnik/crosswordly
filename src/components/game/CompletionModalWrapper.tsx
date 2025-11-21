import GameCompletionModal from './GameCompletionModal';
import type { GameLevel } from './GameField';
import type { PlacedWord } from '../../utils/wordPlacementUtils';

type CompletionModalWrapperProps = {
  isComplete: boolean;
  level: GameLevel;
  placedWords: Record<string, PlacedWord | null>;
  committedLetters: Record<string, string>;
  levelTitle?: string;
  onExit?: () => void;
};

/**
 * Wrapper component for the GameCompletionModal.
 * Conditionally renders the modal only when the level is complete.
 *
 * @param props - Component properties
 * @param props.isComplete - Whether the level is completed
 * @param props.level - The completed level data
 * @param props.placedWords - The final state of placed words
 * @param props.committedLetters - The final state of the grid letters
 * @param props.levelTitle - Title of the completed level
 * @param props.onExit - Callback to exit the modal
 */
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
