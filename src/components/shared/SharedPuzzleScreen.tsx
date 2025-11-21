import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GameScreen from '../game/GameScreen';
import CloseButton from '../icons/CloseButton';
import AppMenu from '../menu/AppMenu';
import { LEVEL_DEFINITIONS } from '../levels/levelConfigs';
import { decodePuzzleSolution } from '../../utils/puzzleEncoder';
import type { GameLevel } from '../game/GameField';
import { useSEOMetadata } from '../../utils/seo';
import { GUESS_WORDS } from '../../words/words';

/**
 * Component for playing a shared puzzle from another user
 */
export default function SharedPuzzleScreen({
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
  const [sharedLevel, setSharedLevel] = useState<GameLevel | null>(null);
  const [error, setError] = useState<string | null>(null);

  useSEOMetadata(
    t('Solve a shared Crosswordly puzzle'),
    t('Challenge yourself with a puzzle shared by another player!'),
  );

  useEffect(() => {
    if (!solutionHash) {
      setError('No puzzle data provided');
      return;
    }

    const solution = decodePuzzleSolution(solutionHash);
    if (!solution) {
      setError('Invalid puzzle link');
      return;
    }

    // Find the base level - if levelId is empty or not found, use tutorial as template
    let baseLevel = solution.levelId
      ? LEVEL_DEFINITIONS.find((def) => def.id === solution.levelId)
      : null;

    // If no level found, use the tutorial level as the grid template
    if (!baseLevel) {
      baseLevel = LEVEL_DEFINITIONS.find((def) => def.id === 'tutorial');
    }

    if (!baseLevel) {
      setError('Could not create puzzle');
      return;
    }

    // Validate word counts match the grid structure
    const expectedAcross = baseLevel.puzzle.words.filter((w) => w.direction === 'across').length;
    const expectedDown = baseLevel.puzzle.words.filter((w) => w.direction === 'down').length;

    if (solution.across.length !== expectedAcross || solution.down.length !== expectedDown) {
      setError('Invalid puzzle configuration');
      return;
    }

    // Create a custom level using the shared words
    const acrossWords = solution.across;
    const downWords = solution.down;

    const customLevel: GameLevel = {
      ...baseLevel.puzzle,
      id: `shared-${solution.levelId}`,
      name: `Shared: ${baseLevel.title}`,
      words: baseLevel.puzzle.words.map((levelWord) => {
        // Find the corresponding shared word
        const directionWords = levelWord.direction === 'across' ? acrossWords : downWords;
        const directionIndex =
          levelWord.direction === 'across'
            ? baseLevel.puzzle.words.filter((w) => w.direction === 'across').indexOf(levelWord)
            : baseLevel.puzzle.words.filter((w) => w.direction === 'down').indexOf(levelWord);

        const sharedWord = directionWords[directionIndex];
        const definition = sharedWord ? GUESS_WORDS[sharedWord.toLowerCase()] || '' : '';

        return {
          ...levelWord,
          word: sharedWord || levelWord.word,
          clue: definition,
        };
      }),
    };

    setSharedLevel(customLevel);
  }, [solutionHash]);

  const handleExit = () => {
    navigate('/');
  };

  const renderActionButtons = () => (
    <div className="flex w-full items-center justify-between gap-3">
      <AppMenu
        onOpenSettings={onOpenSettings}
        onOpenStats={onOpenStats}
        onOpenAbout={onOpenAbout}
      />
      <CloseButton onClick={handleExit} ariaLabel="Return to level select" />
    </div>
  );

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f5f0] px-4">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-red-600">{t('Error')}</h2>
          <p className="mb-6 text-gray-700">{error}</p>
          <button
            onClick={handleExit}
            className="rounded-full bg-[#1a1a1b] px-6 py-2 text-white transition hover:bg-black"
          >
            {t('Return to Home')}
          </button>
        </div>
      </div>
    );
  }

  if (!sharedLevel) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f5f0]">
        <div className="text-lg text-gray-600">{t('Loading puzzle...')}</div>
      </div>
    );
  }

  return (
    <GameScreen
      level={sharedLevel}
      onExit={handleExit}
      topRightActions={renderActionButtons()}
      header={
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold text-[#1a1a1b]">{t('Shared Puzzle')}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('Solve this puzzle shared by another player!')}
          </p>
        </div>
      }
      levelTitle={sharedLevel.name}
    />
  );
}
