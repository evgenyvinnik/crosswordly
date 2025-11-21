import type { Direction, GameLevelWord } from './GameField';
import type { GameWord } from './gameScreenUtils';

const GAME_SCREEN_DRAG_PREVIEW_STYLE =
  'pointer-events-none fixed z-50 flex -translate-x-1/2 -translate-y-1/2 items-center rounded-full bg-white px-6 py-3 text-lg font-semibold uppercase text-[#1a1a1b] shadow-[0_12px_30px_rgba(0,0,0,0.2)]';

export type DragState = {
  word: GameWord;
  pointerId: number;
  current: { x: number; y: number };
  targetDirection: Direction | null;
  targetPlacementId: GameLevelWord['id'] | null;
};

/**
 * Renders a floating preview of the word being dragged.
 * Follows the pointer position during a drag operation.
 *
 * @param props - Component properties
 * @param props.activeDrag - Current state of the drag operation
 */
const DragPreview = ({ activeDrag }: { activeDrag: DragState | null }) => {
  if (!activeDrag) {
    return null;
  }

  return (
    <div
      className={GAME_SCREEN_DRAG_PREVIEW_STYLE}
      style={{ left: activeDrag.current.x, top: activeDrag.current.y }}
    >
      {activeDrag.word.word}
    </div>
  );
};

export default DragPreview;
