import { useMemo, type ReactNode } from 'react';
import type { GameLevel } from './GameField';
import CheckIcon from './icons/CheckIcon';

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

type LevelSelectScreenProps = {
  levels: LevelDescriptor[];
  onSelectLevel: (levelId: string) => void;
  topRightActions?: ReactNode;
};

type ShelfConfig = {
  key: string;
  label: string;
  maxSlots: number;
  matcher: (level: LevelDescriptor) => boolean;
  showPlaceholders: boolean;
};

const SHELF_CONFIGS: ShelfConfig[] = [
  {
    key: 'tutorial',
    label: 'Tutorial',
    maxSlots: 1,
    matcher: (level) => level.id === 'tutorial',
    showPlaceholders: false,
  },
  {
    key: 'two-words',
    label: '2 Words',
    maxSlots: 5,
    matcher: (level) => level.wordCount === 2 && level.id !== 'tutorial',
    showPlaceholders: true,
  },
  {
    key: 'three-words',
    label: '3 Words',
    maxSlots: 5,
    matcher: (level) => level.wordCount === 3,
    showPlaceholders: true,
  },
  {
    key: 'four-words',
    label: '4 Words',
    maxSlots: 5,
    matcher: (level) => level.wordCount === 4,
    showPlaceholders: true,
  },
  {
    key: 'five-words',
    label: '5 Words',
    maxSlots: 5,
    matcher: (level) => level.wordCount === 5,
    showPlaceholders: true,
  },
  {
    key: 'six-words',
    label: '6 Words',
    maxSlots: 5,
    matcher: (level) => level.wordCount >= 6,
    showPlaceholders: true,
  },
];

type MiniPuzzlePreviewProps = {
  level: LevelDescriptor;
  onSelect: (levelId: string) => void;
};

const MiniPuzzlePreview = ({ level, onSelect }: MiniPuzzlePreviewProps) => {
  const { puzzle } = level;
  const isLocked = !level.isAvailable;
  const playableCells = useMemo(() => {
    const cells = new Set<string>();
    puzzle.words.forEach((word) => {
      word.answer.split('').forEach((_, index) => {
        const row = word.start.row + (word.direction === 'down' ? index : 0);
        const col = word.start.col + (word.direction === 'across' ? index : 0);
        cells.add(`${row}-${col}`);
      });
    });
    return cells;
  }, [puzzle]);

  const renderedCells = [];
  for (let row = 0; row < puzzle.rows; row += 1) {
    for (let col = 0; col < puzzle.cols; col += 1) {
      const isPlayable = playableCells.has(`${row}-${col}`);
      renderedCells.push(
        <span
          key={`${row}-${col}`}
          className={`block rounded-[3px] border ${
            isPlayable
              ? 'border-[#6e4a1b] bg-[#f7ead5]'
              : 'border-transparent bg-transparent opacity-20'
          }`}
        />,
      );
    }
  }

  const handleClick = () => {
    if (!isLocked) {
      onSelect(level.id);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLocked}
      className={`relative aspect-square w-24 rounded-3xl border-2 p-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5efe3] sm:w-28 lg:w-32 ${
        isLocked
          ? 'cursor-not-allowed border-dashed border-[#d8c7b1] bg-[#f2e8da] text-[#b7aa9b]'
          : 'border-[#c89d67] bg-[#fffaf0] text-[#3b250b] shadow-[0_12px_30px_rgba(120,82,46,0.25)] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(120,82,46,0.35)]'
      }`}
      aria-label={`${level.title} level`}
    >
      {level.isCompleted ? (
        <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-[#6aaa64] px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-wide text-white">
          <CheckIcon className="h-3 w-3" />
          Done
        </span>
      ) : null}

      <div
        className="grid h-full w-full gap-[2px] rounded-xl bg-[#fff6ea] p-1 shadow-inner"
        style={{ gridTemplateColumns: `repeat(${puzzle.cols}, minmax(0, 1fr))` }}
        aria-hidden="true"
      >
        {renderedCells}
      </div>
    </button>
  );
};

type LevelTileProps = {
  level: LevelDescriptor;
  onSelect: (levelId: string) => void;
};

const LevelTile = ({ level, onSelect }: LevelTileProps) => (
  <MiniPuzzlePreview level={level} onSelect={onSelect} />
);

const PlaceholderTile = () => (
  <div className="flex aspect-square w-24 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#dccab1] bg-[#f2e6d4] text-center text-[0.6rem] font-semibold uppercase tracking-[0.35em] text-[#bfa683] sm:w-28 lg:w-32">
    Coming
    <br />
    Soon
  </div>
);

const LevelSelectScreen = ({ levels, onSelectLevel, topRightActions }: LevelSelectScreenProps) => {
  const sortedLevels = useMemo(() => [...levels].sort((a, b) => a.order - b.order), [levels]);

  const shelves = useMemo(
    () =>
      SHELF_CONFIGS.map((config) => {
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

export type { LevelDescriptor };
export default LevelSelectScreen;
