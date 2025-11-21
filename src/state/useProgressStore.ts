import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const WORD_COUNT_BUCKETS = [
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'more',
] as const;

type WordCountBucket = (typeof WORD_COUNT_BUCKETS)[number];

type StatsState = {
  sessionsPlayed: number;
  solvedByWordCount: Record<WordCountBucket, number>;
};

type SettingsState = {
  language?: string;
};

type ProgressState = {
  completedLevelIds: string[];
  stats: StatsState;
  settings: SettingsState;
  levelSelectScrollPosition: number;
  recordSessionPlay: () => void;
  markLevelCompleted: (levelId: string, wordCount: number) => void;
  setLanguage: (language: string) => void;
  setLevelSelectScrollPosition: (position: number) => void;
  resetProgress: () => void;
};

/**
 * Creates a solved-count map that includes every supported word-count bucket so
 * downstream logic can increment counters without worrying about undefined keys.
 * This ensures persisted data from older schemas is upgraded to a predictable shape
 * before being written back to storage.
 *
 * @returns Record keyed by `WordCountBucket` with every counter initialized to zero.
 */
const createEmptySolvedByWordCount = (): Record<WordCountBucket, number> =>
  WORD_COUNT_BUCKETS.reduce(
    (acc, bucket) => {
      acc[bucket] = 0;
      return acc;
    },
    {} as Record<WordCountBucket, number>,
  );

/**
 * Provides the canonical initial statistics object used when a player first opens
 * the game or after a full progress reset. Keeping this helper centralized guards
 * against future schema changes falling out of sync across different call sites.
 *
 * @returns Fresh `StatsState` instance with zeroed counters.
 */
const createDefaultStats = (): StatsState => ({
  sessionsPlayed: 0,
  solvedByWordCount: createEmptySolvedByWordCount(),
});

/**
 * Normalizes partially persisted statistics into a fully populated `StatsState`.
 * Any unexpected bucket keys or non-numeric values are sanitized so newer builds
 * can safely consume legacy data without runtime errors.
 *
 * @param stats - Possibly incomplete stats object loaded from persistence.
 * @returns Well-formed stats with defaults inserted for missing values.
 */
const normalizeStats = (stats?: Partial<StatsState> | null): StatsState => {
  const normalizedSolvedByWordCount = createEmptySolvedByWordCount();
  const solvedCounts = stats?.solvedByWordCount ?? {};
  Object.entries(solvedCounts).forEach(([key, value]) => {
    if (key in normalizedSolvedByWordCount) {
      const bucket = key as WordCountBucket;
      normalizedSolvedByWordCount[bucket] = typeof value === 'number' ? value : 0;
    }
  });
  return {
    sessionsPlayed: typeof stats?.sessionsPlayed === 'number' ? stats.sessionsPlayed : 0,
    solvedByWordCount: normalizedSolvedByWordCount,
  };
};

/**
 * Bins a given word count into the discrete buckets displayed in analytics so
 * stats remain comparable no matter how many words a level contains.
 *
 * @param wordCount - Number of words present in the solved level.
 * @returns Bucket identifier used as a key in `solvedByWordCount`.
 */
const getBucketForWordCount = (wordCount: number): WordCountBucket => {
  if (wordCount <= 2) return 'two';
  if (wordCount === 3) return 'three';
  if (wordCount === 4) return 'four';
  if (wordCount === 5) return 'five';
  if (wordCount === 6) return 'six';
  if (wordCount === 7) return 'seven';
  if (wordCount === 8) return 'eight';
  return 'more';
};

const noopStorage: Storage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
  clear: () => undefined,
  key: () => null,
  length: 0,
};

/**
 * Centralized Zustand store for all user progression data, including completion
 * tracking, aggregate statistics, personalization settings, and UI state such as
 * the level selector scroll position. The store persists via `localStorage` and
 * carefully migrates legacy data to keep long-term players intact.
 */
