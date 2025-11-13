import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GameField, { Direction, GameLevel, OverlayState } from './GameField';
import { GUESS_WORDS } from '../words/words';

type TutorialScreenProps = {
  onComplete?: () => void;
};

type TutorialWord = {
  id: string;
  word: string;
  definition?: string;
  state: 'idle' | 'locked';
  direction?: Direction;
  isTarget: boolean;
};

type DragState = {
  word: TutorialWord;
  pointerId: number;
  current: { x: number; y: number };
  targetDirection: Direction | null;
};

const TARGET_WORDS: TutorialWord[] = [
  {
    id: 'start',
    word: 'start',
    definition: 'Kick things off across the row.',
    state: 'idle',
    direction: 'across',
    isTarget: true,
  },
  {
    id: 'gamer',
    word: 'gamer',
    definition: 'Stack the column with this word.',
    state: 'idle',
    direction: 'down',
    isTarget: true,
  },
];

const TUTORIAL_LEVEL: GameLevel = {
  id: 'tutorial',
  rows: 5,
  cols: 5,
  words: [
    { id: 'tutorial-across', direction: 'across', answer: 'start', start: { row: 1, col: 0 } },
    { id: 'tutorial-down', direction: 'down', answer: 'gamer', start: { row: 0, col: 2 } },
  ],
  prefilledLetters: { '1-2': 'A' },
  intersection: { row: 1, col: 2 },
};

const getRandomWordBank = (count: number) => {
  const excluded = new Set(TARGET_WORDS.map((word) => word.word.toLowerCase()));
  const options = GUESS_WORDS.filter(
    ({ word }) => word.length === 5 && !excluded.has(word.toLowerCase())
  );

  const selection: TutorialWord[] = [];
  const pool = [...options];

  while (selection.length < count && pool.length) {
    const index = Math.floor(Math.random() * pool.length);
    const [next] = pool.splice(index, 1);
    if (!next) {
      break;
    }
    selection.push({
      id: next.word,
      word: next.word,
      definition: next.definition,
      state: 'idle',
      isTarget: false,
    });
  }

  return [...TARGET_WORDS, ...selection];
};

