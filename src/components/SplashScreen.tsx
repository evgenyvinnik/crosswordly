import { useEffect, useMemo, useState } from 'react';
import { animated, useSpring } from '@react-spring/web';

type SplashScreenProps = {
  tagline?: string;
};

type CellType = 'empty' | 'across' | 'down' | 'intersection';

const ROWS = 6;
const COLUMNS = 5;

const acrossPlacements = [
  { row: 2, col: 0, letter: 'C' },
  { row: 2, col: 1, letter: 'R' },
  { row: 2, col: 3, letter: 'S' },
  { row: 2, col: 4, letter: 'S' },
];

const downPlacements = [
  { row: 0, col: 2, letter: 'W' },
  { row: 1, col: 2, letter: 'R' },
  { row: 3, col: 2, letter: 'D' },
  { row: 4, col: 2, letter: 'L' },
  { row: 5, col: 2, letter: 'Y' },
];

const intersectionCell = { row: 2, col: 2, letter: 'O' };

const getCellKey = (row: number, col: number) => `${row}-${col}`;

export default function SplashScreen({
  tagline = 'Wordle energy meets crossword depth.',
}: SplashScreenProps) {
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

  const [letters, setLetters] = useState<Record<string, string>>({
    [getCellKey(intersectionCell.row, intersectionCell.col)]: intersectionCell.letter,
  });

  useEffect(() => {
    const placements = [...acrossPlacements, ...downPlacements];
    const timers = placements.map((placement, index) =>
      setTimeout(() => {
        setLetters((prev) => ({
          ...prev,
          [getCellKey(placement.row, placement.col)]: placement.letter,
        }));
      }, 700 + index * 420)
    );

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const boardSpring = useSpring({
    from: { opacity: 0, y: 48 },
    to: { opacity: 1, y: 0 },
    config: { tension: 200, friction: 20 },
  });

  const messageSpring = useSpring({
    from: { opacity: 0, y: 16 },
    to: { opacity: 1, y: 0 },
    delay: 400,
    config: { tension: 220, friction: 22 },
  });

  const getCellClasses = (type: CellType, isFilled: boolean) => {
    const base = 'flex h-14 w-14 items-center justify-center rounded-md border text-2xl font-semibold uppercase transition-colors duration-300 sm:h-16 sm:w-16 sm:text-3xl';

    if (type === 'intersection') {
      return `${base} bg-[#6aaa64] border-[#6aaa64] text-white shadow-[0_0_25px_rgba(106,170,100,0.45)]`;
    }

    if (type === 'down') {
      return `${base} ${isFilled ? 'bg-[#c9b458] border-[#c9b458] text-[#121213]' : 'border-[#3a3a3c] text-transparent'}`;
    }

    if (type === 'across') {
      return `${base} ${isFilled ? 'bg-[#3a3a3c] border-[#565758] text-white' : 'border-[#3a3a3c] text-transparent'}`;
    }

    return `${base} border-[#3a3a3c] text-transparent`;
  };

  const renderCell = (row: number, col: number) => {
    const key = getCellKey(row, col);
    const type = cellTypes.get(key) ?? 'empty';
    const letter = letters[key];
    const isFilled = Boolean(letter);

    return (
      <div
        key={key}
        className={`${getCellClasses(type, isFilled)} ${isFilled ? 'cell-pop' : ''}`}
        role="presentation"
        aria-hidden={!isFilled}
      >
        {letter}
      </div>
    );
  };

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#121213] px-4 text-[#d7dadc]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#2b2b2d,transparent_60%)]" aria-hidden />

      <div className="relative z-10 flex flex-col items-center gap-8 text-center">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.5em] text-[#818384]">Daily Grid Preview</p>
          <h1 className="font-['Kanit'] text-4xl font-semibold uppercase tracking-[0.15em] text-white sm:text-5xl">
            Crosswordly
          </h1>
        </div>

        <animated.div
          style={{
            opacity: boardSpring.opacity,
            transform: boardSpring.y.to((value) => `translateY(${value}px)`),
          }}
          className="grid grid-cols-5 gap-2 rounded-2xl bg-[#1a1a1b]/60 p-4 shadow-[0_15px_60px_rgba(0,0,0,0.45)] backdrop-blur"
          role="img"
          aria-label="Animated crossword and Wordle hybrid grid"
        >
          {Array.from({ length: ROWS }).map((_, row) =>
            Array.from({ length: COLUMNS }).map((_, col) => renderCell(row, col))
          )}
        </animated.div>

        <animated.p
          className="max-w-xl text-base text-[#c0c3c6] sm:text-lg"
          style={{
            opacity: messageSpring.opacity,
            transform: messageSpring.y.to((value) => `translateY(${value}px)`),
          }}
        >
          {tagline}
        </animated.p>
      </div>
    </section>
  );
}
