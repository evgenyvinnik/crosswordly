import GameDescription from './GameDescription';
import FAQ from './FAQ';

/**
 * Renders extra content for the tutorial level, such as the game description.
 *
 * @param props - Component properties
 * @param props.isTutorial - Whether the current level is the tutorial
 * @param props.isBot - Whether the current user is a search engine bot
 */
export const TutorialExtras = ({ isTutorial, isBot }: { isTutorial: boolean; isBot: boolean }) => {
  if (!isTutorial) {
    return null;
  }

  return <GameDescription isSearchEngine={isBot} />;
};

/**
 * Renders the FAQ section for the tutorial level.
 *
 * @param props - Component properties
 * @param props.isTutorial - Whether the current level is the tutorial
 * @param props.isBot - Whether the current user is a search engine bot
 */
export const TutorialFaq = ({ isTutorial, isBot }: { isTutorial: boolean; isBot: boolean }) => {
  if (!isTutorial) {
    return null;
  }

  return (
    <div className="mt-6 w-full sm:mt-8">
      <FAQ isSearchEngine={isBot} />
    </div>
  );
};
