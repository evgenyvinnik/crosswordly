import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CloseButton from '../icons/CloseButton';
import AppMenu from '../menu/AppMenu';
import { LEVEL_DEFINITIONS } from '../levels/levelConfigs';
import { decodePuzzleSolution } from '../../lib/puzzleEncoder';
import { GameLevel, GameLevelWord } from '../game/GameField';
import {
  CELL_SIZE_STYLE,
  BASE_PLAYABLE_CELL_STYLE,
  CLUE_NUMBER_BADGE_STYLE,
  BOARD_CONTAINER_STYLE,
} from '../../styles/constants';
import { useSEOMetadata } from '../../utils/seo';
import { GUESS_WORDS } from '../../words/words';
import { getCellKey } from '../../lib/gridUtils';
import DirectionCard from '../game/DirectionCard';
import { useConfettiOnComplete } from '../game/useConfetti';

/**
 * Component for solving a shared crossword puzzle (typing mode)
 */
export default function CrosswordPuzzleScreen({
  onOpenSettings,
  onOpenStats,
  onOpenAbout,
}: {
  onOpenSettings: () => void;
  onOpenStats: () => void;
  onOpenAbout: () => void;
}) {
  const { solutionHash } = useParams<{ solutionHash: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [puzzleLevel, setPuzzleLevel] = useState<GameLevel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [typedLetters, setTypedLetters] = useState<Record<string, string>>({});
  const [selectedWord, setSelectedWord] = useState<GameLevelWord | null>(null);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [_errorWords, setErrorWords] = useState<Set<string>>(new Set());
  const [correctWords, setCorrectWords] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  useSEOMetadata(t('crossword.challenge'), t('crossword.instructions'));

  // Trigger confetti when puzzle is completed
  useConfettiOnComplete(isComplete);

  // Calculate dynamic styles based on grid size (matching GameField)
  const { cellSizeStyle, boardContainerStyle, gapStyle } = useMemo(() => {
    if (!puzzleLevel) {
      return {
        cellSizeStyle: CELL_SIZE_STYLE,
        boardContainerStyle: BOARD_CONTAINER_STYLE,
        gapStyle: 'gap-2 sm:gap-3',
      };
    }

    const maxDimension = Math.max(puzzleLevel.grid.width, puzzleLevel.grid.height);

    if (maxDimension > 7) {
      const desktopCellSize = 'md:h-12 md:w-12';
      const mobilePadding = 'p-2';
      const gap = 'gap-1.5 sm:gap-2';

      return {
        cellSizeStyle: `h-9 w-9 text-[1.2rem] leading-[1] tracking-[0.06em] sm:h-12 sm:w-12 sm:text-[1.55rem] ${desktopCellSize} md:text-[1.9rem]`,
        boardContainerStyle: `grid rounded-[20px] border border-[#d3d6da] bg-white/95 ${mobilePadding} shadow-[0_24px_60px_rgba(149,157,165,0.3)] backdrop-blur sm:rounded-[32px] sm:p-4`,
        gapStyle: gap,
      };
    }

    return {
      cellSizeStyle: CELL_SIZE_STYLE,
      boardContainerStyle: BOARD_CONTAINER_STYLE,
      gapStyle: 'gap-2 sm:gap-3',
    };
  }, [puzzleLevel]);

  useEffect(() => {
    if (!solutionHash) {
      setError(t('crossword.noPuzzleData'));
      return;
    }

    const solution = decodePuzzleSolution(solutionHash);
    if (!solution) {
      setError(t('crossword.invalidLink'));
      return;
    }

    console.log('Decoded solution:', solution);

    // Find the base level
    let baseLevel = solution.levelId
      ? LEVEL_DEFINITIONS.find((def) => def.id === solution.levelId)
      : null;

    if (!baseLevel) {
      baseLevel = LEVEL_DEFINITIONS.find((def) => def.id === 'tutorial');
    }

    if (!baseLevel) {
      setError(t('crossword.couldNotCreate'));
      return;
    }

    // Validate word counts
    const expectedAcross = baseLevel.puzzle.words.filter((w) => w.direction === 'across').length;
    const expectedDown = baseLevel.puzzle.words.filter((w) => w.direction === 'down').length;

    if (solution.across.length !== expectedAcross || solution.down.length !== expectedDown) {
      setError(t('crossword.invalidConfig'));
      return;
    }

    // Create crossword level with clues
    const acrossWords = solution.across;
    const downWords = solution.down;

    // Sort words by clueNumber to match encoding order
    const sortByClueNumber = (words: typeof baseLevel.puzzle.words) =>
      words.sort((a, b) => {
        const aNum = a.clueNumber ?? Number.MAX_SAFE_INTEGER;
        const bNum = b.clueNumber ?? Number.MAX_SAFE_INTEGER;
        if (aNum !== bNum) return aNum - bNum;
        return a.id.toString().localeCompare(b.id.toString());
      });

    const sortedAcrossWords = sortByClueNumber(
      baseLevel.puzzle.words.filter((w) => w.direction === 'across'),
    );
    const sortedDownWords = sortByClueNumber(
      baseLevel.puzzle.words.filter((w) => w.direction === 'down'),
    );

    console.log(
      'Sorted across words:',
      sortedAcrossWords.map((w) => ({ id: w.id, word: w.word, clueNumber: w.clueNumber })),
    );
    console.log(
      'Sorted down words:',
      sortedDownWords.map((w) => ({ id: w.id, word: w.word, clueNumber: w.clueNumber })),
    );
    console.log('Solution across:', acrossWords);
    console.log('Solution down:', downWords);

    const customLevel: GameLevel = {
      ...baseLevel.puzzle,
      id: baseLevel.id, // Keep the original level ID for proper identification
      name: `Crossword: ${baseLevel.title}`,
      words: baseLevel.puzzle.words.map((levelWord) => {
        const sortedWords = levelWord.direction === 'across' ? sortedAcrossWords : sortedDownWords;
        const directionWords = levelWord.direction === 'across' ? acrossWords : downWords;
        const directionIndex = sortedWords.indexOf(levelWord);

        console.log(
          `Mapping ${levelWord.direction} word: original="${levelWord.word}" index=${directionIndex} encoded="${directionWords[directionIndex]}"`,
        );

        const sharedWord = directionWords[directionIndex];

        // Validate word length matches the grid position
        if (sharedWord && sharedWord.length !== levelWord.word.length) {
          console.error(
            `Word length mismatch: ${sharedWord} (${sharedWord.length}) vs ${levelWord.word} (${levelWord.word.length})`,
          );
        }

        const wordLookup = sharedWord ? sharedWord.toLowerCase() : '';
        const definition = wordLookup
          ? GUESS_WORDS[wordLookup] || `Definition for ${sharedWord}`
          : '';

        const resultWord = {
          ...levelWord,
          word: sharedWord || levelWord.word,
          clue: definition || '',
        };
        console.log(
          'Created word:',
          resultWord.word,
          'length:',
          resultWord.word.length,
          'for position',
          levelWord.startRow,
          levelWord.startCol,
          'direction:',
          levelWord.direction,
        );
        return resultWord;
      }),
      prefilledLetters: {}, // No prefilled letters in crossword mode
    };

    setPuzzleLevel(customLevel);
  }, [solutionHash, t]);

  // Check completion
  useEffect(() => {
    if (!puzzleLevel) return;

    const allCorrect = puzzleLevel.words.every((word) => {
      for (let i = 0; i < word.word.length; i++) {
        const row = word.startRow + (word.direction === 'down' ? i : 0);
        const col = word.startCol + (word.direction === 'across' ? i : 0);
        const key = getCellKey(row, col);
        const typed = typedLetters[key];
        const expected = word.word[i];
        if (typed !== expected) return false;
      }
      return true;
    });

    setIsComplete(allCorrect);
  }, [typedLetters, puzzleLevel]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (!puzzleLevel) return;

      // Find all words that contain this cell
      const wordsAtCell = puzzleLevel.words.filter((word) => {
        for (let i = 0; i < word.word.length; i++) {
          const wordRow = word.startRow + (word.direction === 'down' ? i : 0);
          const wordCol = word.startCol + (word.direction === 'across' ? i : 0);
          if (wordRow === row && wordCol === col) {
            return true;
          }
        }
        return false;
      });

      if (wordsAtCell.length === 0) return;

      // If clicking the same cell, toggle between across and down
      if (selectedWord) {
        const isInSelectedWord = wordsAtCell.some((w) => w.id === selectedWord.id);
        if (isInSelectedWord && wordsAtCell.length > 1) {
          const currentIdx = wordsAtCell.findIndex((w) => w.id === selectedWord.id);
          const nextWord = wordsAtCell[(currentIdx + 1) % wordsAtCell.length];
          setSelectedWord(nextWord);
          setCurrentLetterIndex(0);
          return;
        }
      }

      // Select the first word at this cell
      const word = wordsAtCell[0];
      setSelectedWord(word);

      // Always start at the beginning of the word
      setCurrentLetterIndex(0);
    },
    [puzzleLevel, selectedWord],
  );

  const validateWord = useCallback(
    (word: GameLevelWord, lettersToValidate?: Record<string, string>) => {
      if (!puzzleLevel) return true;

      const letters = lettersToValidate || typedLetters;

      console.log('=== VALIDATING WORD ===');
      console.log('Word object:', word);
      console.log('Word string:', word.word);
      console.log('Word length:', word.word.length);
      console.log('Word type:', typeof word.word);
      console.log('Position:', word.startRow, word.startCol, word.direction);
      console.log('Current typedLetters state:', letters);

      let isCorrect = true;
      for (let i = 0; i < word.word.length; i++) {
        const row = word.startRow + (word.direction === 'down' ? i : 0);
        const col = word.startCol + (word.direction === 'across' ? i : 0);
        const key = getCellKey(row, col);
        const typed = letters[key];
        const expected = word.word[i];
        console.log(
          `Position ${i} [${row},${col}] key="${key}": typed="${typed}" expected="${expected}" match=${typed === expected}`,
        );
        if (!typed || typed !== expected) {
          isCorrect = false;
          console.log(`MISMATCH at position ${i}!`);
          break;
        }
      }
      console.log('Word validation result:', isCorrect);
      console.log('======================');

      if (isCorrect) {
        // Mark word as correct
        setCorrectWords((prev) => new Set(prev).add(word.id.toString()));
      } else if (!isCorrect) {
        // Mark as error and clear the word (but preserve shared letters from correct words)
        setErrorWords((prev) => new Set(prev).add(word.id.toString()));
        setTimeout(() => {
          setTypedLetters((prev) => {
            console.log('=== CLEARING INCORRECT WORD ===');
            console.log('Current state (prev):', prev);
            console.log(
              'Word to clear:',
              word.word,
              'at',
              word.startRow,
              word.startCol,
              word.direction,
            );

            const next = { ...prev };

            // Find all cells that belong to OTHER words that have been validated as CORRECT
            const protectedCells = new Set<string>();
            if (puzzleLevel) {
              puzzleLevel.words.forEach((otherWord) => {
                if (otherWord.id === word.id) return; // Skip the current word

                console.log(`Checking other word: ${otherWord.word} (${otherWord.direction})`);

                // Check if this word was previously validated as correct
                const isMarkedCorrect = correctWords.has(otherWord.id.toString());
                console.log(`  Is in correctWords set: ${isMarkedCorrect}`);

                // If marked correct, protect all its cells
                if (isMarkedCorrect) {
                  for (let i = 0; i < otherWord.word.length; i++) {
                    const r = otherWord.startRow + (otherWord.direction === 'down' ? i : 0);
                    const c = otherWord.startCol + (otherWord.direction === 'across' ? i : 0);
                    const cellKey = getCellKey(r, c);
                    protectedCells.add(cellKey);
                    console.log(`  Protected cell: ${cellKey}`);
                  }
                }
              });
            }
            console.log('All protected cells:', Array.from(protectedCells));

            // Build map of protected cells to their correct letters
            const protectedLetters = new Map<string, string>();
            if (puzzleLevel) {
              puzzleLevel.words.forEach((otherWord) => {
                if (correctWords.has(otherWord.id.toString())) {
                  for (let i = 0; i < otherWord.word.length; i++) {
                    const r = otherWord.startRow + (otherWord.direction === 'down' ? i : 0);
                    const c = otherWord.startCol + (otherWord.direction === 'across' ? i : 0);
                    const cellKey = getCellKey(r, c);
                    protectedLetters.set(cellKey, otherWord.word[i]);
                  }
                }
              });
            }

            // Delete letters that aren't protected, and restore protected ones
            for (let i = 0; i < word.word.length; i++) {
              const row = word.startRow + (word.direction === 'down' ? i : 0);
              const col = word.startCol + (word.direction === 'across' ? i : 0);
              const key = getCellKey(row, col);
              const isProtected = protectedCells.has(key);

              if (isProtected) {
                // Restore the correct letter from the protected word
                const correctLetter = protectedLetters.get(key);
                if (correctLetter) {
                  next[key] = correctLetter;
                  console.log(`Cell ${key}: PROTECTED - restoring letter "${correctLetter}"`);
                }
              } else {
                console.log(`Cell ${key}: DELETING`);
                delete next[key];
              }
            }
            console.log('State after clearing:', next);
            console.log('===============================');
            return next;
          });
          setErrorWords((prev) => {
            const next = new Set(prev);
            next.delete(word.id.toString());
            return next;
          });
          setCurrentLetterIndex(0);
        }, 800);
      }

      return isCorrect;
    },
    [puzzleLevel, typedLetters, correctWords, setCorrectWords, setErrorWords],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedWord || !puzzleLevel) return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        if (currentLetterIndex > 0) {
          const prevIndex = currentLetterIndex - 1;
          const row = selectedWord.startRow + (selectedWord.direction === 'down' ? prevIndex : 0);
          const col = selectedWord.startCol + (selectedWord.direction === 'across' ? prevIndex : 0);
          const key = getCellKey(row, col);
          setTypedLetters((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
          });
          setCurrentLetterIndex(prevIndex);
        }
        return;
      }

      if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        e.preventDefault();
        if (currentLetterIndex < selectedWord.word.length) {
          const row =
            selectedWord.startRow + (selectedWord.direction === 'down' ? currentLetterIndex : 0);
          const col =
            selectedWord.startCol + (selectedWord.direction === 'across' ? currentLetterIndex : 0);
          const key = getCellKey(row, col);
          const letter = e.key.toLowerCase();

          console.log(
            `Typing: key="${key}" letter="${letter}" at position ${currentLetterIndex} for word "${selectedWord.word}"`,
          );

          const nextIndex = currentLetterIndex + 1;

          setTypedLetters((prev) => {
            const updated = {
              ...prev,
              [key]: letter,
            };

            // If word is complete, validate with the updated state
            if (nextIndex >= selectedWord.word.length) {
              setTimeout(() => {
                validateWord(selectedWord, updated);
              }, 100);
            }

            return updated;
          });

          if (nextIndex < selectedWord.word.length) {
            setCurrentLetterIndex(nextIndex);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedWord, currentLetterIndex, puzzleLevel, validateWord]);

  const handleExit = () => {
    navigate('/');
  };

  const handlePlayOriginal = () => {
    navigate('/levels');
  };

  const renderActionButtons = () => (
    <div className="flex w-full items-center justify-between gap-3">
      <AppMenu
        onOpenSettings={onOpenSettings}
        onOpenStats={onOpenStats}
        onOpenAbout={onOpenAbout}
      />
      <CloseButton onClick={handleExit} ariaLabel="Return to home" />
    </div>
  );

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f5f0] px-4">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-red-600">{t('crossword.error')}</h2>
          <p className="mb-6 text-gray-700">{error}</p>
          <button
            onClick={handleExit}
            className="rounded-full bg-[#1a1a1b] px-6 py-2 text-white transition hover:bg-black"
          >
            {t('crossword.returnHome')}
          </button>
        </div>
      </div>
    );
  }

  if (!puzzleLevel) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f5f0]">
        <div className="text-lg text-gray-600">{t('crossword.loadingPuzzle')}</div>
      </div>
    );
  }

  const acrossWords = puzzleLevel.words.filter((w) => w.direction === 'across');
  const downWords = puzzleLevel.words.filter((w) => w.direction === 'down');

  const acrossEntries = acrossWords.map((word) => ({
    key: word.id,
    clueNumber: word.clueNumber,
    isCompleted: true, // In crossword mode, always show clues
    description: word.clue || 'No clue available',
  }));

  const downEntries = downWords.map((word) => ({
    key: word.id,
    clueNumber: word.clueNumber,
    isCompleted: true, // In crossword mode, always show clues
    description: word.clue || 'No clue available',
  }));

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-start bg-[#f6f5f0] px-1 py-2 text-[#1a1a1b] sm:px-2 sm:py-4">
      <div className="relative w-full max-w-5xl rounded-[20px] border border-[#e2e5ea] bg-white/95 px-2 py-4 text-center shadow-[0_24px_80px_rgba(149,157,165,0.35)] backdrop-blur sm:rounded-[32px] sm:px-3 sm:py-4">
        <div className="absolute inset-x-2 top-2 z-10 sm:inset-x-3 sm:top-3">
          <div className="mx-auto max-w-5xl">{renderActionButtons()}</div>
        </div>

        <div className="mb-4 mt-8 text-center">
          <h2 className="text-2xl font-bold text-[#1a1a1b]">{t('crossword.challenge')}</h2>
          <p className="mt-2 text-sm text-gray-600">{t('crossword.instructions')}</p>
        </div>

        <div className="mt-6 flex w-full flex-col items-center gap-3 sm:gap-3 lg:mt-4 lg:flex-row lg:items-start lg:justify-center lg:gap-4">
          <div className="order-1 flex w-full max-w-4xl flex-col items-center gap-3 sm:gap-4 lg:order-2 lg:w-auto lg:max-w-none">
            <div
              ref={boardRef}
              className={`${boardContainerStyle} ${gapStyle}`}
              style={{
                gridTemplateColumns: `repeat(${puzzleLevel.grid.width}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${puzzleLevel.grid.height}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: puzzleLevel.grid.height }).map((_, row) =>
                Array.from({ length: puzzleLevel.grid.width }).map((_, col) => {
                  const cellKey = getCellKey(row, col);
                  const isPlayable = puzzleLevel.words.some((word) => {
                    for (let i = 0; i < word.word.length; i++) {
                      const wordRow = word.startRow + (word.direction === 'down' ? i : 0);
                      const wordCol = word.startCol + (word.direction === 'across' ? i : 0);
                      if (wordRow === row && wordCol === col) return true;
                    }
                    return false;
                  });

                  if (!isPlayable) {
                    return (
                      <div
                        key={cellKey}
                        className={`${BASE_PLAYABLE_CELL_STYLE} ${cellSizeStyle} border-transparent bg-transparent text-transparent`}
                      />
                    );
                  }

                  const clueNumber = puzzleLevel.words.find((word) => {
                    return word.startRow === row && word.startCol === col && word.clueNumber;
                  })?.clueNumber;

                  const isSelected =
                    selectedWord &&
                    puzzleLevel.words.some((word) => {
                      if (word.id !== selectedWord.id) return false;
                      for (let i = 0; i < word.word.length; i++) {
                        const wordRow = word.startRow + (word.direction === 'down' ? i : 0);
                        const wordCol = word.startCol + (word.direction === 'across' ? i : 0);
                        if (wordRow === row && wordCol === col) return true;
                      }
                      return false;
                    });

                  const isCurrent =
                    selectedWord &&
                    row ===
                      selectedWord.startRow +
                        (selectedWord.direction === 'down' ? currentLetterIndex : 0) &&
                    col ===
                      selectedWord.startCol +
                        (selectedWord.direction === 'across' ? currentLetterIndex : 0);

                  const isError = puzzleLevel.words.some(
                    (word) =>
                      _errorWords.has(word.id.toString()) &&
                      Array.from({ length: word.word.length }).some((_, i) => {
                        const wordRow = word.startRow + (word.direction === 'down' ? i : 0);
                        const wordCol = word.startCol + (word.direction === 'across' ? i : 0);
                        return wordRow === row && wordCol === col;
                      }),
                  );

                  const letter = typedLetters[cellKey];

                  // Check if this cell belongs to a correctly guessed word
                  const isInCorrectWord = puzzleLevel.words.some((word) => {
                    if (!correctWords.has(word.id.toString())) return false;
                    for (let i = 0; i < word.word.length; i++) {
                      const wordRow = word.startRow + (word.direction === 'down' ? i : 0);
                      const wordCol = word.startCol + (word.direction === 'across' ? i : 0);
                      if (wordRow === row && wordCol === col) return true;
                    }
                    return false;
                  });

                  // Use same base styling as GameField
                  const cellClassName = `${cellSizeStyle} ${BASE_PLAYABLE_CELL_STYLE} relative cursor-pointer transition-colors ${
                    isInCorrectWord
                      ? 'bg-[#6aaa64] border-[#6aaa64] text-white shadow-inner'
                      : isError
                        ? 'border-yellow-400 bg-yellow-100'
                        : isCurrent
                          ? 'border-blue-500 bg-blue-50'
                          : isSelected
                            ? 'border-green-500 bg-green-50'
                            : letter
                              ? 'border-[#d3d6da] bg-white/80'
                              : 'border-[#d3d6da] bg-white/80 hover:bg-gray-50'
                  }`;

                  return (
                    <div
                      key={cellKey}
                      data-cell-key={cellKey}
                      onClick={() => handleCellClick(row, col)}
                      className={cellClassName}
                    >
                      {clueNumber !== undefined && (
                        <span className={CLUE_NUMBER_BADGE_STYLE}>{clueNumber}</span>
                      )}
                      {letter || ''}
                    </div>
                  );
                }),
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 w-full sm:mt-6">
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-2">
            <DirectionCard
              title={t('game.across')}
              entries={acrossEntries}
              isHighlighted={selectedWord?.direction === 'across'}
            />
            <DirectionCard
              title={t('game.down')}
              entries={downEntries}
              isHighlighted={selectedWord?.direction === 'down'}
            />
          </div>
        </div>
      </div>

      {isComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0b0d12]/80 px-4 py-8 backdrop-blur-sm">
          <div className="relative z-10 my-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/95 px-6 py-8 text-center shadow-[0_40px_120px_rgba(15,23,42,0.5)] sm:px-10">
            <h2 className="mb-4 text-3xl font-bold text-[#1a1a1b]">
              {t('crossword.congratulations')}
            </h2>
            <p className="mb-6 text-lg text-gray-700">{t('crossword.solved')}</p>
            <p className="mb-6 text-base text-gray-600">{t('crossword.tryOriginal')}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handlePlayOriginal}
                className="inline-flex items-center justify-center rounded-full bg-[#1a1a1b] px-8 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-black"
              >
                {t('crossword.playGame')}
              </button>
              <button
                onClick={handleExit}
                className="inline-flex items-center justify-center rounded-full border border-[#1a1a1b] bg-transparent px-8 py-3 text-base font-semibold text-[#1a1a1b] shadow-sm transition hover:bg-[#f6f5f0]"
              >
                {t('crossword.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
