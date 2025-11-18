import { useTranslation } from 'react-i18next';

type GameDescriptionProps = {
  isSearchEngine: boolean;
};

const GameDescription = ({ isSearchEngine }: GameDescriptionProps) => {
  const { t } = useTranslation();

  if (!isSearchEngine) {
    return null;
  }

  return (
    <div className="mx-auto mb-6 max-w-3xl rounded-lg bg-blue-50 p-4 text-left sm:mb-8 sm:p-6">
      <h1 className="mb-3 text-xl font-bold text-gray-900 sm:text-2xl">
        {t('gameDescription.title')}
      </h1>
      <p className="mb-3 text-sm leading-relaxed text-gray-700 sm:text-base">
        {t('gameDescription.paragraph1')}
      </p>
      <p className="mb-3 text-sm leading-relaxed text-gray-700 sm:text-base">
        {t('gameDescription.paragraph2')}
      </p>
      <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
        {t('gameDescription.paragraph3')}
      </p>
    </div>
  );
};

export default GameDescription;
