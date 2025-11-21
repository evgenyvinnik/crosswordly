import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { trackGameLevelStart, trackGameLevelComplete } from '../../lib/analytics';
import GameField, { Direction, GameLevel, GameLevelWord, OverlayState } from './GameField';
import { getCellKey } from '../../lib/gridUtils';
import { type GameWord, getRandomWordBank } from './gameScreenUtils';
import { useConfettiOnComplete } from './useConfetti';
import { useAutoReset } from './useAutoReset';
import { isSearchEngineBot } from '../../lib/userAgent';
import { SkipLinks } from '../shared/SkipLinks';
import {
  type PlacedWord,
  getPlacementKey,
  buildEmptyPlacementState,
  buildCommittedLetters,
} from './wordPlacementUtils';
import WordBankColumn from './WordBankColumn';
import ClueCards from './ClueCards';
import { TutorialExtras, TutorialFaq } from './TutorialComponents';
import KeyboardHelpBanner from './KeyboardHelpBanner';
import DragPreview, { type DragState } from './DragPreview';
import CompletionModalWrapper from './CompletionModalWrapper';
import { useBoardPointerInteractions } from '../../hooks/useBoardPointerInteractions';
import { useKeyboardPlacementShortcuts } from '../../hooks/useKeyboardPlacementShortcuts';

const GAME_SCREEN_PANEL_STYLE =
  'relative w-full max-w-5xl rounded-[20px] border border-[#e2e5ea] bg-white/95 px-2 py-4 text-center shadow-[0_24px_80px_rgba(149,157,165,0.35)] backdrop-blur sm:rounded-[32px] sm:px-3 sm:py-4';
const GAME_SCREEN_ACTIONS_STYLE = 'absolute inset-x-2 top-2 z-10 sm:inset-x-3 sm:top-3';
const GAME_SCREEN_LAYOUT_STYLE =
  'mt-6 flex w-full flex-col items-center gap-3 sm:gap-3 lg:mt-4 lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-start lg:justify-center lg:gap-4';
const GAME_SCREEN_BOARD_COLUMN_STYLE =
  'order-1 flex w-full max-w-4xl flex-col items-center gap-3 sm:gap-4 lg:order-none lg:col-start-2 lg:row-start-1 lg:w-auto lg:max-w-none lg:justify-self-center';

type GameScreenProps = {
  level: GameLevel;
  onComplete?: () => void;
  onExit?: () => void;
  topRightActions: ReactNode;
  header?: ReactNode;
  levelTitle?: string;
};

