import type { GameLevel } from '../GameField';

type LevelDescriptor = {
  id: string;
  title: string;
  description: string;
  order: number;
  isAvailable: boolean;
  hasInstructions?: boolean;
  isCompleted?: boolean;
  wordCount: number;
  puzzle: GameLevel;
};

export type { LevelDescriptor };
