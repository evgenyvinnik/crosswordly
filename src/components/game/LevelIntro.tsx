type LevelIntroProps = {
  title: string;
  description: string;
};

const LEVEL_INTRO_CONTAINER_STYLE =
  'mx-auto flex max-w-3xl flex-col items-center text-center text-[#1a1a1b]';
const LEVEL_INTRO_HEADING_STYLE = 'mt-3 text-3xl font-semibold leading-tight sm:text-4xl';

export default function LevelIntro({ title, description }: LevelIntroProps) {
  return (
    <div className={LEVEL_INTRO_CONTAINER_STYLE}>
      <h1 className={LEVEL_INTRO_HEADING_STYLE}>{title}</h1>
      <p className="mt-2 text-base text-[#4b4e52]">{description}</p>
    </div>
  );
}
