type DirectionCardProps = {
  title: string;
  completedDefinition?: string;
  completedClueNumber?: number;
  hasCompletedEntry: boolean;
  isHighlighted: boolean;
};

const DirectionCard = ({
  title,
  completedDefinition,
  completedClueNumber,
  hasCompletedEntry,
  isHighlighted,
}: DirectionCardProps) => {
  return (
    <div
      className={`mt-4 rounded-2xl border px-4 py-5 text-left transition ${
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
    </div>
  );
};

export default DirectionCard;
