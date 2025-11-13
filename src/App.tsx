import { useState } from 'react';
import StatsDialog from './components/StatsDialog';

const mockStats = {
  played: 1,
  winPercentage: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: [
    { attempt: 1, wins: 0 },
    { attempt: 2, wins: 0 },
    { attempt: 3, wins: 0 },
    { attempt: 4, wins: 0 },
    { attempt: 5, wins: 0 },
    { attempt: 6, wins: 0 },
  ],
};

export default function App() {
  const [isStatsOpen, setIsStatsOpen] = useState(true);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900 p-6 text-white">
      <button
        onClick={() => setIsStatsOpen(true)}
        className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold uppercase tracking-wider"
      >
        Show statistics
      </button>

      <StatsDialog
        isOpen={isStatsOpen}
        onRequestClose={() => setIsStatsOpen(false)}
        {...mockStats}
      />
    </main>
  );
}
