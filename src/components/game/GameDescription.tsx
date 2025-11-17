type GameDescriptionProps = {
  isSearchEngine: boolean;
};

const GameDescription = ({ isSearchEngine }: GameDescriptionProps) => {
  if (!isSearchEngine) {
    return null;
  }

  return (
    <div className="mx-auto mb-6 max-w-3xl rounded-lg bg-blue-50 p-4 text-left sm:mb-8 sm:p-6">
      <h1 className="mb-3 text-xl font-bold text-gray-900 sm:text-2xl">
        About Crosswordly - Word Puzzle Game
      </h1>
      <p className="mb-3 text-sm leading-relaxed text-gray-700 sm:text-base">
        Crosswordly is an innovative word puzzle game that combines the challenge of crosswords
        with intuitive drag-and-drop gameplay. Unlike traditional crosswords, Crosswordly presents
        you with a visual grid where you place five-letter words to create intersecting patterns.
      </p>
      <p className="mb-3 text-sm leading-relaxed text-gray-700 sm:text-base">
        Each puzzle is carefully designed with multiple difficulty levels, from simple 3-word
        puzzles perfect for beginners to complex 8-word challenges that will test even experienced
        word game enthusiasts. The game features a progressive learning curve with a comprehensive
        tutorial system that teaches you the mechanics step by step.
      </p>
      <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
        Whether you're looking to improve your vocabulary, enjoy a relaxing word game, or
        challenge your spatial reasoning skills, Crosswordly offers an engaging experience that's
        both educational and entertaining. Play directly in your browser with no download required.
      </p>
    </div>
  );
};

export default GameDescription;
