import { useEffect } from 'react';

type HowToPlayModalProps = {
  open: boolean;
  onClose: () => void;
};

type TileStatus = 'correct' | 'present' | 'absent' | 'neutral';

type Example = {
  word: string;
  highlightedIndex: number;
  status: TileStatus;
  description: string;
};

const EXAMPLES: Example[] = [
  {
    word: 'WEARY',
    highlightedIndex: 0,
    status: 'correct',
    description: 'The letter W is in the word and in the correct spot.',
  },
  {
    word: 'PILLS',
    highlightedIndex: 1,
    status: 'present',
    description: 'The letter I is in the word but in the wrong spot.',
  },
  {
    word: 'VAGUE',
    highlightedIndex: 3,
    status: 'absent',
    description: 'The letter U is not in the word in any spot.',
  },
];

const STATUS_CLASSES: Record<TileStatus, string> = {
  correct: 'bg-emerald-500 text-white',
  present: 'bg-amber-500 text-white',
  absent: 'bg-slate-500 text-white',
  neutral: 'bg-slate-200 text-slate-900',
};

function ExampleTiles({ example }: { example: Example }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex gap-2">
        {example.word.split('').map((letter, index) => {
          const status =
            index === example.highlightedIndex ? example.status : 'neutral';

          return (
            <div
              key={`${example.word}-${letter}-${index}`}
              className={`flex h-12 w-12 items-center justify-center rounded-md border border-slate-300 text-xl font-semibold uppercase ${STATUS_CLASSES[status]}`}
            >
              {letter}
            </div>
          );
        })}
      </div>
      <p className="text-sm text-slate-600">{example.description}</p>
    </div>
  );
}

export default function HowToPlayModal({ open, onClose }: HowToPlayModalProps) {
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (open) {
      document.addEventListener('keydown', handleKey);
    }

    return () => {
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-to-play-title"
    >
      <div className="relative w-full max-w-xl rounded-3xl bg-white text-slate-900 shadow-2xl">
        <div className="border-b border-slate-200 px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          <h2 id="how-to-play-title">How to play</h2>
        </div>

        <div className="space-y-5 px-6 py-6 text-base leading-relaxed">
          <p>
            Guess the Crosswordly word in six tries. Each guess must be a valid five-letter word.
            Hit enter to submit and watch the colors reveal how close you were.
          </p>
          <p>After each guess, the color of the tiles will change to show how close your guess was to the word.</p>

          <div>
            <p className="mb-3 font-semibold uppercase tracking-wide text-slate-500">Examples</p>
            <div className="space-y-4">
              {EXAMPLES.map((example) => (
                <ExampleTiles key={example.word} example={example} />
              ))}
            </div>
          </div>

          <p className="text-sm text-slate-500">
            A new Crosswordly puzzle is available each day. Sharpen your vocabulary streak!
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close how to play"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            fill="none"
            className="h-5 w-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
