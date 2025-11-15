import { useMemo, type ReactNode } from 'react';
import LevelTile from './levels/LevelTile';
import type { LevelDescriptor } from './levels/LevelTypes';
import { LEVEL_CONFIGS } from '../levels';

type LevelSelectScreenProps = {
  levels: LevelDescriptor[];
  onSelectLevel: (levelId: string) => void;
  topRightActions?: ReactNode;
};

const LEVEL_SELECT_SECTION_STYLE =
  'relative min-h-screen w-full bg-gradient-to-b from-[#f5efe3] to-[#efe2cc] px-4 py-10 text-[#2d1c0c]';
const LEVEL_SELECT_PANEL_STYLE =
  'relative mx-auto w-full max-w-6xl rounded-[40px] border border-[#e0d3c1] bg-white/90 px-6 py-12 shadow-[0_30px_90px_rgba(102,78,47,0.35)] backdrop-blur-lg sm:px-12';
const LEVEL_SELECT_ACTIONS_STYLE =
  'absolute right-6 top-6 z-10 flex items-center gap-2 sm:right-10 sm:top-8';
const LEVEL_SHELF_BASE_STYLE =
  'pointer-events-none absolute inset-x-4 bottom-6 flex h-20 items-center justify-center rounded-[999px] bg-[#c18238] shadow-[0_25px_65px_rgba(120,72,32,0.35)]';
const LEVEL_SHELF_LABEL_STYLE =
  'rounded-full border border-white/30 px-6 py-1 text-base font-semibold uppercase tracking-[0.4em] text-white';
const LEVEL_GRID_BASE_STYLE = 'relative z-10 grid justify-items-center gap-6';
const LEVEL_GRID_SINGLE_COLUMN_STYLE = 'grid-cols-1';
const LEVEL_GRID_MULTI_COLUMN_STYLE = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';

const LevelSelectScreen = ({ levels, onSelectLevel, topRightActions }: LevelSelectScreenProps) => {
  const levelMap = useMemo(() => {
    const descriptorMap = new Map<string, LevelDescriptor>();
    levels.forEach((level) => {
      descriptorMap.set(level.id, level);
    });
    return descriptorMap;
  }, [levels]);

  const shelves = useMemo(
    () =>
      LEVEL_CONFIGS.map((config) => {
        const shelfLevels = [...config.levels]
          .sort((a, b) => a.order - b.order)
          .map((definition) => levelMap.get(definition.id))
          .filter((definition): definition is LevelDescriptor => Boolean(definition));

        return {
          key: config.key,
          label: config.label,
          levels: shelfLevels,
        };
      }),
    [levelMap],
  );

  return (
    <section className={LEVEL_SELECT_SECTION_STYLE}>
      <div className={LEVEL_SELECT_PANEL_STYLE}>
        {topRightActions ? (
          <div className={LEVEL_SELECT_ACTIONS_STYLE}>{topRightActions}</div>
        ) : null}

        <header className="mx-auto max-w-3xl text-center text-[#3b250b]">
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-[2.6rem]">
            CROSSWORDLY
          </h1>
        </header>

        <div className="mt-20 space-y-24">
          {shelves.map((shelf) => (
            <div key={shelf.key} className="relative pb-24">
              <div className={LEVEL_SHELF_BASE_STYLE}>
                <div className={LEVEL_SHELF_LABEL_STYLE}>{shelf.label}</div>
              </div>

              <div
                className={`${LEVEL_GRID_BASE_STYLE} ${
                  shelf.levels.length === 1
                    ? LEVEL_GRID_SINGLE_COLUMN_STYLE
                    : LEVEL_GRID_MULTI_COLUMN_STYLE
                }`}
              >
                {shelf.levels.length > 0 ? (
                  shelf.levels.map((level) => (
                    <LevelTile key={level.id} level={level} onSelect={onSelectLevel} />
                  ))
                ) : (
                  <p className="text-sm font-medium text-[#8b6c4a]">More levels coming soon</p>
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
