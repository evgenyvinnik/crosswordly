import { useTranslation } from 'react-i18next';
import CheckIcon from '../icons/CheckIcon';
import MiniPuzzlePreview from './MiniPuzzlePreview';
import type { LevelDescriptor } from './LevelTypes';

type LevelTileProps = {
  level: LevelDescriptor;
  onSelect: (levelId: string) => void;
};

const LEVEL_TILE_BUTTON_BASE_STYLE =
  'relative aspect-square w-24 rounded-3xl border-2 p-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6aaa64] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f7f8] sm:w-28 lg:w-32';
const LEVEL_TILE_LOCKED_STATE_STYLE =
  'cursor-not-allowed border-dashed border-[#d3d6da] bg-[#f4f5f6] text-[#a7adb6]';
const LEVEL_TILE_UNLOCKED_STATE_STYLE =
  'border-[#d3d6da] bg-white text-[#1a1a1b] shadow-[0_12px_30px_rgba(149,157,165,0.3)] hover:-translate-y-1.5 hover:border-[#6aaa64] hover:shadow-[0_20px_40px_rgba(149,157,165,0.4)]';
const COMPLETION_BADGE_STYLE =
  'absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#6aaa64] text-white';

/**
 * Renders a tile representing a game level.
 * Displays a mini preview of the puzzle and its completion status.
 *
 * @param props - Component properties
 * @param props.level - The level data
 * @param props.onSelect - Callback when the level is selected
 */
const LevelTile = ({ level, onSelect }: LevelTileProps) => {
  const { t } = useTranslation();
  const isLocked = !level.isAvailable;
  const handleClick = () => {
    if (!isLocked) {
      onSelect(level.id);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLocked}
      data-level-id={level.id}
      className={`${LEVEL_TILE_BUTTON_BASE_STYLE} ${
        isLocked ? LEVEL_TILE_LOCKED_STATE_STYLE : LEVEL_TILE_UNLOCKED_STATE_STYLE
      }`}
      aria-label={t('levels.levelLabel', { title: level.title })}
    >
      {level.isCompleted ? (
        <span className={COMPLETION_BADGE_STYLE} aria-label="Level completed">
          <CheckIcon className="h-4 w-4" />
        </span>
      ) : null}

      <MiniPuzzlePreview puzzle={level.puzzle} />
    </button>
  );
};

export type { LevelTileProps };
export default LevelTile;
