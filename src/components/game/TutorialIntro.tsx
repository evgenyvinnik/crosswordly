const TUTORIAL_INTRO_HEADING_STYLE =
  'text-3xl font-semibold leading-tight text-[#1a1a1b] sm:text-4xl';

const TutorialIntro = () => (
  <div className="mx-auto flex max-w-3xl flex-col items-center">
    <h1 className={TUTORIAL_INTRO_HEADING_STYLE}>How to play</h1>
    <p className="text-base text-[#4b4e52]">
      <span className="sm:hidden">
        Tap a word to select it, then tap the row or column where you want to place it.
      </span>
      <span className="hidden sm:inline">
        Drag a word tile, line it up with the highlighted row or column, and let go.
      </span>
    </p>
    <p className="text-base text-[#4b4e52]">
      Keep the green <span className="font-semibold text-[#6aaa64]">A</span> happy to solve both
      clues.
    </p>
  </div>
);

export default TutorialIntro;
