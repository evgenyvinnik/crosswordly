import { useCallback, useState } from 'react';

import { animated, useSpring, useTrail } from '@react-spring/web';

import HowToPlayModal from './HowToPlayModal';

const TITLE = 'Crosswordly';

type SplashScreenProps = {
  tagline?: string;
};

export default function SplashScreen({
  tagline = 'Solve daily grids with style',
}: SplashScreenProps) {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const letters = TITLE.split('');

  const handleCloseHowToPlay = useCallback(() => {
    setShowHowToPlay(false);
  }, []);

  const glow = useSpring({
    from: { opacity: 0.2, scale: 0.9 },
    to: { opacity: 0.55, scale: 1.1 },
    loop: { reverse: true },
    config: { duration: 2000 },
  });

  const messageSpring = useSpring({
    from: { opacity: 0, y: 12 },
    to: { opacity: 1, y: 0 },
    delay: 400,
    config: { mass: 1, tension: 200, friction: 16 },
  });

  const trail = useTrail(letters.length, {
    from: { opacity: 0, y: 18 },
    to: { opacity: 1, y: 0 },
    config: { mass: 1, tension: 280, friction: 20 },
  });

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-900 text-white">
      <button
        type="button"
        onClick={() => setShowHowToPlay(true)}
        className="absolute right-6 top-6 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-100 transition hover:bg-white/10"
      >
        How to play
      </button>
      <animated.div
        aria-hidden
        style={glow}
        className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-slate-900 to-emerald-500/20 blur-3xl"
      />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        <div className="flex flex-wrap justify-center gap-1 text-5xl font-semibold tracking-[0.35em] uppercase sm:text-6xl">
          {trail.map((style, index) => (
            <animated.span
              key={`${letters[index]}-${index}`}
              style={{
                opacity: style.opacity,
                transform: style.y.to((value) => `translateY(${value}px)`),
              }}
            >
              {letters[index]}
            </animated.span>
          ))}
        </div>

      <animated.p
        className="max-w-md text-base text-slate-300 sm:text-lg"
        style={{
          opacity: messageSpring.opacity,
          transform: messageSpring.y.to((value) => `translateY(${value}px)`),
        }}
      >
        {tagline}
      </animated.p>
    </div>

      <HowToPlayModal open={showHowToPlay} onClose={handleCloseHowToPlay} />
    </section>
  );
}
