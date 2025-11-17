import { useState } from 'react';

type FAQItem = {
  question: string;
  answer: string;
};

type FAQProps = {
  isSearchEngine: boolean;
};

const faqItems: FAQItem[] = [
  {
    question: 'How do I play Crosswordly?',
    answer:
      'Crosswordly is a word puzzle game where you drag and drop five-letter words onto a grid. Words must intersect at matching letters. On desktop, click and drag words from the side panels onto the grid. On mobile devices, tap a word to select it, then tap the grid where you want to place it. The game will show you which placements are valid.',
  },
  {
    question: 'What makes Crosswordly different from traditional crosswords?',
    answer:
      'Unlike traditional crosswords where you type letters into empty boxes, Crosswordly provides you with complete words that you arrange on a grid. This visual, spatial approach makes it more accessible while still challenging your vocabulary and pattern recognition skills. The drag-and-drop interface creates a more tactile, puzzle-like experience.',
  },
  {
    question: 'How many difficulty levels are there?',
    answer:
      'Crosswordly features six difficulty levels: 3-word puzzles for beginners, 4-word, 5-word, 6-word, 7-word, and 8-word puzzles for advanced players. Each level introduces more complex word arrangements and intersection patterns. The tutorial level teaches you the basics before you tackle the main puzzles.',
  },
  {
    question: 'Do I need to create an account to play?',
    answer:
      'No account is required! Crosswordly runs entirely in your browser and saves your progress locally. Your completed levels and statistics are stored on your device, so you can pick up where you left off without signing up or logging in.',
  },
  {
    question: 'Can I play Crosswordly on mobile devices?',
    answer:
      'Yes! Crosswordly is fully responsive and works on smartphones and tablets. On mobile devices, use tap-to-select mode instead of dragging: tap a word to select it, then tap the grid location where you want to place it. The interface automatically adapts to touch screens for optimal gameplay.',
  },
  {
    question: 'What happens if I place a word incorrectly?',
    answer:
      "If you try to place a word where it doesn't fit (letters don't match at intersections), the game will show a red error animation and the word will return to the side panel. This immediate feedback helps you learn the correct placement without penalties. You can also remove any placed word by clicking or tapping it again.",
  },
  {
    question: 'Is Crosswordly available in multiple languages?',
    answer:
      'Yes! Crosswordly supports 12 languages including English, Spanish, French, German, Russian, Portuguese, Japanese, Chinese, Korean, Hindi, Arabic, and Hebrew. You can change the interface language in the settings menu. Note that the word puzzles themselves use English words, but all instructions and UI elements are localized.',
  },
  {
    question: 'How do I track my progress?',
    answer:
      "Your progress is automatically saved as you complete levels. You can view your statistics including total levels completed, current completion percentage, and your completion streak in the stats dialog accessible from the menu. The level select screen shows which puzzles you've already solved with star icons.",
  },
];

const FAQ = ({ isSearchEngine }: FAQProps) => {
  const [openItems, setOpenItems] = useState<Set<number>>(
    () => new Set(isSearchEngine ? faqItems.map((_, i) => i) : []),
  );

  const toggleItem = (index: number) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="mx-auto mt-8 max-w-3xl rounded-lg bg-gray-50 p-4 text-left sm:p-6">
      <h2 className="mb-4 text-xl font-bold text-gray-900 sm:text-2xl">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {faqItems.map((item, index) => (
          <div key={index} className="rounded-lg border border-gray-200 bg-white">
            <button
              onClick={() => toggleItem(index)}
              className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
              aria-expanded={openItems.has(index)}
            >
              <span className="pr-4 text-sm font-semibold text-gray-900 sm:text-base">
                {item.question}
              </span>
              <span
                className="flex-shrink-0 text-gray-500 transition-transform"
                style={{
                  transform: openItems.has(index) ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                ▼
              </span>
            </button>
            {openItems.has(index) && (
              <div className="border-t border-gray-200 p-4 pt-3">
                <p className="text-sm leading-relaxed text-gray-700 sm:text-base">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
