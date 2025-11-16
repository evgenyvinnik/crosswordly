import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { animated, useSpring } from '@react-spring/web';

type SplashScreenProps = {
  onComplete?: () => void;
};

type CellType = 'empty' | 'across' | 'down' | 'intersection';

const SPLASH_SECTION_STYLE =
  'relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f6f5f0] px-4 text-[#1a1a1b]';
const SPLASH_BOARD_STYLE =
  'grid gap-2 rounded-2xl border border-[#d3d6da] bg-white/90 p-4 shadow-[0_20px_60px_rgba(149,157,165,0.35)] backdrop-blur';
const SPLASH_CELL_BASE_STYLE =
  'flex h-14 w-14 items-center justify-center rounded-md border text-2xl font-semibold uppercase transition-colors duration-300 sm:h-16 sm:w-16 sm:text-3xl';
const SPLASH_CELL_INTERSECTION_STYLE =
  'bg-[#6aaa64] border-[#6aaa64] text-white shadow-[0_0_20px_rgba(106,170,100,0.35)]';

const acrossPlacements = [
  { row: 1, col: 0, letter: 'C' },
  { row: 1, col: 1, letter: 'R' },
  { row: 1, col: 3, letter: 'S' },
  { row: 1, col: 4, letter: 'S' },
];

const downPlacements = [
  { row: 0, col: 2, letter: 'W' },
  { row: 2, col: 2, letter: 'R' },
  { row: 3, col: 2, letter: 'D' },
  { row: 4, col: 2, letter: 'L' },
  { row: 5, col: 2, letter: 'Y' },
];

const intersectionCell = { row: 1, col: 2, letter: 'O' };

const orderedPlacements = [...acrossPlacements, ...downPlacements, intersectionCell];

const getCellKey = (row: number, col: number) => `${row}-${col}`;

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const cellTypes = useMemo(() => {
    const map = new Map<string, CellType>();

    acrossPlacements.forEach((placement) => {
      map.set(getCellKey(placement.row, placement.col), 'across');
    });

    downPlacements.forEach((placement) => {
      const key = getCellKey(placement.row, placement.col);
      const current = map.get(key);
      map.set(key, current === 'across' ? 'intersection' : 'down');
    });

    map.set(getCellKey(intersectionCell.row, intersectionCell.col), 'intersection');
    return map;
  }, []);

  const puzzleCells = useMemo(() => {
    const unique = new Map<string, (typeof orderedPlacements)[number]>();

    orderedPlacements.forEach((placement) => {
      unique.set(getCellKey(placement.row, placement.col), placement);
    });

    return Array.from(unique.values()).sort((a, b) => a.row - b.row || a.col - b.col);
  }, []);

  const gridDimensions = useMemo(() => {
    const rows = puzzleCells.reduce((max, cell) => Math.max(max, cell.row), 0) + 1;
    const cols = puzzleCells.reduce((max, cell) => Math.max(max, cell.col), 0) + 1;
    return { rows, cols };
  }, [puzzleCells]);

  const [letters, setLetters] = useState<Record<string, string>>({
    [getCellKey(intersectionCell.row, intersectionCell.col)]: intersectionCell.letter,
  });

  useEffect(() => {
    const placements = [...acrossPlacements, ...downPlacements];
    const timers = placements.map((placement, index) =>
      setTimeout(
        () => {
          setLetters((prev) => ({
            ...prev,
            [getCellKey(placement.row, placement.col)]: placement.letter,
          }));
        },
        450 + index * 220,
      ),
    );

    const totalDuration = 450 + (placements.length - 1) * 220 + 600;
    const completionTimer = setTimeout(() => {
      onComplete?.();
    }, totalDuration);

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      clearTimeout(completionTimer);
    };
  }, [onComplete]);

  const boardSpring = useSpring({
    from: { opacity: 0, y: 48 },
    to: { opacity: 1, y: 0 },
    config: { tension: 280, friction: 18 },
  });

  const getCellClasses = (type: CellType, isFilled: boolean) => {
    if (type === 'intersection') {
      return `${SPLASH_CELL_BASE_STYLE} ${SPLASH_CELL_INTERSECTION_STYLE}`;
    }

    if (type === 'down') {
      return `${SPLASH_CELL_BASE_STYLE} ${isFilled ? 'bg-[#c9b458] border-[#c9b458] text-white' : 'border-[#d3d6da] text-transparent'}`;
    }

    if (type === 'across') {
      return `${SPLASH_CELL_BASE_STYLE} ${isFilled ? 'bg-[#787c7e] border-[#787c7e] text-white' : 'border-[#d3d6da] text-transparent'}`;
    }

    return `${SPLASH_CELL_BASE_STYLE} border-[#d3d6da] text-transparent`;
  };

  const renderCell = (row: number, col: number, style?: CSSProperties) => {
    const key = getCellKey(row, col);
    const type = cellTypes.get(key) ?? 'empty';
    const letter = letters[key];
    const isFilled = Boolean(letter);

    return (
      <div
        key={key}
        style={style}
        className={`${getCellClasses(type, isFilled)} ${isFilled ? 'cell-pop' : ''}`}
        role="presentation"
        aria-hidden={!isFilled}
      >
        {letter}
      </div>
    );
  };

  return (
    <section className={SPLASH_SECTION_STYLE}>
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff,transparent_70%)]"
        aria-hidden
      />

      <animated.div
        style={{
          opacity: boardSpring.opacity,
          transform: boardSpring.y.to((value) => `translateY(${value}px)`),
          gridTemplateColumns: `repeat(${gridDimensions.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridDimensions.rows}, minmax(0, 1fr))`,
        }}
        className={SPLASH_BOARD_STYLE}
        role="img"
        aria-label="Animated crossword style cross layout"
      >
        {puzzleCells.map(({ row, col }) =>
          renderCell(row, col, {
            gridColumnStart: col + 1,
            gridRowStart: row + 1,
          }),
        )}
      </animated.div>
    </section>
  );
}
