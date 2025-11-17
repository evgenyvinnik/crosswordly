import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import GameField, { Direction, GameLevel, GameLevelWord, OverlayState } from './GameField';
import DirectionCard from './DirectionCard';
import WordCard from './WordCard';
import GameCompletionModal from './GameCompletionModal';
import { getCellKey } from '../../lib/gridUtils';
import { type GameWord, getRandomWordBank } from '../gameScreenUtils';
const GAME_SCREEN_SECTION_STYLE =
  'relative flex min-h-screen items-center justify-center bg-[#f6f5f0] px-2 py-4 text-[#1a1a1b] sm:px-4 sm:py-10';
const GAME_SCREEN_PANEL_STYLE =
  'relative w-full max-w-5xl rounded-[20px] border border-[#e2e5ea] bg-white/95 px-3 py-6 text-center shadow-[0_24px_80px_rgba(149,157,165,0.35)] backdrop-blur sm:rounded-[32px] sm:px-6 sm:py-10';
const GAME_SCREEN_ACTIONS_STYLE = 'absolute inset-x-3 top-3 z-10 sm:inset-x-6 sm:top-6';
const GAME_SCREEN_LAYOUT_STYLE =
  'mt-8 flex w-full flex-col items-center gap-4 sm:gap-6 lg:mt-10 lg:flex-row lg:items-start lg:justify-center lg:gap-8';
const GAME_SCREEN_BOARD_COLUMN_STYLE =
  'order-1 flex w-full max-w-4xl flex-col items-center gap-4 sm:gap-8 lg:order-2 lg:w-auto lg:max-w-none';
const GAME_SCREEN_DRAG_PREVIEW_STYLE =
  'pointer-events-none fixed z-50 flex -translate-x-1/2 -translate-y-1/2 items-center rounded-full bg-white px-6 py-3 text-lg font-semibold uppercase text-[#1a1a1b] shadow-[0_12px_30px_rgba(0,0,0,0.2)]';

type GameScreenProps = {
  level: GameLevel;
  onComplete?: () => void;
  onExit?: () => void;
  topRightActions: ReactNode;
  header?: ReactNode;
  levelTitle?: string;
};

type DragState = {
  word: GameWord;
  pointerId: number;
  current: { x: number; y: number };
  targetDirection: Direction | null;
  targetPlacementId: GameLevelWord['id'] | null;
};

type PlacedWord = {
  bankIndex: number;
  word: string;
  definition?: string;
  clueNumber?: number;
  placementId: string | number;
  direction: Direction;
  wordId: string | number;
};

const getPlacementKey = (placementId: GameLevelWord['id']) => placementId.toString();

const buildEmptyPlacementState = (words: GameLevelWord[]): Record<string, PlacedWord | null> =>
  words.reduce(
    (acc, word) => {
      acc[getPlacementKey(word.id)] = null;
      return acc;
    },
    {} as Record<string, PlacedWord | null>,
  );

