import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GameField, { Direction, OverlayState } from './GameField';
import { GUESS_WORDS } from '../words/words';
import { TUTORIAL_LEVEL } from '../levels/tutorial';

const WORD_DEFINITIONS = GUESS_WORDS.reduce<Record<string, string | undefined>>((acc, entry) => {
  acc[entry.word.toLowerCase()] = entry.definition;
  return acc;
}, {});

type TutorialScreenProps = {
  onComplete?: () => void;
};

type TutorialWord = {
  id: string;
  word: string;
  state: 'idle' | 'locked';
  direction?: Direction;
  clueNumber?: number;
  clueId?: string;
  definition?: string;
  isTarget: boolean;
};

type DragState = {
  word: TutorialWord;
  pointerId: number;
  current: { x: number; y: number };
  targetDirection: Direction | null;
};

const TARGET_WORDS: TutorialWord[] = TUTORIAL_LEVEL.words.map((word) => ({
  id: word.answer,
  word: word.answer,
  state: 'idle',
  direction: word.direction,
  clueNumber: word.clueNumber,
  clueId: word.id,
  definition: WORD_DEFINITIONS[word.answer.toLowerCase()],
  isTarget: true,
}));

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
      state: 'idle',
      definition: WORD_DEFINITIONS[next.word.toLowerCase()],
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
  const [activeDrag, setActiveDrag] = useState<DragState | null>(null);
  const [failedOverlay, setFailedOverlay] = useState<OverlayState | null>(null);
  const [rejectedWordId, setRejectedWordId] = useState<string | null>(null);

  const placementsByDirection = useMemo(() => {
    const across = TUTORIAL_LEVEL.words.find((word) => word.direction === 'across');
    const down = TUTORIAL_LEVEL.words.find((word) => word.direction === 'down');
    return { across, down };
  }, []);

  const playableCellKeys = useMemo(() => {
    const set = new Set<string>();
    TUTORIAL_LEVEL.words.forEach((word) => {
      word.answer.split('').forEach((_, index) => {
        const row = word.start.row + (word.direction === 'down' ? index : 0);
        const col = word.start.col + (word.direction === 'across' ? index : 0);
        set.add(`${row}-${col}`);
      });
    });
    return Array.from(set);
  }, []);

  const isComplete = useMemo(
    () =>
      playableCellKeys.every(
        (key) => Boolean(committedLetters[key] ?? TUTORIAL_LEVEL.prefilledLetters?.[key])
      ),
    [committedLetters, playableCellKeys]
  );

  const highlightedDirection = activeDrag?.targetDirection ?? null;

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

      const placement = placementsByDirection[direction];
      if (!placement) {
        return;
      }

      const candidateLetters = word.word.toUpperCase().split('');
      const placementLength = placement.answer.length;
      const mismatchedIndices: number[] = [];

      placement.answer.split('').forEach((_, index) => {
        const letter = candidateLetters[index];
        const row = placement.start.row + (direction === 'down' ? index : 0);
        const col = placement.start.col + (direction === 'across' ? index : 0);
        const key = `${row}-${col}`;
        const required =
          (TUTORIAL_LEVEL.prefilledLetters?.[key] ?? '').toUpperCase() ||
          (committedLetters[key] ?? '').toUpperCase();

        if (!letter) {
          mismatchedIndices.push(index);
          return;
        }

        if (required && required !== letter) {
          mismatchedIndices.push(index);
        }
      });

      if (candidateLetters.length !== placementLength) {
        for (let i = placementLength; i < candidateLetters.length; i += 1) {
          mismatchedIndices.push(i);
        }
      }

      if (mismatchedIndices.length > 0) {
        setFailedOverlay({
          direction,
          letters: candidateLetters,
          status: 'error',
          mismatchedIndices,
        });
        setRejectedWordId(word.id);
        return;
      }

      setCommittedLetters((prev) => {
        const next = { ...prev };
        placement.answer.split('').forEach((_, index) => {
          const letter = candidateLetters[index];
          const row = placement.start.row + (direction === 'down' ? index : 0);
          const col = placement.start.col + (direction === 'across' ? index : 0);
          next[`${row}-${col}`] = letter.toUpperCase();
        });
        return next;
      });

      setWordBank((prev) =>
        prev.map((entry) =>
          entry.id === word.id ? { ...entry, state: 'locked', direction } : entry
        )
      );
    },
    [placementsByDirection, committedLetters]
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
      <div className="relative w-full max-w-5xl rounded-[32px] border border-[#e2e5ea] bg-white/95 px-6 py-10 text-center shadow-[0_24px_80px_rgba(149,157,165,0.35)] backdrop-blur sm:px-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#8c8f94]">Tutorial</p>
          <h1 className="text-3xl font-semibold leading-tight text-[#1a1a1b] sm:text-4xl">Learn the basics</h1>
          <p className="text-base text-[#4b4e52]">
            Drag a word tile, line it up with the highlighted row or column, and let go. Keep the green{' '}
            <span className="font-semibold text-[#6aaa64]">A</span> happy to solve both clues.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center gap-8">
          <GameField
            ref={boardRef}
            level={TUTORIAL_LEVEL}
            committedLetters={committedLetters}
            overlay={overlay}
            activeDirection={activeDrag?.targetDirection ?? null}
          />

          <div className="w-full max-w-3xl">
            <div className="grid gap-4 sm:grid-cols-2">
              {(['across', 'down'] as Direction[]).map((directionKey) => {
                const isHighlighted = highlightedDirection === directionKey;
                const activeWord = isHighlighted ? activeDrag?.word : null;
                const description = activeWord?.definition;
                return (
                  <div
                    key={directionKey}
                    className={`rounded-2xl border px-4 py-5 text-left transition ${
                      isHighlighted ? 'border-[#6aaa64] bg-[#f4faf3]' : 'border-[#e2e5ea] bg-white'
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#8c8f94]">
                      {directionKey === 'across' ? 'Across' : 'Down'}
                    </p>
                    {isHighlighted && activeWord ? (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-semibold uppercase tracking-wide text-[#1a1a1b]">
                          {activeWord.word}
                        </p>
                        <p className="text-base leading-snug text-[#4b4e52]">
                          {description ?? 'No description available.'}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-6 h-16 text-sm text-[#c3c6cc]"> </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-full max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#8c8f94]">Word bank</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
              {wordBank.map((word) => (
                <button
                  key={word.id}
                  type="button"
                  className={`word-card inline-flex min-w-[120px] items-center justify-between gap-3 rounded-full border border-[#e2e5ea] bg-white px-5 py-3 text-left text-base font-semibold uppercase tracking-wide text-[#1a1a1b] shadow-sm transition ${
                    word.state === 'locked'
                      ? 'word-card--locked'
                      : 'hover:-translate-y-0.5 hover:border-[#6aaa64] hover:shadow-md'
                  } ${rejectedWordId === word.id ? 'word-card--flyback' : ''} ${
                    activeDrag?.word.id === word.id ? 'opacity-60' : ''
                  }`}
                  onPointerDown={handlePointerDown(word)}
                  disabled={word.state !== 'idle'}
                >
                  <span>{word.word}</span>
                  <span
                    className={`text-xs font-semibold uppercase ${
                      word.isTarget ? 'text-[#6aaa64]' : 'text-[#8c8f94]'
                    }`}
                  >
                    {word.isTarget ? 'Goal' : 'Practice'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="w-full max-w-3xl rounded-2xl border border-[#e2e5ea] bg-[#f8f8f4] px-5 py-4 text-sm text-[#4b4e52]">
            {isComplete
              ? 'Great! Every cell is filled and the board checks out. Tap continue to head to the main game.'
              : highlightedDirection
              ? `Release to try placing ${activeDrag?.word.word.toUpperCase()} ${
                  highlightedDirection === 'across' ? 'across the row' : 'down the column'
                }.`
              : 'Pick a word, drag it onto the board, and match the highlighted slot.'}
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
