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
  'relative min-h-screen w-full bg-[#f6f7f8] px-4 py-10 text-[#1a1a1b]';
const LEVEL_SELECT_PANEL_STYLE =
  'relative mx-auto w-full max-w-6xl rounded-[36px] border border-[#d3d6da] bg-white px-6 py-12 shadow-[0_25px_70px_rgba(149,157,165,0.25)] backdrop-blur-xl sm:px-12';
const LEVEL_SELECT_ACTIONS_STYLE =
  'absolute right-6 top-6 z-10 flex items-center gap-2 text-[#4a4d52] sm:right-10 sm:top-8';
const LEVEL_SHELF_BASE_STYLE =
  'pointer-events-none absolute inset-x-4 bottom-6 flex h-20 items-center justify-center rounded-[999px] border border-[#e0e2e6] bg-[#f0f1f3] shadow-[0_25px_55px_rgba(178,180,189,0.4)]';
const LEVEL_SHELF_LABEL_STYLE =
  'rounded-full border border-[#d3d6da] px-6 py-1 text-base font-semibold uppercase tracking-[0.4em] text-[#4a4d52]';
const LEVEL_GRID_BASE_STYLE = 'relative z-10 grid justify-items-center gap-7';
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

        <header className="mx-auto max-w-3xl text-center text-[#1a1a1b]">
          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-[0.3em] text-[#1a1a1b] sm:text-[2.6rem]">
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
                  <p className="text-sm font-medium text-[#868c95]">More levels coming soon</p>
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
