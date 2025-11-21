import { useTranslation } from 'react-i18next';

interface CrosswordCompletionDialogProps {
  isComplete: boolean;
  onPlayOriginal: () => void;
  onExit: () => void;
}

/**
 * Dialog displayed when a shared crossword puzzle is completed.
 * Offers options to play the original game or exit.
 *
 * @param props - Component properties
 * @param props.isComplete - Whether the puzzle is completed
 * @param props.onPlayOriginal - Callback to navigate to the main game
 * @param props.onExit - Callback to close the dialog
 */
export function CrosswordCompletionDialog({
  isComplete,
  onPlayOriginal,
  onExit,
}: CrosswordCompletionDialogProps) {
  const { t } = useTranslation();

  if (!isComplete) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0b0d12]/80 px-4 py-8 backdrop-blur-sm">
      <div className="relative z-10 my-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/95 px-6 py-8 text-center shadow-[0_40px_120px_rgba(15,23,42,0.5)] sm:px-10">
        <h2 className="mb-4 text-3xl font-bold text-[#1a1a1b]">{t('crossword.congratulations')}</h2>
        <p className="mb-6 text-lg text-gray-700">{t('crossword.solved')}</p>
        <p className="mb-6 text-base text-gray-600">{t('crossword.tryOriginal')}</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onPlayOriginal}
            className="inline-flex items-center justify-center rounded-full bg-[#1a1a1b] px-8 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-black"
          >
            {t('crossword.playGame')}
          </button>
          <button
            onClick={onExit}
            className="inline-flex items-center justify-center rounded-full border border-[#1a1a1b] bg-transparent px-8 py-3 text-base font-semibold text-[#1a1a1b] shadow-sm transition hover:bg-[#f6f5f0]"
          >
            {t('crossword.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
