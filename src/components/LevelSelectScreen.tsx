import { useMemo, type ReactNode } from 'react';
import LevelTile from './levels/LevelTile';
import PlaceholderTile from './levels/PlaceholderTile';
import type { LevelDescriptor } from './levels/LevelTypes';
import { LEVEL_CONFIGS } from '../levels';

type LevelSelectScreenProps = {
  levels: LevelDescriptor[];
  onSelectLevel: (levelId: string) => void;
  topRightActions?: ReactNode;
};

const LevelSelectScreen = ({ levels, onSelectLevel, topRightActions }: LevelSelectScreenProps) => {
  const sortedLevels = useMemo(() => [...levels].sort((a, b) => a.order - b.order), [levels]);

  const shelves = useMemo(
    () =>
      LEVEL_CONFIGS.map((config) => {
        const shelfLevels = sortedLevels.filter(config.matcher);
        const capped = shelfLevels.slice(0, config.maxSlots);
        const slots = config.showPlaceholders
          ? [...capped, ...Array.from({ length: Math.max(config.maxSlots - capped.length, 0) })]
          : capped;
        return { ...config, slots };
      }),
    [sortedLevels],
  );

  return (
    <section className="relative min-h-screen w-full bg-gradient-to-b from-[#f5efe3] to-[#efe2cc] px-4 py-10 text-[#2d1c0c]">
      <div className="relative mx-auto w-full max-w-6xl rounded-[40px] border border-[#e0d3c1] bg-white/90 px-6 py-12 shadow-[0_30px_90px_rgba(102,78,47,0.35)] backdrop-blur-lg sm:px-12">
        {topRightActions ? (
          <div className="absolute right-6 top-6 z-10 flex items-center gap-2 sm:right-10 sm:top-8">
            {topRightActions}
          </div>
        ) : null}

        <header className="mx-auto max-w-3xl text-center text-[#3b250b]">
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-[2.6rem]">
            CROSSWORDLY
          </h1>
        </header>

        <div className="mt-20 space-y-24">
          {shelves.map((shelf) => (
            <div key={shelf.key} className="relative pb-24">
              <div className="pointer-events-none absolute inset-x-4 bottom-6 flex h-20 items-center justify-center rounded-[999px] bg-[#c18238] shadow-[0_25px_65px_rgba(120,72,32,0.35)]">
                <div className="rounded-full border border-white/30 px-6 py-1 text-base font-semibold uppercase tracking-[0.4em] text-white">
                  {shelf.label}
                </div>
              </div>

              <div
                className={`relative z-10 grid justify-items-center gap-6 ${
                  shelf.maxSlots === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
                }`}
              >
                {shelf.slots.length > 0 ? (
                  shelf.slots.map((slot, index) =>
                    slot ? (
                      <LevelTile key={slot.id} level={slot} onSelect={onSelectLevel} />
                    ) : (
                      <PlaceholderTile key={`${shelf.key}-placeholder-${index}`} />
                    ),
                  )
                ) : (
                  <PlaceholderTile key={`${shelf.key}-empty`} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export type { LevelDescriptor } from './levels/LevelTypes';
export default LevelSelectScreen;
