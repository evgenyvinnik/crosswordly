import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type FAQItem = {
  question: string;
  answer: string;
};

type FAQProps = {
  isSearchEngine: boolean;
};

/**
 * Renders the Frequently Asked Questions section.
 * Displays a list of questions and answers about the game.
 *
 * @param props - Component properties
 * @param props.isSearchEngine - Whether the current user is a search engine bot (affects rendering)
 */
const FAQ = ({ isSearchEngine }: FAQProps) => {
  const { t } = useTranslation();

  const faqItems: FAQItem[] = useMemo(
    () => [
      {
        question: t('faq.items.howToPlay.question'),
        answer: t('faq.items.howToPlay.answer'),
      },
      {
        question: t('faq.items.difference.question'),
        answer: t('faq.items.difference.answer'),
      },
      {
        question: t('faq.items.difficultyLevels.question'),
        answer: t('faq.items.difficultyLevels.answer'),
      },
      {
        question: t('faq.items.account.question'),
        answer: t('faq.items.account.answer'),
      },
      {
        question: t('faq.items.mobile.question'),
        answer: t('faq.items.mobile.answer'),
      },
      {
        question: t('faq.items.incorrectPlacement.question'),
        answer: t('faq.items.incorrectPlacement.answer'),
      },
      {
        question: t('faq.items.languages.question'),
        answer: t('faq.items.languages.answer'),
      },
      {
        question: t('faq.items.progress.question'),
        answer: t('faq.items.progress.answer'),
      },
      {
        question: t('faq.items.sharing.question'),
        answer: t('faq.items.sharing.answer'),
      },
    ],
    [t],
  );

  const [openItems, setOpenItems] = useState<Set<number>>(
    () => new Set(isSearchEngine ? faqItems.map((_, i) => i) : [0]),
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
      <h2 className="mb-4 text-xl font-bold text-gray-900 sm:text-2xl">{t('faq.title')}</h2>
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
