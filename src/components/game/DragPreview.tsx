import type { Direction, GameLevelWord } from './GameField';
import type { GameWord } from '../../utils/gameScreenUtils';

const GAME_SCREEN_DRAG_PREVIEW_STYLE =
  'pointer-events-none fixed z-50 flex -translate-x-1/2 -translate-y-1/2 items-center rounded-full bg-white px-6 py-3 text-lg font-semibold uppercase text-[#1a1a1b] shadow-[0_12px_30px_rgba(0,0,0,0.2)]';

/**
 * How far above the finger a word dragged by touch floats, so the finger does not hide it.
 * The word, not the finger, is what lines up with the grid.
 */
export const TOUCH_DRAG_LIFT_PX = 64;

export type DragState = {
  word: GameWord;
  pointerId: number;
  current: { x: number; y: number };
  isTouch: boolean;
  targetDirection: Direction | null;
  targetPlacementId: GameLevelWord['id'] | null;
};

/**
 * Returns the point a dragged word is aimed at: the pointer itself, or the floating word above
 * the finger for touch drags.
 *
 * @param point - Pointer position in client coordinates
 * @param isTouch - Whether the drag uses a finger
 */
export const getDragAimPoint = (point: { x: number; y: number }, isTouch: boolean) =>
  isTouch ? { x: point.x, y: point.y - TOUCH_DRAG_LIFT_PX } : point;

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

  const { x, y } = getDragAimPoint(activeDrag.current, activeDrag.isTouch);

  return (
    <div className={GAME_SCREEN_DRAG_PREVIEW_STYLE} style={{ left: x, top: y }}>
      {activeDrag.word.word}
    </div>
  );
};

export default DragPreview;
