type GameCompletionModalProps = {
  onExit?: () => void;
};

const COMPLETION_OVERLAY_STYLE =
  'fixed inset-0 z-50 flex items-center justify-center bg-[#0b0d12]/80 px-4 py-8 backdrop-blur-sm';
const COMPLETION_DIALOG_STYLE =
  'relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-white/95 px-6 py-8 text-center shadow-[0_40px_120px_rgba(15,23,42,0.5)] sm:px-10';
const COMPLETION_BUTTON_STYLE =
  'mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#1a1a1b] px-8 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-black';
const GameCompletionModal = ({ onExit }: GameCompletionModalProps) => (
  <div className={COMPLETION_OVERLAY_STYLE} role="dialog" aria-modal="true">
    <div className="absolute inset-0" aria-hidden="true" onClick={onExit} />
    <div className={COMPLETION_DIALOG_STYLE}>
      <h2 className="text-3xl font-semibold text-[#111213] sm:text-[2.25rem]">Level complete!</h2>
      <button type="button" className={COMPLETION_BUTTON_STYLE} onClick={onExit}>
        Next level
      </button>
    </div>
  </div>
);

export default GameCompletionModal;
