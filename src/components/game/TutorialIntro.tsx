import { useTranslation } from 'react-i18next';

const TUTORIAL_INTRO_HEADING_STYLE =
  'text-3xl font-semibold leading-tight text-[#1a1a1b] sm:text-4xl';

const TutorialIntro = () => {
  const { t } = useTranslation();

  // Split the translation to manually insert the styled A
  const greenHappyText = t('tutorial.keepGreenHappy');
  const parts = greenHappyText.split('<0>');
  const beforeA = parts[0];
  const afterParts = parts[1]?.split('</0>') || ['A', ''];
  const letterA = afterParts[0];
  const afterA = afterParts[1];

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center">
      <h1 className={TUTORIAL_INTRO_HEADING_STYLE}>{t('tutorial.title')}</h1>
      <p className="text-base text-[#4b4e52]">
        <span className="sm:hidden">{t('tutorial.tapInstruction')}</span>
        <span className="hidden sm:inline">{t('tutorial.dragInstruction')}</span>
      </p>
      <p className="text-base text-[#4b4e52]">
        {beforeA}
        <span className="font-semibold text-[#6aaa64]">{letterA}</span>
        {afterA}
      </p>
    </div>
  );
};

export default TutorialIntro;
