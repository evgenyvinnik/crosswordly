import { useMemo, type ReactNode } from 'react';
import LevelTile from './levels/LevelTile';
import type { LevelDescriptor } from './levels/LevelTypes';
import { LEVEL_CONFIGS } from '../levelConfigs';

type LevelSelectScreenProps = {
  levels: LevelDescriptor[];
  onSelectLevel: (levelId: string) => void;
  topRightActions?: ReactNode;
};

const LEVEL_SELECT_SECTION_STYLE =
  'relative min-h-screen w-full bg-[#f6f7f8] px-2 py-4 text-[#1a1a1b] sm:px-4 sm:py-10';
const LEVEL_SELECT_PANEL_STYLE =
  'relative mx-auto w-full max-w-6xl rounded-[20px] border border-[#d3d6da] bg-white px-3 py-6 shadow-[0_25px_70px_rgba(149,157,165,0.25)] backdrop-blur-xl sm:rounded-[32px] sm:px-6 sm:py-12';
const LEVEL_SELECT_ACTIONS_STYLE =
  'absolute inset-x-3 top-3 z-20 text-[#4a4d52] sm:inset-x-6 sm:top-6';
const LEVEL_SELECT_TITLE_STYLE =
  'mt-8 text-3xl font-semibold leading-tight tracking-[0.3em] text-[#1a1a1b] sm:text-[2.6rem]';
const LEVEL_SHELF_BADGE_STYLE =
  'flex h-16 items-center justify-center rounded-[999px] border border-[#e0e2e6] bg-[#f0f1f3] px-8 shadow-[0_12px_35px_rgba(178,180,189,0.3)] sm:h-20 sm:px-12';
const LEVEL_SHELF_LABEL_STYLE =
  'px-6 py-1 text-xl font-semibold uppercase tracking-[0.4em] text-[#4a4d52] sm:text-2xl';
const LEVEL_GRID_BASE_STYLE = 'relative z-10 grid justify-items-center gap-4 sm:gap-7';

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
          <div className={LEVEL_SELECT_ACTIONS_STYLE}>
            <div className="mx-auto max-w-6xl">{topRightActions}</div>
          </div>
        ) : null}

        <header className="mx-auto max-w-3xl text-center text-[#1a1a1b]">
          <h1 className={LEVEL_SELECT_TITLE_STYLE}>CROSSWORDLY</h1>
        </header>

        <div className="mt-20 space-y-16 sm:space-y-24">
          {shelves.map((shelf) => (
            <div key={shelf.key} className="relative">
              <div className="mb-6 flex items-center justify-center sm:mb-10">
                <div className={LEVEL_SHELF_BADGE_STYLE}>
                  <div className={LEVEL_SHELF_LABEL_STYLE}>{shelf.label}</div>
                </div>
              </div>

              <div
                className={`${LEVEL_GRID_BASE_STYLE} ${
                  shelf.levels.length === 1
                    ? 'grid-cols-1'
                    : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
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
