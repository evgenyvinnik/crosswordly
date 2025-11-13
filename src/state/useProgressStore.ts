import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type WordCountBucket = 'two' | 'three' | 'four' | 'more';

type StatsState = {
  sessionsPlayed: number;
  solvedByWordCount: Record<WordCountBucket, number>;
};

type ProgressState = {
  completedLevelIds: string[];
  stats: StatsState;
  recordSessionPlay: () => void;
  markLevelCompleted: (levelId: string, wordCount: number) => void;
};

const createDefaultStats = (): StatsState => ({
  sessionsPlayed: 0,
  solvedByWordCount: {
    two: 0,
    three: 0,
    four: 0,
    more: 0,
  },
});

const getBucketForWordCount = (wordCount: number): WordCountBucket => {
  if (wordCount <= 2) return 'two';
  if (wordCount === 3) return 'three';
  if (wordCount === 4) return 'four';
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
        set((state) => ({
          stats: {
            ...state.stats,
            sessionsPlayed: state.stats.sessionsPlayed + 1,
          },
        })),
      markLevelCompleted: (levelId, wordCount) =>
        set((state) => {
          const alreadyCompleted = state.completedLevelIds.includes(levelId);
          const nextCompletedIds = alreadyCompleted
            ? state.completedLevelIds
            : [...state.completedLevelIds, levelId];

          const bucket = getBucketForWordCount(wordCount);
          const shouldIncrementBucket = !alreadyCompleted;
          const nextStats = shouldIncrementBucket
            ? {
                ...state.stats,
                solvedByWordCount: {
                  ...state.stats.solvedByWordCount,
                  [bucket]: state.stats.solvedByWordCount[bucket] + 1,
                },
              }
            : state.stats;

          return {
            completedLevelIds: nextCompletedIds,
            stats: nextStats,
          };
        }),
    }),
    {
      name: 'crossword-progress',
      storage: createJSONStorage(() =>
        typeof window === 'undefined' ? noopStorage : window.localStorage,
      ),
    },
  ),
);

export type { WordCountBucket, StatsState, ProgressState };
