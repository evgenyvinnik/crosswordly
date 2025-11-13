type TutorialDirectionCardBaseProps = {
  title: string;
  completedDefinition?: string;
  completedClueNumber?: number;
  hasCompletedEntry: boolean;
  isHighlighted: boolean;
  showActiveWord: boolean;
  activeWordDefinition?: string;
};

const TutorialDirectionCardBase = ({
  title,
  completedDefinition,
  completedClueNumber,
  hasCompletedEntry,
  isHighlighted,
  showActiveWord,
  activeWordDefinition,
}: TutorialDirectionCardBaseProps) => {
  return (
    <div
      className={`rounded-2xl border px-4 py-5 text-left transition ${
        isHighlighted ? 'border-[#6aaa64] bg-[#f4faf3]' : 'border-[#e2e5ea] bg-white'
      }`}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#1a1a1b]">{title}</p>
      <div className="mt-4 min-h-[3.5rem] space-y-3">
        {hasCompletedEntry ? (
          <p className="text-base leading-relaxed text-[#1f2124]">
            <span className="mr-2 font-semibold text-[#1a1a1b]">
              {completedClueNumber != null ? `${completedClueNumber}.` : ''}
            </span>
            {completedDefinition ?? 'No clue available.'}
          </p>
        ) : null}
      </div>
      {isHighlighted && showActiveWord ? (
        <div className="mt-4 rounded-xl border border-dashed border-[#d6dadf] bg-white/80 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8c8f94]">
            Trying your tile
          </p>
          <p className="mt-1 text-base leading-relaxed text-[#1f2124]">
            {activeWordDefinition ?? 'No description available.'}
          </p>
        </div>
      ) : null}
    </div>
  );
};

type TutorialDirectionCardProps = {
  completedDefinition?: string;
  completedClueNumber?: number;
  hasCompletedEntry: boolean;
  isHighlighted: boolean;
  showActiveWord: boolean;
  activeWordDefinition?: string;
};

export const TutorialAcrossCard = (props: TutorialDirectionCardProps) => (
  <TutorialDirectionCardBase title="Across" {...props} />
);

export const TutorialDownCard = (props: TutorialDirectionCardProps) => (
  <TutorialDirectionCardBase title="Down" {...props} />
);

export default TutorialDirectionCardBase;