const GameScreen = ({
  level,
  onComplete,
  onExit,
  topRightActions,
  header,
  levelTitle,
}: GameScreenProps) => {
  const { t } = useTranslation();
  const boardRef = useRef<HTMLDivElement>(null);
  const [wordBank, setWordBank] = useState<GameWord[]>(() => getRandomWordBank(level));
  const [committedLetters, setCommittedLetters] = useState<Record<string, string>>(() => ({
    ...(level.prefilledLetters ?? {}),
  }));
  const [activeDrag, setActiveDrag] = useState<DragState | null>(null);
  const [selectedWord, setSelectedWord] = useState<GameWord | null>(null);
  const [failedOverlay, setFailedOverlay] = useState<OverlayState | null>(null);
  const [rejectedWordId, setRejectedWordId] = useState<string | number | null>(null);
  const [placedWords, setPlacedWords] = useState<Record<string, PlacedWord | null>>(() =>
    buildEmptyPlacementState(level.words),
  );
  const completionReportedRef = useRef(false);
  const confettiTriggeredRef = useRef(false);
  const megaConfettiTriggeredRef = useRef(false);
  const previousLevelIdRef = useRef(level.id);

  useEffect(() => {
    if (previousLevelIdRef.current === level.id) {
      return;
    }
    previousLevelIdRef.current = level.id;
    setWordBank(getRandomWordBank(level));
    setCommittedLetters({ ...(level.prefilledLetters ?? {}) });
    setActiveDrag(null);
    setSelectedWord(null);
    setFailedOverlay(null);
    setRejectedWordId(null);
    setPlacedWords(buildEmptyPlacementState(level.words));
    completionReportedRef.current = false;
    confettiTriggeredRef.current = false;
    megaConfettiTriggeredRef.current = false;
  }, [level]);

  const placementsById = useMemo(() => {
    const map = new Map<string, GameLevelWord>();
    level.words.forEach((word) => {
      map.set(getPlacementKey(word.id), word);
    });
    return map;
  }, [level.words]);

  const placementsByDirection = useMemo<Record<Direction, GameLevelWord[]>>(() => {
    const map: Record<Direction, GameLevelWord[]> = { across: [], down: [] };
    level.words.forEach((word) => {
      map[word.direction].push(word);
    });
    return map;
  }, [level.words]);

  const cellPlacementIds = useMemo(() => {
    const map = new Map<string, string[]>();
    level.words.forEach((word) => {
      word.word.split('').forEach((_, index) => {
        const row = word.startRow + (word.direction === 'down' ? index : 0);
        const col = word.startCol + (word.direction === 'across' ? index : 0);
        const key = getCellKey(row, col);
        const existing = map.get(key) ?? [];
        if (!existing.includes(getPlacementKey(word.id))) {
          existing.push(getPlacementKey(word.id));
          map.set(key, existing);
        }
      });
    });
    return map;
  }, [level.words]);

  const buildCommittedLetters = useCallback(
    (placementsState: Record<string, PlacedWord | null>) => {
      const base: Record<string, string> = {
        ...(level.prefilledLetters ?? {}),
      };
      Object.entries(placementsState).forEach(([placementKey, entry]) => {
        if (!entry) {
          return;
        }
        const placement = placementsById.get(placementKey);
        if (!placement) {
          return;
        }
        entry.word.split('').forEach((letter, index) => {
          const row = placement.startRow + (placement.direction === 'down' ? index : 0);
          const col = placement.startCol + (placement.direction === 'across' ? index : 0);
          base[getCellKey(row, col)] = letter;
        });
      });
      return base;
    },
    [placementsById, level.prefilledLetters],
  );

  const playableCellKeys = useMemo(() => {
    const set = new Set<string>();
    level.words.forEach((word) => {
      word.word.split('').forEach((_, index) => {
        const row = word.startRow + (word.direction === 'down' ? index : 0);
        const col = word.startCol + (word.direction === 'across' ? index : 0);
        set.add(getCellKey(row, col));
      });
    });
    return Array.from(set);
  }, [level.words]);

  const isComplete = useMemo(
    () =>
      playableCellKeys.every((key) =>
        Boolean(committedLetters[key] ?? level.prefilledLetters?.[key]),
      ),
    [committedLetters, playableCellKeys, level.prefilledLetters],
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
    if (!isComplete || megaConfettiTriggeredRef.current) {
      return;
    }
    megaConfettiTriggeredRef.current = true;
    const defaults = { spread: 360, ticks: 160, gravity: 0.8, startVelocity: 55, scalar: 1.1 };
    confetti({ ...defaults, particleCount: 200, origin: { x: 0.2, y: 0.2 } });
    confetti({ ...defaults, particleCount: 220, origin: { x: 0.8, y: 0.25 } });
    confetti({ ...defaults, particleCount: 240, origin: { x: 0.5, y: 0.35 } });
  }, [isComplete]);

  const computeDropTarget = useCallback(
    (clientX: number, clientY: number): GameLevelWord | null => {
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

      const cellWidth = rect.width / level.grid.width;
      const cellHeight = rect.height / level.grid.height;
      const colIndex = Math.min(
        level.grid.width - 1,
        Math.max(0, Math.floor((clientX - rect.left) / cellWidth)),
      );
      const rowIndex = Math.min(
        level.grid.height - 1,
        Math.max(0, Math.floor((clientY - rect.top) / cellHeight)),
      );
      const cellKey = getCellKey(rowIndex, colIndex);
      const placementIdsAtCell = cellPlacementIds.get(cellKey);
      if (!placementIdsAtCell?.length) {
        return null;
      }

      if (placementIdsAtCell.length === 1) {
        const placement = placementsById.get(placementIdsAtCell[0]);
        return placement ?? null;
      }

      const cellCenterX = rect.left + (colIndex + 0.5) * cellWidth;
      const cellCenterY = rect.top + (rowIndex + 0.5) * cellHeight;
      let bestPlacement: GameLevelWord | null = null;
      let bestDistance = Number.POSITIVE_INFINITY;

      placementIdsAtCell.forEach((placementId) => {
        const placement = placementsById.get(placementId);
        if (!placement) {
          return;
        }
        const axisDistance =
          placement.direction === 'across'
            ? Math.abs(clientY - cellCenterY)
            : Math.abs(clientX - cellCenterX);
        if (axisDistance < bestDistance) {
          bestDistance = axisDistance;
          bestPlacement = placement;
        }
      });

      return bestPlacement;
    },
    [cellPlacementIds, level.grid.height, level.grid.width, placementsById],
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
    (word: GameWord, placementId: GameLevelWord['id'] | null) => {
      if (!placementId) {
        return;
      }

      const placementKey = getPlacementKey(placementId);
      const placement = placementsById.get(placementKey);
      if (!placement) {
        return;
      }

      const direction = placement.direction;
      const candidateLetters = word.word.split('');
      const placementLength = placement.word.length;
      const mismatchedIndices: number[] = [];
      const previousEntry = placedWords[placementKey];
      const validationLetters =
        previousEntry !== null && previousEntry !== undefined
          ? buildCommittedLetters({ ...placedWords, [placementKey]: null })
          : committedLetters;

      placement.word.split('').forEach((_, index) => {
        const letter = candidateLetters[index];
        const row = placement.startRow + (direction === 'down' ? index : 0);
        const col = placement.startCol + (direction === 'across' ? index : 0);
        const key = getCellKey(row, col);
        const requiredSource = level.prefilledLetters?.[key] ?? validationLetters[key] ?? '';
        const required = requiredSource;

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
        if (previousEntry) {
          setPlacedWords((prev) => {
            if (!prev[placementKey]) {
              return prev;
            }
            const next = { ...prev, [placementKey]: null };
            setCommittedLetters(buildCommittedLetters(next));
            return next;
          });
          setWordBank((prev) =>
            prev.map((entry) =>
              entry.id === previousEntry.wordId
                ? { ...entry, state: 'idle', direction: undefined, placementId: undefined }
                : entry,
            ),
          );
        }

        setFailedOverlay({
          direction,
          placementId,
          letters: candidateLetters,
          status: 'error',
          mismatchedIndices,
        });
        setRejectedWordId(word.id);
        return;
      }

      setWordBank((prev) =>
        prev.map((entry) =>
          entry.id === word.id ? { ...entry, state: 'locked', direction, placementId } : entry,
        ),
      );
      setPlacedWords((prev) => {
        const previousEntry = prev[placementKey];
        if (previousEntry && previousEntry.wordId !== word.id) {
          setWordBank((bank) =>
            bank.map((entry) =>
              entry.id === previousEntry.wordId
                ? { ...entry, state: 'idle', direction: undefined, placementId: undefined }
                : entry,
            ),
          );
        }
        const next = {
          ...prev,
          [placementKey]: {
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
    [placementsById, buildCommittedLetters, committedLetters, level.prefilledLetters, placedWords],
  );

  const releaseWord = useCallback(
    (word: GameWord) => {
      if (word.state !== 'locked' || !word.placementId) {
        return;
      }

      const placementKey = getPlacementKey(word.placementId);
      setPlacedWords((prev) => {
        if (!prev[placementKey]) {
          return prev;
        }
        const next = { ...prev, [placementKey]: null };
        setCommittedLetters(buildCommittedLetters(next));
        return next;
      });

      setWordBank((prev) =>
        prev.map((entry) =>
          entry.id === word.id
            ? { ...entry, state: 'idle', direction: undefined, placementId: undefined }
            : entry,
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
      const placement = computeDropTarget(event.clientX, event.clientY);
      setActiveDrag((prev) =>
        prev
          ? {
              ...prev,
              current: { x: event.clientX, y: event.clientY },
              targetDirection: placement?.direction ?? null,
              targetPlacementId: placement?.id ?? null,
            }
          : prev,
      );
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerId !== activeDrag.pointerId) return;
      event.preventDefault();
      setActiveDrag((prev) => {
        if (!prev) return null;
        const dropPlacementId = prev.targetPlacementId;
        finishAttempt(prev.word, dropPlacementId);
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
    if (activeDrag?.targetPlacementId && activeDrag.word) {
      const placementKey = getPlacementKey(activeDrag.targetPlacementId);
      const placement = placementsById.get(placementKey);
      return {
        direction: placement?.direction ?? activeDrag.targetDirection ?? 'across',
        placementId: activeDrag.targetPlacementId,
        letters: activeDrag.word.word.split(''),
        status: 'preview',
      };
    }
    return null;
  }, [activeDrag, failedOverlay, placementsById]);

  const [leftColumnWords, rightColumnWords] = useMemo(() => {
    const midpoint = Math.ceil(wordBank.length / 2);
    return [wordBank.slice(0, midpoint), wordBank.slice(midpoint)];
  }, [wordBank]);

  const buildDirectionCardProps = (direction: Direction) => {
    const placements = [...placementsByDirection[direction]].sort((a, b) => {
      const aNum = a.clueNumber ?? Number.MAX_SAFE_INTEGER;
      const bNum = b.clueNumber ?? Number.MAX_SAFE_INTEGER;
      if (aNum !== bNum) {
        return aNum - bNum;
      }
      return getPlacementKey(a.id).localeCompare(getPlacementKey(b.id));
    });
    const entries = placements.map((placement) => {
      const placementKey = getPlacementKey(placement.id);
      const entry = placedWords[placementKey];
      return {
        key: placement.id,
        clueNumber: placement.clueNumber,
        isCompleted: Boolean(entry),
        description: entry?.definition,
      };
    });
    const isHighlighted = highlightedDirection === direction;
    return {
      entries,
      isHighlighted,
    };
  };

  const acrossCardProps = buildDirectionCardProps('across');
  const downCardProps = buildDirectionCardProps('down');

  const handleWordTap = (word: GameWord) => () => {
    if (failedOverlay || activeDrag) {
      return;
    }

    if (word.state === 'locked') {
      releaseWord(word);
      setSelectedWord(null);
      return;
    }

    // Toggle selection
    if (selectedWord?.id === word.id) {
      setSelectedWord(null);
    } else {
      setSelectedWord(word);
    }
  };

  const handlePointerDown = (word: GameWord) => (event: React.PointerEvent<HTMLButtonElement>) => {
    if (failedOverlay) {
      return;
    }

    // Disable dragging on touch devices (mobile)
    if (event.pointerType === 'touch') {
      return;
    }

    event.preventDefault();

    // Clear any selected word when starting a drag
    setSelectedWord(null);

    if (word.state === 'locked') {
      releaseWord(word);
    }
    setActiveDrag({
      word,
      pointerId: event.pointerId,
      current: { x: event.clientX, y: event.clientY },
      targetDirection: null,
      targetPlacementId: null,
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

      // If we have a selected word (tap mode), try to place it
      if (selectedWord) {
        const placementsAtCell = cellPlacementIds.get(cellKey);
        if (placementsAtCell?.length) {
          // Find the best placement based on where the user tapped
          const placement = computeDropTarget(event.clientX, event.clientY);
          if (placement) {
            finishAttempt(selectedWord, placement.id);
            setSelectedWord(null);
          }
        }
        return;
      }

      const placementsAtCell = cellPlacementIds.get(cellKey);
      if (!placementsAtCell?.length) {
        return;
      }

      // Disable drag-from-board on touch devices
      if (event.pointerType === 'touch') {
        return;
      }

      const placementToRelease = placementsAtCell.find((id) => placedWords[id]);
      if (!placementToRelease) {
        return;
      }

      const lockedWord = wordBank.find(
        (entry) =>
          entry.state === 'locked' &&
          entry.placementId !== undefined &&
          getPlacementKey(entry.placementId) === placementToRelease,
      );
      if (!lockedWord) {
        return;
      }

      const lockedPlacementId = lockedWord.placementId;
      const lockedDirection = lockedWord.direction;
      event.preventDefault();
      releaseWord(lockedWord);
      setActiveDrag({
        word: lockedWord,
        pointerId: event.pointerId,
        current: { x: event.clientX, y: event.clientY },
        targetDirection: lockedDirection ?? null,
        targetPlacementId: lockedPlacementId ?? null,
      });
    };

    boardElement.addEventListener('pointerdown', handleBoardPointerDown);

    return () => {
      boardElement.removeEventListener('pointerdown', handleBoardPointerDown);
    };
  }, [
    activeDrag,
    cellPlacementIds,
    failedOverlay,
    placedWords,
    releaseWord,
    wordBank,
    selectedWord,
    computeDropTarget,
    finishAttempt,
  ]);

  return (
    <section className={GAME_SCREEN_SECTION_STYLE}>
      <div className={GAME_SCREEN_PANEL_STYLE}>
        <div className={GAME_SCREEN_ACTIONS_STYLE}>
          <div className="mx-auto max-w-5xl">{topRightActions}</div>
        </div>
        {header ?? null}

        <div className={GAME_SCREEN_LAYOUT_STYLE}>
          <div className="order-2 w-full max-w-3xl lg:order-1 lg:w-1/4 lg:max-w-none">
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-1">
              {leftColumnWords.map((word) => (
                <WordCard
                  key={word.id}
                  word={word}
                  isActive={activeDrag?.word.id === word.id}
                  isSelected={selectedWord?.id === word.id}
                  isRejected={rejectedWordId === word.id}
                  onPointerDown={handlePointerDown(word)}
                  onClick={handleWordTap(word)}
                />
              ))}
            </div>
          </div>

          <div className={GAME_SCREEN_BOARD_COLUMN_STYLE}>
            <GameField
              ref={boardRef}
              level={level}
              committedLetters={committedLetters}
              overlay={overlay}
              activeDirection={activeDrag?.targetDirection ?? null}
            />
          </div>

          <div className="order-3 w-full max-w-3xl lg:order-3 lg:w-1/4 lg:max-w-none">
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-1">
              {rightColumnWords.map((word) => (
                <WordCard
                  key={word.id}
                  word={word}
                  isActive={activeDrag?.word.id === word.id}
                  isSelected={selectedWord?.id === word.id}
                  isRejected={rejectedWordId === word.id}
                  onPointerDown={handlePointerDown(word)}
                  onClick={handleWordTap(word)}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 w-full sm:mt-6">
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-2">
            <DirectionCard title={t('game.across')} {...acrossCardProps} />
            <DirectionCard title={t('game.down')} {...downCardProps} />
          </div>
        </div>
      </div>

      {activeDrag ? (
        <div
          className={GAME_SCREEN_DRAG_PREVIEW_STYLE}
          style={{ left: activeDrag.current.x, top: activeDrag.current.y }}
        >
          {activeDrag.word.word}
        </div>
      ) : null}
      {isComplete ? (
        <GameCompletionModal
          onExit={onExit}
          level={level}
          committedLetters={committedLetters}
          placedWords={placedWords}
          levelTitle={levelTitle}
        />
      ) : null}
    </section>
  );
};

export default GameScreen;
