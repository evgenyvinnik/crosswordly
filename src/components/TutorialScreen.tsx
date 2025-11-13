import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import GameField, { Direction, GameLevelWord, OverlayState } from './GameField';
import CloseIcon from './icons/CloseIcon';
import { TooltipEnvelope } from './tooltip/Tooltip';
import { GUESS_WORDS } from '../words/words';
import { TUTORIAL_LEVEL } from '../levels/tutorial';

const WORD_DEFINITIONS = GUESS_WORDS.reduce<Record<string, string | undefined>>((acc, entry) => {
  acc[entry.word.toLowerCase()] = entry.definition;
  return acc;
}, {});

const WORD_BANK_SIZE = 16;

type TutorialScreenProps = {
  onComplete?: () => void;
  onExit?: () => void;
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

type AnchorPoint = { x: number; y: number };

const pointsEqual = (a: AnchorPoint | null, b: AnchorPoint | null) => {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5;
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

const TutorialScreen = ({ onComplete, onExit }: TutorialScreenProps) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const firstTileRef = useRef<HTMLButtonElement | null>(null);
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
  const [anchorPoints, setAnchorPoints] = useState<{ tiles: AnchorPoint | null; letter: AnchorPoint | null }>({
    tiles: null,
    letter: null,
  });

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

  const updateAnchorPoints = useCallback(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }
    const containerRect = section.getBoundingClientRect();

    const tileRect = firstTileRef.current?.getBoundingClientRect() ?? null;
    const letterElement =
      boardRef.current?.querySelector<HTMLElement>('[data-letter-anchor="tutorial-a"]') ?? null;
    const letterRect = letterElement?.getBoundingClientRect() ?? null;

    const rectToPoint = (rect: DOMRect | null): AnchorPoint | null => {
      if (!rect) {
        return null;
      }
      return {
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + rect.height / 2,
      };
    };

    const next = {
      tiles: rectToPoint(tileRect),
      letter: rectToPoint(letterRect),
    };

    setAnchorPoints((prev) => {
      if (pointsEqual(prev.tiles, next.tiles) && pointsEqual(prev.letter, next.letter)) {
        return prev;
      }
      return next;
    });
  }, []);

  const setFirstTileButtonRef = useCallback(
    (node: HTMLButtonElement | null) => {
      firstTileRef.current = node;
      updateAnchorPoints();
    },
    [updateAnchorPoints],
  );

  const getAnchorStyle = useCallback(
    (anchor: AnchorPoint | null): CSSProperties => {
      if (!anchor) {
        return { display: 'none' };
      }
      return {
        left: `${anchor.x}px`,
        top: `${anchor.y}px`,
        transform: 'translate(-50%, -50%)',
      };
    },
    [],
  );

  useLayoutEffect(() => {
    updateAnchorPoints();
  }, [updateAnchorPoints, wordBank, committedLetters]);

  useEffect(() => {
    const handleResize = () => {
      updateAnchorPoints();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateAnchorPoints]);

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
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center bg-[#f6f5f0] px-4 py-10 text-[#1a1a1b]"
    >
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <TooltipEnvelope
          tooltip="Drag a word tile, line it up with the highlighted row or column, and let go."
          forceVisible={Boolean(anchorPoints.tiles)}
          targetClassName="pointer-events-none absolute h-3 w-3"
          targetStyle={getAnchorStyle(anchorPoints.tiles)}
          tooltipClassName="pointer-events-none hidden max-w-sm text-base font-medium tracking-tight lg:flex"
        >
          <span className="sr-only">Tiles tooltip anchor</span>
        </TooltipEnvelope>
        <TooltipEnvelope
          tooltip={
            <>
              Keep the green <span className="font-semibold text-[#6aaa64]">A</span> happy to solve both
              clues.
            </>
          }
          forceVisible={Boolean(anchorPoints.letter)}
          targetClassName="pointer-events-none absolute h-3 w-3"
          targetStyle={getAnchorStyle(anchorPoints.letter)}
          tooltipClassName="pointer-events-none hidden max-w-sm text-base font-medium tracking-tight lg:flex"
        >
          <span className="sr-only">Board tooltip anchor</span>
        </TooltipEnvelope>
      </div>
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
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#8c8f94]">
            Tutorial
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-[#1a1a1b] sm:text-4xl">
            Learn the basics
          </h1>
          <p className="text-base text-[#4b4e52] lg:hidden">
            Drag a word tile, line it up with the highlighted row or column, and let go. Keep the
            green <span className="font-semibold text-[#6aaa64]">A</span> happy to solve both clues.
          </p>
        </div>

        <div className="mt-10 flex w-full flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
          <div className="order-2 w-full max-w-3xl lg:order-1 lg:w-1/4 lg:max-w-none">
            <div className="grid sm:grid-cols-2 lg:grid-cols-1">
              {leftColumnWords.map((word, index) => (
                <button
                  key={word.id}
                  type="button"
                  ref={index === 0 ? setFirstTileButtonRef : undefined}
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
            {(['across', 'down'] as Direction[]).map((directionKey) => {
              const isHighlighted = highlightedDirection === directionKey;
              const activeWord = isHighlighted ? activeDrag?.word : null;
              const description = activeWord?.definition;
              const completedEntry = placedWords[directionKey];
              return (
                <div
                  key={directionKey}
                  className={`rounded-2xl border px-4 py-5 text-left transition ${
                    isHighlighted ? 'border-[#6aaa64] bg-[#f4faf3]' : 'border-[#e2e5ea] bg-white'
                  }`}
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#1a1a1b]">
                    {directionKey === 'across' ? 'Across' : 'Down'}
                  </p>
                  <div className="mt-4 space-y-3">
                    {completedEntry ? (
                      <p className="text-base leading-relaxed text-[#1f2124]">
                        <span className="mr-2 font-semibold text-[#1a1a1b]">
                          {completedEntry.clueNumber ??
                            (directionKey === 'across'
                              ? (placementsByDirection.across?.clueNumber ?? 1)
                              : (placementsByDirection.down?.clueNumber ?? 2))}
                          .
                        </span>
                        {completedEntry.definition ?? 'No clue available.'}
                      </p>
                    ) : (
                      <p className="text-base text-[#9a9ea6]">Drop a word here to confirm it.</p>
                    )}
                  </div>
                  {isHighlighted && activeWord ? (
                    <div className="mt-4 rounded-xl border border-dashed border-[#d6dadf] bg-white/80 px-3 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8c8f94]">
                        Trying your tile
                      </p>
                      <p className="mt-1 text-base leading-relaxed text-[#1f2124]">
                        {description ?? 'No description available.'}
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })}
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
    </section>
  );
};

export default TutorialScreen;