/**
 * Main game screen component.
 * Orchestrates the game state, including word bank, board interactions, drag-and-drop,
 * and game completion logic.
 *
 * @param props - Component properties
 * @param props.level - The game level configuration
 * @param props.onComplete - Callback when the level is completed
 * @param props.onExit - Callback when the user exits the level
 * @param props.topRightActions - React node for actions in the top right corner (e.g., settings)
 * @param props.header - Optional header content
 * @param props.levelTitle - Title of the current level
 */
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
  const [isBot] = useState(() => isSearchEngineBot());
  const isTutorial = level.id === 'tutorial';
  const [committedLetters, setCommittedLetters] = useState<Record<string, string>>(() => ({
    ...(level.prefilledLetters ?? {}),
  }));
  const [activeDrag, setActiveDrag] = useState<DragState | null>(null);
  const [selectedWord, setSelectedWord] = useState<GameWord | null>(null);
  const [focusedWordSlot, setFocusedWordSlot] = useState<GameLevelWord['id'] | null>(null);
  const [failedOverlay, setFailedOverlay] = useState<OverlayState | null>(null);
  const [rejectedWordId, setRejectedWordId] = useState<string | number | null>(null);
  const [placedWords, setPlacedWords] = useState<Record<string, PlacedWord | null>>(() =>
    buildEmptyPlacementState(level.words),
  );
  const completionReportedRef = useRef(false);
  const previousLevelIdRef = useRef(level.id);
  const trackingReportedRef = useRef(false);

  // Track when level starts
  useEffect(() => {
    if (!trackingReportedRef.current) {
      trackGameLevelStart(level.id);
      trackingReportedRef.current = true;
    }
  }, [level.id]);

  useEffect(() => {
    if (previousLevelIdRef.current === level.id) {
      return;
    }
    previousLevelIdRef.current = level.id;
    trackingReportedRef.current = false;
    setWordBank(getRandomWordBank(level));
    setCommittedLetters({ ...(level.prefilledLetters ?? {}) });
    setActiveDrag(null);
    setSelectedWord(null);
    setFailedOverlay(null);
    setRejectedWordId(null);
    setPlacedWords(buildEmptyPlacementState(level.words));
    completionReportedRef.current = false;
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

  const buildCommittedLettersForState = useCallback(
    (placementsState: Record<string, PlacedWord | null>) => {
      return buildCommittedLetters(placementsState, placementsById, level.prefilledLetters);
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

  // Trigger confetti when puzzle is completed
  useConfettiOnComplete(isComplete);

  // Auto-reset error states after timeout
  useAutoReset(failedOverlay, null, setFailedOverlay, 900);
  useAutoReset(rejectedWordId, null, setRejectedWordId, 600);

  // Report completion once
  useEffect(() => {
    if (!isComplete || completionReportedRef.current) {
      return;
    }
    completionReportedRef.current = true;
    trackGameLevelComplete(level.id, level.words.length);
    onComplete?.();
  }, [isComplete, onComplete, level.id, level.words.length]);

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
          ? buildCommittedLettersForState({ ...placedWords, [placementKey]: null })
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
            setCommittedLetters(buildCommittedLettersForState(next));
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
        setCommittedLetters(buildCommittedLettersForState(next));
        return next;
      });
    },
    [
      placementsById,
      buildCommittedLettersForState,
      committedLetters,
      level.prefilledLetters,
      placedWords,
    ],
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
        setCommittedLetters(buildCommittedLettersForState(next));
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
    [buildCommittedLettersForState],
  );

  const attemptTapPlacement = useCallback(
    (event: PointerEvent, cellKey: string) => {
      if (!selectedWord) {
        return;
      }

      const placementsAtCell = cellPlacementIds.get(cellKey);
      if (!placementsAtCell?.length) {
        return;
      }

      const placement = computeDropTarget(event.clientX, event.clientY);
      if (!placement) {
        return;
      }

      finishAttempt(selectedWord, placement.id);
      setSelectedWord(null);
    },
    [selectedWord, cellPlacementIds, computeDropTarget, finishAttempt],
  );

  const startBoardDrag = useCallback(
    (event: PointerEvent, cellKey: string) => {
      const placementsAtCell = cellPlacementIds.get(cellKey);
      if (!placementsAtCell?.length || event.pointerType === 'touch') {
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
    },
    [cellPlacementIds, placedWords, wordBank, releaseWord, setActiveDrag],
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

  const clearSelection = useCallback(() => {
    setSelectedWord(null);
    setFocusedWordSlot(null);
  }, []);

  useBoardPointerInteractions({
    boardRef,
    activeDrag,
    failedOverlay,
    selectedWord,
    attemptTapPlacement,
    startBoardDrag,
  });

  useKeyboardPlacementShortcuts({
    activeDrag,
    failedOverlay,
    selectedWord,
    focusedWordSlot,
    finishAttempt,
    clearSelection,
  });

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-start bg-[#f6f5f0] px-1 py-2 text-[#1a1a1b] sm:px-2 sm:py-4">
      <SkipLinks />
      <div className={GAME_SCREEN_PANEL_STYLE}>
        <div className={GAME_SCREEN_ACTIONS_STYLE}>
          <div className="mx-auto max-w-5xl">{topRightActions}</div>
        </div>
        <TutorialExtras isTutorial={isTutorial} isBot={isBot} />
        {header ?? null}

        <div className={GAME_SCREEN_LAYOUT_STYLE}>
          <div className="order-2 w-full lg:order-none lg:col-start-1 lg:row-start-1 lg:w-auto lg:justify-self-end lg:ml-8">
            <WordBankColumn
              words={leftColumnWords}
              activeDragWordId={activeDrag?.word.id ?? null}
              selectedWordId={selectedWord?.id ?? null}
              rejectedWordId={rejectedWordId}
              onPointerDown={handlePointerDown}
              onClick={handleWordTap}
              ariaLabel={t('accessibility.availableWords')}
            />
          </div>

          <main id="main-content" className={GAME_SCREEN_BOARD_COLUMN_STYLE}>
            <GameField
              ref={boardRef}
              level={level}
              committedLetters={committedLetters}
              overlay={overlay}
              activeDirection={activeDrag?.targetDirection ?? null}
              focusedWordId={focusedWordSlot}
              onWordFocus={setFocusedWordSlot}
            />
            <KeyboardHelpBanner selectedWord={selectedWord} focusedWordSlot={focusedWordSlot} />
          </main>

          <div className="order-2 w-full lg:order-none lg:col-start-3 lg:row-start-1 lg:w-auto lg:justify-self-start lg:mr-8">
            <WordBankColumn
              words={rightColumnWords}
              activeDragWordId={activeDrag?.word.id ?? null}
              selectedWordId={selectedWord?.id ?? null}
              rejectedWordId={rejectedWordId}
              onPointerDown={handlePointerDown}
              onClick={handleWordTap}
              ariaLabel={t('accessibility.additionalWords')}
            />
          </div>
        </div>
        <ClueCards
          placementsByDirection={placementsByDirection}
          placedWords={placedWords}
          highlightedDirection={highlightedDirection}
        />
        <TutorialFaq isTutorial={isTutorial} isBot={isBot} />
      </div>

      <DragPreview activeDrag={activeDrag} />
      <CompletionModalWrapper
        isComplete={isComplete}
        level={level}
        placedWords={placedWords}
        committedLetters={committedLetters}
        levelTitle={levelTitle}
        onExit={onExit}
      />
    </section>
  );
};

export default GameScreen;
