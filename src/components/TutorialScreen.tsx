import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import GameField, { Direction, GameLevelWord, OverlayState } from './GameField';
import CloseIcon from './icons/CloseIcon';
import { GUESS_WORDS } from '../words/words';
import { TUTORIAL_LEVEL } from '../levels';
import DirectionCard from './tutorial/DirectionCard';

const WORD_DEFINITIONS = GUESS_WORDS.reduce<Record<string, string | undefined>>((acc, entry) => {
  acc[entry.word.toLowerCase()] = entry.definition;
  return acc;
}, {});

const WORD_BANK_SIZE = 16;

type TutorialScreenProps = {
  onComplete?: () => void;
  onExit?: () => void;
  onNextLevel?: (levelId: string) => void;
  nextLevel?: {
    id: string;
    title: string;
    description?: string;
  } | null;
};

type TutorialWord = {
  id: string;
  word: string;
  state: 'idle' | 'locked';
  direction?: Direction;
  clueNumber?: number;
  clueId?: string;
  definition?: string;
  bankIndex: number;
  isTarget: boolean;
};

type DragState = {
  word: TutorialWord;
  pointerId: number;
  current: { x: number; y: number };
  targetDirection: Direction | null;
};

const TARGET_WORDS: Omit<TutorialWord, 'bankIndex'>[] = TUTORIAL_LEVEL.words.map((word) => ({
  id: word.answer,
  word: word.answer,
  state: 'idle',
  direction: word.direction,
  clueNumber: word.clueNumber,
  clueId: word.id,
  definition: WORD_DEFINITIONS[word.answer.toLowerCase()],
  isTarget: true,
}));

const getRandomWordBank = () => {
  const excluded = new Set(TARGET_WORDS.map((word) => word.word.toLowerCase()));
  const options = GUESS_WORDS.filter(
    ({ word }) => word.length === 5 && !excluded.has(word.toLowerCase()),
  );

  const selection: Omit<TutorialWord, 'bankIndex'>[] = [...TARGET_WORDS];
  const pool = [...options];

  while (selection.length < WORD_BANK_SIZE && pool.length) {
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

  const shuffled = selection.slice(0, WORD_BANK_SIZE).sort(() => Math.random() - 0.5);

  return shuffled.map((entry, index) => ({
    ...entry,
    bankIndex: index + 1,
  }));
};

type PlacedWord = {
  bankIndex: number;
  word: string;
  definition?: string;
  clueNumber?: number;
  placementId: string;
  direction: Direction;
  wordId: string;
};

type TutorialCompletionModalProps = {
  nextLevel?: {
    id: string;
    title: string;
    description?: string;
  } | null;
  onExit?: () => void;
  onNextLevel?: (levelId: string) => void;
};

const TutorialCompletionModal = ({
  nextLevel,
  onExit,
  onNextLevel,
}: TutorialCompletionModalProps) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0d12]/80 px-4 py-8 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
  >
    <div className="absolute inset-0" aria-hidden="true" onClick={onExit} />
    <div className="relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-white/95 px-6 py-8 text-center shadow-[0_40px_120px_rgba(15,23,42,0.5)] sm:px-10">
      <button
        type="button"
        className="absolute right-4 top-4 rounded-full border border-[#d3d6da] bg-white/90 p-2 text-[#1a1a1b] shadow-sm transition hover:bg-white"
        onClick={onExit}
        aria-label="Go to level selection"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#8c8f94]">
        Tutorial complete
      </p>
      <h2 className="mt-3 text-3xl font-semibold text-[#111213] sm:text-[2.25rem]">
        {nextLevel ? 'Ready for the next challenge?' : 'You have solved all the levels!'}
      </h2>
      <p className="mt-3 text-base leading-relaxed text-[#4b4e52]">
        {nextLevel
          ? `Next up is ${nextLevel.title}. ${nextLevel.description ?? ''}`.trim()
          : 'Incredible work! Check back soon for fresh puzzles and keep celebrating this streak.'}
      </p>
      {nextLevel ? (
        <button
          type="button"
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#1a1a1b] px-8 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-black"
          onClick={() => onNextLevel?.(nextLevel.id)}
        >
          Next level
        </button>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-[#d3d6da] bg-[#f8f8f4] px-6 py-4 text-sm font-semibold uppercase tracking-wide text-[#6aaa64]">
          Keep an eye out for new challenges soon.
        </div>
      )}
    </div>
  </div>
);