export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      completedLevelIds: [],
      stats: createDefaultStats(),
      settings: {},
      levelSelectScrollPosition: 0,
      /**
       * Records a gameplay session whenever the user launches a puzzle. The state
       * is normalized first to prevent malformed persisted stats from corrupting
       * cumulative totals, then the `sessionsPlayed` counter is incremented.
       */
      recordSessionPlay: () =>
        set((state) => {
          const stats = normalizeStats(state.stats);
          return {
            stats: {
              ...stats,
              sessionsPlayed: stats.sessionsPlayed + 1,
            },
          };
        }),
      /**
       * Marks a level as completed, optionally updating aggregate stats when the
       * win is new. Completion state is idempotent: replaying the same level will
       * not double-count solved buckets, preserving accurate analytics.
       *
       * @param levelId - Unique identifier of the completed level.
       * @param wordCount - Number of words contained in that level for bucket grouping.
       */
      markLevelCompleted: (levelId, wordCount) =>
        set((state) => {
          const stats = normalizeStats(state.stats);
          const alreadyCompleted = state.completedLevelIds.includes(levelId);
          const nextCompletedIds = alreadyCompleted
            ? state.completedLevelIds
            : [...state.completedLevelIds, levelId];

          const bucket = getBucketForWordCount(wordCount);
          const shouldIncrementBucket = !alreadyCompleted;
          const nextStats = shouldIncrementBucket
            ? {
                ...stats,
                solvedByWordCount: {
                  ...stats.solvedByWordCount,
                  [bucket]: stats.solvedByWordCount[bucket] + 1,
                },
              }
            : stats;

          return {
            completedLevelIds: nextCompletedIds,
            stats: nextStats,
          };
        }),
      /**
       * Persists the player's preferred language code within the settings bucket.
       * This only mutates the nested `language` key, allowing future settings to
       * coexist without being clobbered.
       *
       * @param language - BCP-47 language tag chosen by the player.
       */
      setLanguage: (language) =>
        set((state) => ({
          settings: {
            ...state.settings,
            language,
          },
        })),
      /**
       * Remembers the current scroll offset in the level selection list so users
       * return to the same spot after viewing a puzzle and coming back.
       *
       * @param position - Pixel scroll offset captured from the level select UI.
       */
      setLevelSelectScrollPosition: (position) =>
        set(() => ({
          levelSelectScrollPosition: position,
        })),
      /**
       * Clears all progress, stats, and personalization state. Typically invoked
       * when the user explicitly requests a fresh start. Derived defaults are
       * reused to guarantee schema consistency.
       */
      resetProgress: () =>
        set(() => ({
          completedLevelIds: [],
          stats: createDefaultStats(),
          settings: {},
          levelSelectScrollPosition: 0,
        })),
    }),
    {
      name: 'crossword-progress',
      storage: createJSONStorage(() =>
        typeof window === 'undefined' ? noopStorage : window.localStorage,
      ),
      version: 3,
      /**
       * Upgrades persisted progress into the latest schema version. Missing keys
       * are populated with defaults and corrupted stats are normalized before the
       * store hydrates, ensuring the UI never has to handle undefined shapes.
       *
       * @param persistedState - Raw state object read from storage.
       * @returns Fully normalized state ready to seed the store.
       */
      migrate: (persistedState: unknown) => {
        const state = persistedState as Partial<ProgressState> | undefined;
        if (!state) {
          return {
            completedLevelIds: [],
            stats: createDefaultStats(),
            settings: {},
            levelSelectScrollPosition: 0,
          };
        }
        return {
          completedLevelIds: state.completedLevelIds ?? [],
          stats: normalizeStats(state.stats),
          settings: state.settings ?? {},
          levelSelectScrollPosition:
            typeof state.levelSelectScrollPosition === 'number'
              ? state.levelSelectScrollPosition
              : 0,
        };
      },
    },
  ),
);

export type { WordCountBucket, StatsState, SettingsState, ProgressState };