const TutorialScreen = ({ onComplete }: TutorialScreenProps) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [wordBank, setWordBank] = useState<TutorialWord[]>(() => getRandomWordBank(4));
  const [committedLetters, setCommittedLetters] = useState<Record<string, string>>(
    () => ({ ...(TUTORIAL_LEVEL.prefilledLetters ?? {}) })
  );
  const [solved, setSolved] = useState<Record<Direction, boolean>>({
    across: false,
    down: false,
  });
  const [activeDrag, setActiveDrag] = useState<DragState | null>(null);
  const [failedOverlay, setFailedOverlay] = useState<OverlayState | null>(null);
  const [rejectedWordId, setRejectedWordId] = useState<string | null>(null);

  const isComplete = solved.across && solved.down;

  const computeDropTarget = useCallback(
    (clientX: number, clientY: number): Direction | null => {
      const element = boardRef.current;
      if (!element) {
        return null;
      }

      const rect = element.getBoundingClientRect();
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        return null;
      }

      const cellWidth = rect.width / TUTORIAL_LEVEL.cols;
      const cellHeight = rect.height / TUTORIAL_LEVEL.rows;
      const colIndex = Math.floor((clientX - rect.left) / cellWidth);
      const rowIndex = Math.floor((clientY - rect.top) / cellHeight);

      const acrossRow = TUTORIAL_LEVEL.words.find((word) => word.direction === 'across')?.start.row ?? 0;
      const downCol = TUTORIAL_LEVEL.words.find((word) => word.direction === 'down')?.start.col ?? 0;

      const withinAcross = rowIndex === acrossRow;
      const withinDown = colIndex === downCol;

      if (withinAcross && withinDown) {
        const rowCenter = rect.top + (acrossRow + 0.5) * cellHeight;
        const colCenter = rect.left + (downCol + 0.5) * cellWidth;
        const distanceToRow = Math.abs(clientY - rowCenter);
        const distanceToCol = Math.abs(clientX - colCenter);
        return distanceToRow <= distanceToCol ? 'across' : 'down';
      }

      if (withinAcross) {
        return 'across';
      }

      if (withinDown) {
        return 'down';
      }

      return null;
    },
    [boardRef]
  );

  useEffect(() => {
    if (!failedOverlay) {
      return undefined;
    }
    const timeout = window.setTimeout(() => setFailedOverlay(null), 900);
    return () => window.clearTimeout(timeout);
  }, [failedOverlay]);

  useEffect(() => {
    if (!rejectedWordId) {
      return undefined;
    }
    const timeout = window.setTimeout(() => setRejectedWordId(null), 600);
    return () => window.clearTimeout(timeout);
  }, [rejectedWordId]);

  const finishAttempt = useCallback(
    (word: TutorialWord, direction: Direction | null) => {
      if (!direction) {
        return;
      }

      const placement = TUTORIAL_LEVEL.words.find((entry) => entry.direction === direction);
      if (!placement) {
        return;
      }

      const candidate = word.word.toLowerCase();
      const solution = placement.answer.toLowerCase();

      if (candidate === solution) {
        setCommittedLetters((prev) => {
          const next = { ...prev };
          placement.answer.split('').forEach((letter, index) => {
            const row = placement.start.row + (direction === 'down' ? index : 0);
            const col = placement.start.col + (direction === 'across' ? index : 0);
            next[`${row}-${col}`] = letter.toUpperCase();
          });
          return next;
        });

        setSolved((prev) => ({ ...prev, [direction]: true }));
        setWordBank((prev) =>
          prev.map((entry) =>
            entry.id === word.id ? { ...entry, state: 'locked', direction } : entry
          )
        );
        return;
      }

      const mismatchedIndices: number[] = [];
      for (let index = 0; index < placement.answer.length; index += 1) {
        if ((candidate[index] ?? '') !== placement.answer[index]) {
          mismatchedIndices.push(index);
        }
      }

      setFailedOverlay({
        direction,
        letters: word.word.toUpperCase().split(''),
        status: 'error',
        mismatchedIndices,
      });
      setRejectedWordId(word.id);
    },
    []
  );

  useEffect(() => {
    if (!activeDrag) {
      return undefined;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerId !== activeDrag.pointerId) return;
      event.preventDefault();
      const direction = computeDropTarget(event.clientX, event.clientY);
      setActiveDrag((prev) =>
        prev
          ? {
              ...prev,
              current: { x: event.clientX, y: event.clientY },
              targetDirection: direction,
            }
          : prev
      );
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerId !== activeDrag.pointerId) return;
      event.preventDefault();
      setActiveDrag((prev) => {
        if (!prev) return null;
        const dropDirection = prev.targetDirection;
        finishAttempt(prev.word, dropDirection);
        return null;
      });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp, { passive: false });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [activeDrag, computeDropTarget, finishAttempt]);

  const overlay: OverlayState | null = useMemo(() => {
    if (failedOverlay) {
      return failedOverlay;
    }
    if (activeDrag?.targetDirection && activeDrag.word) {
      return {
        direction: activeDrag.targetDirection,
        letters: activeDrag.word.word.toUpperCase().split(''),
        status: 'preview',
      };
    }
    return null;
  }, [activeDrag, failedOverlay]);

  const handlePointerDown = (word: TutorialWord) => (event: React.PointerEvent<HTMLButtonElement>) => {
    if (word.state !== 'idle' || failedOverlay) {
      return;
    }

    event.preventDefault();
    setActiveDrag({
      word,
      pointerId: event.pointerId,
      current: { x: event.clientX, y: event.clientY },
      targetDirection: null,
    });
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center bg-[#f6f5f0] px-4 py-10 text-[#1a1a1b]">
      <div className="relative w-full max-w-6xl rounded-[32px] border border-[#e2e5ea] bg-white/95 p-6 shadow-[0_24px_80px_rgba(149,157,165,0.35)] backdrop-blur lg:p-10">
        <div className="flex flex-col gap-10 lg:flex-row">
          <div className="lg:w-5/12">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#8c8f94]">Tutorial</p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight text-[#1a1a1b] sm:text-4xl">
              Learn the basics
            </h1>
            <p className="mt-3 text-base text-[#4b4e52]">
              Drag a word tile, hover over a row or column, and let go to try it. Match the intersection
              letter <span className="font-semibold text-[#6aaa64]">A</span> to solve both clues.
            </p>

            <div className="mt-8 space-y-3">
              {wordBank.map((word) => (
                <button
                  key={word.id}
                  type="button"
                  className={`word-card flex w-full flex-col gap-1 rounded-2xl border border-[#e2e5ea] bg-white px-4 py-3 text-left shadow-sm transition ${word.state === 'locked' ? 'word-card--locked' : 'hover:-translate-y-0.5 hover:shadow-md'} ${rejectedWordId === word.id ? 'word-card--flyback' : ''} ${
                    activeDrag?.word.id === word.id ? 'opacity-60' : ''
                  }`}
                  onPointerDown={handlePointerDown(word)}
                  disabled={word.state !== 'idle'}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold uppercase tracking-wide">{word.word}</span>
                    {word.isTarget ? (
                      <span className="text-xs font-semibold uppercase text-[#6aaa64]">Goal</span>
                    ) : (
                      <span className="text-xs font-medium text-[#8c8f94]">Practice</span>
                    )}
                  </div>
                  {word.definition ? (
                    <p className="text-xs text-[#686c73]">{word.definition}</p>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center gap-6">
            <GameField
              ref={boardRef}
              level={TUTORIAL_LEVEL}
              committedLetters={committedLetters}
              overlay={overlay}
              activeDirection={activeDrag?.targetDirection ?? null}
            />

            <div className="rounded-2xl border border-[#e2e5ea] bg-[#f8f8f4] px-5 py-4 text-sm text-[#4b4e52]">
              {isComplete
                ? 'Nice! Both START and GAMER are locked in. Tap continue to head to the main game.'
                : activeDrag?.targetDirection
                ? `Release to try placing ${activeDrag.word.word.toUpperCase()} ${activeDrag.targetDirection === 'across' ? 'across the row' : 'down the column'}.`
                : 'Pick a word on the left, drag it over the board, and line it up with either the horizontal or vertical slot.'}
            </div>

            {isComplete && (
              <button
                type="button"
                className="rounded-full bg-[#1a1a1b] px-8 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-black"
                onClick={onComplete}
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>

      {activeDrag ? (
        <div
          className="pointer-events-none fixed z-50 flex -translate-x-1/2 -translate-y-1/2 items-center rounded-full bg-white px-6 py-3 text-lg font-semibold uppercase text-[#1a1a1b] shadow-[0_12px_30px_rgba(0,0,0,0.2)]"
          style={{ left: activeDrag.current.x, top: activeDrag.current.y }}
        >
          {activeDrag.word.word}
        </div>
      ) : null}
    </section>
  );
};

export default TutorialScreen;