const TutorialScreen = ({
  onComplete,
  onExit,
  onNextLevel,
  nextLevel = null,
}: TutorialScreenProps) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [wordBank, setWordBank] = useState<TutorialWord[]>(() => getRandomWordBank());
  const [committedLetters, setCommittedLetters] = useState<Record<string, string>>(() => ({
    ...(TUTORIAL_LEVEL.prefilledLetters ?? {}),
  }));
  const [activeDrag, setActiveDrag] = useState<DragState | null>(null);
  const [failedOverlay, setFailedOverlay] = useState<OverlayState | null>(null);
  const [rejectedWordId, setRejectedWordId] = useState<string | null>(null);
  const [placedWords, setPlacedWords] = useState<Record<Direction, PlacedWord | null>>({
    across: null,
    down: null,
  });
  const completionReportedRef = useRef(false);
  const confettiTriggeredRef = useRef(false);
  const megaConfettiTriggeredRef = useRef(false);

  const placementsByDirection = useMemo<Record<Direction, GameLevelWord | undefined>>(() => {
    const across = TUTORIAL_LEVEL.words.find((word) => word.direction === 'across');
    const down = TUTORIAL_LEVEL.words.find((word) => word.direction === 'down');
    return { across, down };
  }, []);

  const cellDirections = useMemo(() => {
    const map = new Map<string, Direction[]>();
    TUTORIAL_LEVEL.words.forEach((word) => {
      word.answer.split('').forEach((_, index) => {
        const row = word.start.row + (word.direction === 'down' ? index : 0);
        const col = word.start.col + (word.direction === 'across' ? index : 0);
        const key = `${row}-${col}`;
        const existing = map.get(key) ?? [];
        if (!existing.includes(word.direction)) {
          existing.push(word.direction);
        }
        map.set(key, existing);
      });
    });
    return map;
  }, []);

  const buildCommittedLetters = useCallback(
    (placementsState: Record<Direction, PlacedWord | null>) => {
      const base: Record<string, string> = {
        ...(TUTORIAL_LEVEL.prefilledLetters ?? {}),
      };
      (['across', 'down'] as Direction[]).forEach((dir) => {
        const entry = placementsState[dir];
        const placement = placementsByDirection[dir];
        if (!entry || !placement) {
          return;
        }

        entry.word
          .toUpperCase()
          .split('')
          .forEach((letter, index) => {
            const row = placement.start.row + (dir === 'down' ? index : 0);
            const col = placement.start.col + (dir === 'across' ? index : 0);
            base[`${row}-${col}`] = letter;
          });
      });
      return base;
    },
    [placementsByDirection],
  );

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
      playableCellKeys.every((key) =>
        Boolean(committedLetters[key] ?? TUTORIAL_LEVEL.prefilledLetters?.[key]),
      ),
    [committedLetters, playableCellKeys],
  );

  const highlightedDirection = activeDrag?.targetDirection ?? null;

  useEffect(() => {
    if (!isComplete || completionReportedRef.current) {
      return;
    }
    completionReportedRef.current = true;
    onComplete?.();
  }, [isComplete, onComplete]);

  useEffect(() => {
    if (!isComplete || confettiTriggeredRef.current) {
      return;
    }
    confettiTriggeredRef.current = true;
    confetti({
      particleCount: 160,
      spread: 80,
      origin: { y: 0.6 },
      scalar: 0.9,
      ticks: 100,
    });
  }, [isComplete]);

  useEffect(() => {
    if (!isComplete || nextLevel || megaConfettiTriggeredRef.current) {
      return;
    }
    megaConfettiTriggeredRef.current = true;
    const defaults = { spread: 360, ticks: 160, gravity: 0.8, startVelocity: 55, scalar: 1.1 };
    confetti({ ...defaults, particleCount: 200, origin: { x: 0.2, y: 0.2 } });
    confetti({ ...defaults, particleCount: 220, origin: { x: 0.8, y: 0.25 } });
    confetti({ ...defaults, particleCount: 240, origin: { x: 0.5, y: 0.35 } });
  }, [isComplete, nextLevel]);

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

      const acrossRow =
        TUTORIAL_LEVEL.words.find((word) => word.direction === 'across')?.start.row ?? 0;
      const downCol =
        TUTORIAL_LEVEL.words.find((word) => word.direction === 'down')?.start.col ?? 0;

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
    [boardRef],
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

      setWordBank((prev) =>
        prev.map((entry) =>
          entry.id === word.id ? { ...entry, state: 'locked', direction } : entry,
        ),
      );
      setPlacedWords((prev) => {
        const previousEntry = prev[direction];
        if (previousEntry && previousEntry.wordId !== word.id) {
          setWordBank((bank) =>
            bank.map((entry) =>
              entry.id === previousEntry.wordId
                ? { ...entry, state: 'idle', direction: undefined }
                : entry,
            ),
          );
        }
        const next = {
          ...prev,
          [direction]: {
            bankIndex: word.bankIndex,
            word: word.word,
            definition: word.definition,
            clueNumber: placement.clueNumber,
            placementId: placement.id,
            direction,
            wordId: word.id,
          },
        };
        setCommittedLetters(buildCommittedLetters(next));
        return next;
      });
    },
    [placementsByDirection, buildCommittedLetters, committedLetters],
  );

  const releaseWord = useCallback(
    (word: TutorialWord) => {
      if (word.state !== 'locked' || !word.direction) {
        return;
      }

      setPlacedWords((prev) => {
        if (!prev[word.direction]) {
          return prev;
        }
        const next = { ...prev, [word.direction]: null };
        setCommittedLetters(buildCommittedLetters(next));
        return next;
      });

      setWordBank((prev) =>
        prev.map((entry) =>
          entry.id === word.id ? { ...entry, state: 'idle', direction: undefined } : entry,
        ),
      );
    },
    [buildCommittedLetters],
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
          : prev,
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

    window.addEventListener('pointermove', handlePointerMove, {
      passive: false,
    });
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

  const [leftColumnWords, rightColumnWords] = useMemo(() => {
    const midpoint = Math.ceil(wordBank.length / 2);
    return [wordBank.slice(0, midpoint), wordBank.slice(midpoint)];
  }, [wordBank]);

  const buildDirectionCardProps = (direction: Direction) => {
    const placement = placedWords[direction];
    const isHighlighted = highlightedDirection === direction;
    const isDraggingWord = Boolean(isHighlighted && activeDrag?.word);
    return {
      completedDefinition: placement?.definition,
      completedClueNumber: placement?.clueNumber ?? placementsByDirection[direction]?.clueNumber,
      hasCompletedEntry: Boolean(placement),
      isHighlighted,
      showActiveWord: isDraggingWord,
      activeWordDefinition:
        isHighlighted && activeDrag?.word ? activeDrag.word.definition : undefined,
    };
  };

  const acrossCardProps = buildDirectionCardProps('across');
  const downCardProps = buildDirectionCardProps('down');

  const handlePointerDown =
    (word: TutorialWord) => (event: React.PointerEvent<HTMLButtonElement>) => {
      if (failedOverlay) {
        return;
      }

      event.preventDefault();
      if (word.state === 'locked') {
        releaseWord(word);
      }
      setActiveDrag({
        word,
        pointerId: event.pointerId,
        current: { x: event.clientX, y: event.clientY },
        targetDirection: null,
      });
    };

  useEffect(() => {
    const boardElement = boardRef.current;
    if (!boardElement) {
      return undefined;
    }

    const handleBoardPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || !event.isPrimary || activeDrag || failedOverlay) {
        return;
      }

      const target = event.target instanceof HTMLElement ? event.target : null;
      const cellElement = target?.closest<HTMLElement>('[data-cell-key]');
      const cellKey = cellElement?.dataset.cellKey;
      if (!cellKey) {
        return;
      }

      const directionsAtCell = cellDirections.get(cellKey);
      if (!directionsAtCell?.length) {
        return;
      }

      const directionToRelease = directionsAtCell.find((dir) => placedWords[dir]);
      if (!directionToRelease) {
        return;
      }

      const lockedWord = wordBank.find(
        (entry) => entry.direction === directionToRelease && entry.state === 'locked',
      );
      if (!lockedWord) {
        return;
      }

      event.preventDefault();
      releaseWord(lockedWord);
      setActiveDrag({
        word: lockedWord,
        pointerId: event.pointerId,
        current: { x: event.clientX, y: event.clientY },
        targetDirection: directionToRelease,
      });
    };

    boardElement.addEventListener('pointerdown', handleBoardPointerDown);

    return () => {
      boardElement.removeEventListener('pointerdown', handleBoardPointerDown);
    };
  }, [activeDrag, cellDirections, failedOverlay, placedWords, releaseWord, wordBank]);

  return (
    <section className="relative flex min-h-screen items-center justify-center bg-[#f6f5f0] px-4 py-10 text-[#1a1a1b]">
      <div className="relative w-full max-w-5xl rounded-[32px] border border-[#e2e5ea] bg-white/95 px-6 py-10 text-center shadow-[0_24px_80px_rgba(149,157,165,0.35)] backdrop-blur sm:px-10">
        {onExit ? (
          <button
            type="button"
            aria-label="Close tutorial and view levels"
            className="absolute right-6 top-6 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-[#d3d6da] bg-white/80 text-[#1a1a1b] shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1b] sm:right-8 sm:top-8"
            onClick={onExit}
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        ) : null}
        <div className="mx-auto flex max-w-3xl flex-col items-center">
          <h1 className="text-3xl font-semibold leading-tight text-[#1a1a1b] sm:text-4xl">
            How to play
          </h1>
          <p className="text-base text-[#4b4e52]">
            Drag a word tile, line it up with the highlighted row or column, and let go.
          </p>
          <p className="text-base text-[#4b4e52]">
            Keep the green <span className="font-semibold text-[#6aaa64]">A</span> happy to solve
            both clues.
          </p>
        </div>

        <div className="mt-10 flex w-full flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
          <div className="order-2 w-full max-w-3xl lg:order-1 lg:w-1/4 lg:max-w-none">
            <div className="grid sm:grid-cols-2 lg:grid-cols-1">
              {leftColumnWords.map((word) => (
                <button
                  key={word.id}
                  type="button"
                  className={`word-card flex flex-col items-center text-center text-base font-semibold uppercase text-[#1a1a1b] transition ${
                    word.state === 'locked' ? 'word-card--locked' : 'hover:-translate-y-0.5'
                  } ${rejectedWordId === word.id ? 'word-card--flyback' : ''} ${
                    activeDrag?.word.id === word.id ? 'opacity-60' : ''
                  }`}
                  onPointerDown={handlePointerDown(word)}
                  aria-label={`Drag word ${word.word}`}
                >
                  <div className="flex items-center justify-center gap-1">
                    {word.word
                      .toUpperCase()
                      .split('')
                      .map((letter, index) => (
                        <span key={`${word.id}-${index}`} className="word-chip-letter">
                          {letter}
                        </span>
                      ))}
                  </div>
                  <span className="text-xs font-semibold uppercase text-[#8c8f94]">&nbsp;</span>
                </button>
              ))}
            </div>
          </div>

          <div className="order-1 flex w-full max-w-4xl flex-col items-center gap-8 lg:order-2 lg:w-auto lg:max-w-none">
            <GameField
              ref={boardRef}
              level={TUTORIAL_LEVEL}
              committedLetters={committedLetters}
              overlay={overlay}
              activeDirection={activeDrag?.targetDirection ?? null}
            />
          </div>

          <div className="order-3 w-full max-w-3xl lg:order-3 lg:w-1/4 lg:max-w-none">
            <div className="grid  sm:grid-cols-2 lg:grid-cols-1">
              {rightColumnWords.map((word) => (
                <button
                  key={word.id}
                  type="button"
                  className={`word-card flex flex-col items-center text-center text-base font-semibold uppercase text-[#1a1a1b] transition ${
                    word.state === 'locked' ? 'word-card--locked' : 'hover:-translate-y-0.5'
                  } ${rejectedWordId === word.id ? 'word-card--flyback' : ''} ${
                    activeDrag?.word.id === word.id ? 'opacity-60' : ''
                  }`}
                  onPointerDown={handlePointerDown(word)}
                  aria-label={`Drag word ${word.word}`}
                >
                  <div className="flex items-center justify-center gap-1">
                    {word.word
                      .toUpperCase()
                      .split('')
                      .map((letter, index) => (
                        <span key={`${word.id}-${index}`} className="word-chip-letter">
                          {letter}
                        </span>
                      ))}
                  </div>
                  <span className="text-xs font-semibold uppercase text-[#8c8f94]">&nbsp;</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            <DirectionCard title="Across" {...acrossCardProps} />
            <DirectionCard title="Down" {...downCardProps} />
          </div>
        </div>

        {(isComplete || highlightedDirection) && (
          <div className="w-full max-w-3xl rounded-2xl border border-[#e2e5ea] bg-[#f8f8f4] px-5 py-4 text-sm text-[#4b4e52]">
            {isComplete
              ? 'Great! Every cell is filled and the board checks out. Celebrate the win and jump to what comes next from the modal.'
              : `Release to try placing ${activeDrag?.word.word.toUpperCase()} ${
                  highlightedDirection === 'across' ? 'across the row' : 'down the column'
                }.`}
          </div>
        )}
        <div className="w-full max-w-5xl text-center text-xs text-[#a1a5ad] lg:hidden">
          <p>Need more space? Rotate your device or play on a larger screen.</p>
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
      {isComplete ? (
        <TutorialCompletionModal
          nextLevel={nextLevel ?? null}
          onExit={onExit}
          onNextLevel={onNextLevel}
        />
      ) : null}
    </section>
  );
};

export default TutorialScreen;
