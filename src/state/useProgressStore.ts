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

type ProgressState = {
  completedLevelIds: string[];
  stats: StatsState;
  recordSessionPlay: () => void;
  markLevelCompleted: (levelId: string, wordCount: number) => void;
  resetProgress: () => void;
};

const createEmptySolvedByWordCount = (): Record<WordCountBucket, number> =>
  WORD_COUNT_BUCKETS.reduce(
    (acc, bucket) => {
      acc[bucket] = 0;
      return acc;
    },
    {} as Record<WordCountBucket, number>,
  );

const createDefaultStats = (): StatsState => ({
  sessionsPlayed: 0,
  solvedByWordCount: createEmptySolvedByWordCount(),
});

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

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      completedLevelIds: [],
      stats: createDefaultStats(),
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
      resetProgress: () =>
        set(() => ({
          completedLevelIds: [],
          stats: createDefaultStats(),
        })),
    }),
    {
      name: 'crossword-progress',
      storage: createJSONStorage(() =>
        typeof window === 'undefined' ? noopStorage : window.localStorage,
      ),
      version: 2,
      migrate: (persistedState: unknown) => {
        const state = persistedState as Partial<ProgressState> | undefined;
        if (!state) {
          return {
            completedLevelIds: [],
            stats: createDefaultStats(),
          };
        }
        return {
          completedLevelIds: state.completedLevelIds ?? [],
          stats: normalizeStats(state.stats),
        };
      },
    },
  ),
);

export type { WordCountBucket, StatsState, ProgressState };
