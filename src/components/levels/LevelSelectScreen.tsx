import { useMemo, useEffect, useRef, type ReactNode, useCallback, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LevelTile from './LevelTile';
import type { LevelDescriptor } from './LevelTypes';
import { LEVEL_CONFIGS } from './levelConfigs';
import { trackLevelSelectView } from '../../lib/analytics';
import { useProgressStore } from '../../state/useProgressStore';

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

function debounce<T extends (...args: unknown[]) => void>(func: T, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  const debounced = (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      func(...args);
    }, wait);
  };
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  return debounced;
}

const LevelSelectScreen = ({ levels, onSelectLevel, topRightActions }: LevelSelectScreenProps) => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const levelSelectScrollPosition = useProgressStore((state) => state.levelSelectScrollPosition);
  const setLevelSelectScrollPosition = useProgressStore(
    (state) => state.setLevelSelectScrollPosition,
  );
  const isRestoringRef = useRef(levelSelectScrollPosition > 0);

  // Track first paint
  useEffect(() => {
    trackLevelSelectView();
  }, []);

  // Restore scroll position after render
  useLayoutEffect(() => {
    if (levelSelectScrollPosition <= 0) {
      isRestoringRef.current = false;
      return;
    }

    // Prevent browser from restoring scroll position automatically
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    isRestoringRef.current = true;

    let attempts = 0;
    const maxAttempts = 60; // ~1 second
    let frameId: number | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const tryScroll = () => {
      window.scrollTo({
        top: levelSelectScrollPosition,
        behavior: 'auto',
      });
      document.documentElement.scrollTop = levelSelectScrollPosition;
      document.body.scrollTop = levelSelectScrollPosition;

      const currentScroll =
        window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
      const targetReached = Math.abs(currentScroll - levelSelectScrollPosition) < 10;

      if (targetReached || attempts >= maxAttempts) {
        timeoutId = setTimeout(() => {
          isRestoringRef.current = false;
        }, 50);
      } else {
        attempts++;
        frameId = requestAnimationFrame(tryScroll);
      }
    };

    tryScroll();

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [levelSelectScrollPosition]);

  // Save scroll position on scroll
  useEffect(() => {
    const handleScroll = debounce(() => {
      if (isRestoringRef.current) return;
      setLevelSelectScrollPosition(window.scrollY);
    }, 100);

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      handleScroll.cancel();
    };
  }, [setLevelSelectScrollPosition]);

  const handleLevelSelect = useCallback(
    (levelId: string) => {
      setLevelSelectScrollPosition(window.scrollY);
      onSelectLevel(levelId);
    },
    [onSelectLevel, setLevelSelectScrollPosition],
  );

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
          label: t(`shelves.${config.key}`),
          levels: shelfLevels,
        };
      }),
    [levelMap, t],
  );

  return (
    <section ref={sectionRef} className={LEVEL_SELECT_SECTION_STYLE}>
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
                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
                }`}
              >
                {shelf.levels.length > 0 ? (
                  shelf.levels.map((level) => (
                    <LevelTile key={level.id} level={level} onSelect={handleLevelSelect} />
                  ))
                ) : (
                  <p className="text-sm font-medium text-[#868c95]">
                    {t('levelSelect.moreLevelsSoon')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export type { LevelDescriptor } from './LevelTypes';
export default LevelSelectScreen;
