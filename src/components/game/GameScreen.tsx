import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { trackGameLevelStart, trackGameLevelComplete } from '../../utils/analytics';
import GameField, { Direction, GameLevel, GameLevelWord, OverlayState } from './GameField';
import { getCellKey } from '../../utils/gridUtils';
import { type GameWord, getRandomWordBank } from '../../utils/gameScreenUtils';
import { useConfettiOnComplete } from '../../hooks/useConfetti';
import { useAutoReset } from '../../hooks/useAutoReset';
import { isSearchEngineBot } from '../../utils/userAgent';
import { SkipLinks } from '../shared/SkipLinks';
import WordBankColumn from './WordBankColumn';
import ClueCards from './ClueCards';
import { TutorialExtras, TutorialFaq } from './TutorialComponents';
import KeyboardHelpBanner from './KeyboardHelpBanner';
import DragPreview, { getDragAimPoint } from './DragPreview';
import CompletionModalWrapper from './CompletionModalWrapper';
import { useBoardPointerInteractions } from '../../hooks/useBoardPointerInteractions';
import { useKeyboardPlacementShortcuts } from '../../hooks/useKeyboardPlacementShortcuts';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { useTouchPress } from '../../hooks/useTouchPress';
import { hapticError, hapticPlace, hapticSuccess, hapticTap } from '../../utils/nativePlatform';
import {
  type PlacedWord,
  getPlacementKey,
  buildEmptyPlacementState,
  buildCommittedLetters,
  validateWordPlacement,
} from '../../utils/wordPlacementUtils';
import {
  GAME_SCREEN_PANEL_STYLE,
  GAME_SCREEN_ACTIONS_STYLE,
  GAME_SCREEN_LAYOUT_STYLE,
  GAME_SCREEN_BOARD_COLUMN_STYLE,
  GAME_SCREEN_SECTION_STYLE,
  GAME_SCREEN_LEFT_COLUMN_STYLE,
  GAME_SCREEN_RIGHT_COLUMN_STYLE,
  GAME_SCREEN_ACTIONS_CONTAINER_STYLE,
} from '../../styles/gameStyles';

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
  const layoutRef = useRef<HTMLDivElement>(null);
  const trackTouchPress = useTouchPress(layoutRef);
  const [wordBank, setWordBank] = useState<GameWord[]>(() => getRandomWordBank(level));
  const [isBot] = useState(() => isSearchEngineBot());
  const isTutorial = level.id === 'tutorial';
  const [committedLetters, setCommittedLetters] = useState<Record<string, string>>(() => ({
    ...(level.prefilledLetters ?? {}),
  }));
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
    hapticSuccess();
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
      const previousEntry = placedWords[placementKey];
      const validationLetters =
        previousEntry !== null && previousEntry !== undefined
          ? buildCommittedLettersForState({ ...placedWords, [placementKey]: null })
          : committedLetters;

      const mismatchedIndices = validateWordPlacement(word, placement, level, validationLetters);

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
        hapticError();
        return;
      }

      hapticPlace();
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
    [placementsById, buildCommittedLettersForState, committedLetters, level, placedWords],
  );

  const { activeDrag, setActiveDrag } = useDragAndDrop({
    computeDropTarget,
    finishAttempt,
  });

  useEffect(() => {
    if (previousLevelIdRef.current !== level.id) {
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
    }

    if (!trackingReportedRef.current) {
      trackGameLevelStart(level.id);
      trackingReportedRef.current = true;
    }
  }, [level, setActiveDrag]);

  const highlightedDirection = activeDrag?.targetDirection ?? null;

  // Trigger confetti when puzzle is completed
  useConfettiOnComplete(isComplete);

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

  // Picks a word up under a finger that has been held still; it floats above the finger from now on
  const startTouchDrag = useCallback(
    (word: GameWord, pointerId: number, point: { x: number; y: number }) => {
      setSelectedWord(null);
      if (word.state === 'locked') {
        releaseWord(word);
      }
      const aim = getDragAimPoint(point, true);
      const target = computeDropTarget(aim.x, aim.y);
      hapticTap();
      setActiveDrag({
        word,
        pointerId,
        current: point,
        isTouch: true,
        targetDirection: target?.direction ?? null,
        targetPlacementId: target?.id ?? null,
      });
    },
    [releaseWord, computeDropTarget, setActiveDrag],
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

      const placeAt = ({ x, y }: { x: number; y: number }) => {
        const placement = computeDropTarget(x, y);
        if (!placement) {
          return;
        }

        finishAttempt(selectedWord, placement.id);
        setSelectedWord(null);
      };

      // On touch screens wait for the finger to lift, so a swipe that starts on the board scrolls
      if (event.pointerType === 'touch') {
        trackTouchPress(event, { onTap: placeAt });
        return;
      }

      placeAt({ x: event.clientX, y: event.clientY });
    },
    [selectedWord, cellPlacementIds, computeDropTarget, finishAttempt, trackTouchPress],
  );

  const startBoardDrag = useCallback(
    (event: PointerEvent, cellKey: string) => {
      const placementsAtCell = cellPlacementIds.get(cellKey);
      if (!placementsAtCell?.length) {
        return;
      }

      // Where an across and a down word cross, take the one whose line the pointer is closer to
      const pointedPlacement = computeDropTarget(event.clientX, event.clientY);
      const pointedKey = pointedPlacement ? getPlacementKey(pointedPlacement.id) : null;
      const placementToRelease =
        pointedKey && placedWords[pointedKey]
          ? pointedKey
          : placementsAtCell.find((id) => placedWords[id]);
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

      // On touch screens a tap sends the word back to the bank; press and hold moves it elsewhere
      if (event.pointerType === 'touch') {
        const { pointerId } = event;
        trackTouchPress(event, {
          onTap: () => {
            hapticTap();
            releaseWord(lockedWord);
          },
          onHold: (point) => startTouchDrag(lockedWord, pointerId, point),
        });
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
        isTouch: false,
        targetDirection: lockedDirection ?? null,
        targetPlacementId: lockedPlacementId ?? null,
      });
    },
    [
      cellPlacementIds,
      computeDropTarget,
      placedWords,
      wordBank,
      releaseWord,
      setActiveDrag,
      trackTouchPress,
      startTouchDrag,
    ],
  );

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

    hapticTap();

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

    // On touch screens a tap selects the word (see handleWordTap) and press and hold picks it up,
    // so swipes across the word bank still scroll the page
    if (event.pointerType === 'touch') {
      const { pointerId } = event;
      trackTouchPress(event.nativeEvent, {
        onHold: (point) => startTouchDrag(word, pointerId, point),
      });
      return;
    }

    // Clicking a placed word sends it back to the bank (see handleWordTap); it is dragged from the
    // board instead
    if (word.state === 'locked') {
      return;
    }

    event.preventDefault();

    // Clear any selected word when starting a drag
    setSelectedWord(null);

    setActiveDrag({
      word,
      pointerId: event.pointerId,
      current: { x: event.clientX, y: event.clientY },
      isTouch: false,
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
    <section className={GAME_SCREEN_SECTION_STYLE}>
      <SkipLinks />
      <div className={GAME_SCREEN_PANEL_STYLE}>
        <div className={GAME_SCREEN_ACTIONS_STYLE}>
          <div className={GAME_SCREEN_ACTIONS_CONTAINER_STYLE}>{topRightActions}</div>
        </div>
        <TutorialExtras isTutorial={isTutorial} isBot={isBot} />
        {header ?? null}

        <div ref={layoutRef} className={GAME_SCREEN_LAYOUT_STYLE}>
          <div className={GAME_SCREEN_LEFT_COLUMN_STYLE}>
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

          <div className={GAME_SCREEN_RIGHT_COLUMN_STYLE}>
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
