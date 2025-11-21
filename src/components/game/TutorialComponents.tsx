import GameDescription from './GameDescription';
import FAQ from './FAQ';

export const TutorialExtras = ({ isTutorial, isBot }: { isTutorial: boolean; isBot: boolean }) => {
  if (!isTutorial) {
    return null;
  }

  return <GameDescription isSearchEngine={isBot} />;
};

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
