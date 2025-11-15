import CheckIcon from '../icons/CheckIcon';
import MiniPuzzlePreview from './MiniPuzzlePreview';
import type { LevelDescriptor } from './LevelTypes';

type LevelTileProps = {
  level: LevelDescriptor;
  onSelect: (levelId: string) => void;
};

const LEVEL_TILE_BUTTON_BASE_STYLE =
  'relative aspect-square w-24 rounded-3xl border-2 p-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5efe3] sm:w-28 lg:w-32';
const LEVEL_TILE_LOCKED_STATE_STYLE =
  'cursor-not-allowed border-dashed border-[#d8c7b1] bg-[#f2e8da] text-[#b7aa9b]';
const LEVEL_TILE_UNLOCKED_STATE_STYLE =
  'border-[#c89d67] bg-[#fffaf0] text-[#3b250b] shadow-[0_12px_30px_rgba(120,82,46,0.25)] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(120,82,46,0.35)]';
const COMPLETION_BADGE_STYLE =
  'absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-[#6aaa64] px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-wide text-white';

const LevelTile = ({ level, onSelect }: LevelTileProps) => {
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
      className={`${LEVEL_TILE_BUTTON_BASE_STYLE} ${
        isLocked ? LEVEL_TILE_LOCKED_STATE_STYLE : LEVEL_TILE_UNLOCKED_STATE_STYLE
      }`}
      aria-label={`${level.title} level`}
    >
      {level.isCompleted ? (
        <span className={COMPLETION_BADGE_STYLE}>
          <CheckIcon className="h-3 w-3" />
          Done
        </span>
      ) : null}

      <MiniPuzzlePreview puzzle={level.puzzle} />
    </button>
  );
};

export type { LevelTileProps };
export default LevelTile;
