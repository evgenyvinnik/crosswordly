type LevelIntroProps = {
  title: string;
  description: string;
};

export default function LevelIntro({ title, description }: LevelIntroProps) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center text-[#1a1a1b]">
      <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{title}</h1>
      <p className="mt-2 text-base text-[#4b4e52]">{description}</p>
    </div>
  );
}
