import type { ReactNode } from 'react';
import CheckIcon from './icons/CheckIcon';

type LevelDescriptor = {
  id: string;
  title: string;
  description: string;
  order: number;
  isAvailable: boolean;
  hasInstructions?: boolean;
  isCompleted?: boolean;
  wordCount?: number;
};

type LevelSelectScreenProps = {
  levels: LevelDescriptor[];
  onSelectLevel: (levelId: string) => void;
  topRightActions?: ReactNode;
};

const LevelSelectScreen = ({ levels, onSelectLevel, topRightActions }: LevelSelectScreenProps) => {
  return (
    <section className="relative flex min-h-screen items-center justify-center bg-[#f6f5f0] px-4 py-10 text-[#1a1a1b]">
      <div className="relative w-full max-w-5xl rounded-[32px] border border-[#e2e5ea] bg-white/95 px-6 py-10 text-center shadow-[0_24px_80px_rgba(149,157,165,0.35)] backdrop-blur sm:px-10">
        {topRightActions ? (
          <div className="absolute right-6 top-6 z-10 flex items-center gap-2 sm:right-8 sm:top-8 sm:gap-3">
            {topRightActions}
          </div>
        ) : null}
        <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-[2.5rem]">
          Pick next level
        </h1>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {levels.map((level) => (
            <button
              key={level.id}
              type="button"
              className={`relative flex flex-col items-start rounded-3xl border px-6 py-6 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1b] ${
                level.isAvailable
                  ? 'border-[#d3d6da] bg-white hover:-translate-y-1 hover:border-[#1a1a1b]'
                  : 'border-dashed border-[#d3d6da] bg-white/70 text-[#a1a5ad]'
              }`}
              onClick={() => level.isAvailable && onSelectLevel(level.id)}
              disabled={!level.isAvailable}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8c8f94]">
                Level {String(level.order).padStart(2, '0')}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">{level.title}</h2>
              <p className="mt-2 text-sm text-[#4b4e52]">{level.description}</p>
              {level.hasInstructions ? (
                <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-[#e9f6e6] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#3c8033]">
                  <CheckIcon className="h-3.5 w-3.5" />
                  Includes instructions
                </span>
              ) : null}
              {!level.isAvailable ? (
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-[#a1a5ad]">
                  Coming soon
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export type { LevelDescriptor };
export default LevelSelectScreen;
