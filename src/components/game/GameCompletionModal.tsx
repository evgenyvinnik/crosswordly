import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import GameField, { type GameLevel } from './GameField';
import DirectionCard from './DirectionCard';

type PlacedWord = {
  bankIndex: number;
  word: string;
  definition?: string;
  clueNumber?: number;
  placementId: string | number;
  direction: 'across' | 'down';
  wordId: string | number;
};

type GameCompletionModalProps = {
  onExit?: () => void;
  level: GameLevel;
  committedLetters: Record<string, string>;
  placedWords: Record<string, PlacedWord | null>;
  levelTitle?: string;
};

const COMPLETION_OVERLAY_STYLE =
  'fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0b0d12]/80 px-4 py-8 backdrop-blur-sm';
const COMPLETION_DIALOG_STYLE =
  'relative z-10 my-auto w-full max-w-4xl rounded-3xl border border-white/10 bg-white/95 px-6 py-8 text-center shadow-[0_40px_120px_rgba(15,23,42,0.5)] sm:px-10';
const COMPLETION_DOWNLOAD_BUTTON_STYLE =
  'inline-flex flex-1 items-center justify-center rounded-full border border-[#1a1a1b] bg-transparent px-8 py-3 text-base font-semibold text-[#1a1a1b] shadow-sm transition hover:bg-[#f6f5f0]';
const COMPLETION_NEXT_BUTTON_STYLE =
  'inline-flex flex-1 items-center justify-center rounded-full bg-[#1a1a1b] px-8 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-black';
const COMPLETION_PUZZLE_CONTAINER_STYLE =
  'mt-8 max-h-[calc(100vh-16rem)] overflow-y-auto rounded-2xl bg-white p-6';

const GameCompletionModal = ({
  onExit,
  level,
  committedLetters,
  placedWords,
  levelTitle,
}: GameCompletionModalProps) => {
  const { t } = useTranslation();
  const puzzleRef = useRef<HTMLDivElement>(null);
  const downloadPuzzleRef = useRef<HTMLDivElement>(null);

  const getPlacementKey = (placementId: string | number) => placementId.toString();

  const handleDownload = async () => {
    if (!downloadPuzzleRef.current) return;

    try {
      // Temporarily make the download version visible for capture
      downloadPuzzleRef.current.style.position = 'absolute';
      downloadPuzzleRef.current.style.left = '-9999px';
      downloadPuzzleRef.current.style.display = 'block';

      const canvas = await html2canvas(downloadPuzzleRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      // Hide it again
      downloadPuzzleRef.current.style.display = 'none';

      const link = document.createElement('a');
      link.download = `crossword-${level.id || 'puzzle'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download crossword:', error);
    }
  };

  const acrossWords = level.words
    .filter((word) => word.direction === 'across')
    .sort((a, b) => {
      const aNum = a.clueNumber ?? Number.MAX_SAFE_INTEGER;
      const bNum = b.clueNumber ?? Number.MAX_SAFE_INTEGER;
      if (aNum !== bNum) return aNum - bNum;
      return getPlacementKey(a.id).localeCompare(getPlacementKey(b.id));
    });

  const downWords = level.words
    .filter((word) => word.direction === 'down')
    .sort((a, b) => {
      const aNum = a.clueNumber ?? Number.MAX_SAFE_INTEGER;
      const bNum = b.clueNumber ?? Number.MAX_SAFE_INTEGER;
      if (aNum !== bNum) return aNum - bNum;
      return getPlacementKey(a.id).localeCompare(getPlacementKey(b.id));
    });

  const acrossEntries = acrossWords.map((word) => {
    const placementKey = getPlacementKey(word.id);
    const entry = placedWords[placementKey];
    return {
      key: word.id,
      clueNumber: word.clueNumber,
      isCompleted: true,
      description: entry?.definition,
    };
  });

  const downEntries = downWords.map((word) => {
    const placementKey = getPlacementKey(word.id);
    const entry = placedWords[placementKey];
    return {
      key: word.id,
      clueNumber: word.clueNumber,
      isCompleted: true,
      description: entry?.definition,
    };
  });

  return (
    <>
      <div className={COMPLETION_OVERLAY_STYLE} role="dialog" aria-modal="true">
        <div className="absolute inset-0" aria-hidden="true" />
        <div className={COMPLETION_DIALOG_STYLE}>
          <h2 className="text-3xl font-semibold text-[#111213] sm:text-[2.25rem]">
            {t('game.levelComplete')}
          </h2>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              className={COMPLETION_DOWNLOAD_BUTTON_STYLE}
              onClick={handleDownload}
            >
              {t('game.download')}
            </button>
            <button type="button" className={COMPLETION_NEXT_BUTTON_STYLE} onClick={onExit}>
              {t('game.next')}
            </button>
          </div>

          <div ref={puzzleRef} className={COMPLETION_PUZZLE_CONTAINER_STYLE}>
            <div className="mb-6 flex justify-center">
              <GameField level={level} committedLetters={committedLetters} overlay={null} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <DirectionCard
                title={t('game.across')}
                entries={acrossEntries}
                isHighlighted={false}
              />
              <DirectionCard title={t('game.down')} entries={downEntries} isHighlighted={false} />
            </div>
          </div>
        </div>
      </div>

      {/* Hidden download version without filled letters */}
      <div ref={downloadPuzzleRef} style={{ display: 'none' }} className="bg-white p-8">
        <h3 className="mb-6 text-center text-2xl font-semibold text-[#111213]">
          {levelTitle || level.name || 'Crossword Puzzle'}
        </h3>
        <div className="mb-6 flex justify-center">
          <GameField
            level={{ ...level, prefilledLetters: {} }}
            committedLetters={{}}
            overlay={null}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <DirectionCard title={t('game.across')} entries={acrossEntries} isHighlighted={false} />
          <DirectionCard title={t('game.down')} entries={downEntries} isHighlighted={false} />
        </div>
      </div>
    </>
  );
};

export default GameCompletionModal;
