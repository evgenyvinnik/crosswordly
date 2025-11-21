import type { GameWord } from '../../utils/gameScreenUtils';
import type { GameLevelWord } from './GameField';

type KeyboardHelpBannerProps = {
  selectedWord: GameWord | null;
  focusedWordSlot: GameLevelWord['id'] | null;
};

/**
 * Displays a banner with keyboard navigation instructions.
 * Shows context-aware help based on the current selection state.
 *
 * @param props - Component properties
 * @param props.selectedWord - The currently selected word from the bank
 * @param props.focusedWordSlot - The currently focused word slot on the grid
 */
const KeyboardHelpBanner = ({ selectedWord, focusedWordSlot }: KeyboardHelpBannerProps) => {
  if (!selectedWord && !focusedWordSlot) {
    return null;
  }

  return (
    <div
      className="mt-3 rounded-lg bg-blue-50 border border-blue-200 px-4 py-2 text-center text-sm text-blue-900"
      role="status"
      aria-live="polite"
    >
      {selectedWord && focusedWordSlot
        ? 'Press Enter to place word in focused slot, Escape to cancel'
        : selectedWord
          ? 'Tab to a word slot on the grid, then press Enter to place'
          : 'Select a word from the left/right, then Tab to this slot and press Enter'}
    </div>
  );
};

export default KeyboardHelpBanner;
