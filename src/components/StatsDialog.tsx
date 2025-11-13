import { Fragment } from 'react';

type GuessDistributionRow = {
  attempt: number;
  wins: number;
};

type StatsDialogProps = {
  isOpen?: boolean;
  onRequestClose?: () => void;
  played: number;
  winPercentage: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: GuessDistributionRow[];
};

export default function StatsDialog({
  isOpen = true,
  onRequestClose,
  played,
  winPercentage,
  currentStreak,
  maxStreak,
  guessDistribution,
}: StatsDialogProps) {
  if (!isOpen) return null;

  const maxWins = Math.max(...guessDistribution.map((row) => row.wins), 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 text-slate-900 shadow-2xl">
        <header className="flex items-center justify-center text-xs font-semibold tracking-[0.35em] text-slate-500">
          STATISTICS
        </header>

        <button
          aria-label="Close"
          onClick={onRequestClose}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <span aria-hidden className="text-lg">
            &times;
          </span>
        </button>

        <section className="mt-6 grid grid-cols-4 gap-4 text-center">
          {[
            { label: 'Played', value: played },
            { label: 'Win %', value: winPercentage },
            { label: 'Current\nStreak', value: currentStreak },
            { label: 'Max\nStreak', value: maxStreak },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-1 text-sm">
              <div className="text-4xl font-semibold text-slate-900">{value}</div>
              {label.split('\n').map((line) => (
                <span key={line} className="text-xs uppercase tracking-wide text-slate-500">
                  {line}
                </span>
              ))}
            </div>
          ))}
        </section>

        <section className="mt-8">
          <h2 className="text-center text-xs font-semibold tracking-[0.35em] text-slate-500">
            GUESS DISTRIBUTION
          </h2>

          <div className="mt-4 flex flex-col gap-2">
            {guessDistribution.map((row) => {
              const widthPercent = row.wins === 0 ? 12 : Math.max(20, (row.wins / maxWins) * 100);

              return (
                <Fragment key={row.attempt}>
                  <div className="flex items-center gap-3">
                    <span className="w-4 text-sm font-semibold text-slate-500">{row.attempt}</span>
                    <div className="relative h-7 flex-1 rounded bg-slate-100">
                      <div
                        className="absolute inset-y-0 left-0 rounded bg-slate-900 text-white"
                        style={{ width: `${widthPercent}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-end px-2 text-sm font-semibold text-white">
                        {row.wins}
                      </span>
                    </div>
                  </div>
                </Fragment>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
