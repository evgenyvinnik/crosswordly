type DirectionCardEntry = {
  key: string | number;
  clueNumber?: number;
  isCompleted: boolean;
  description?: string;
};

type DirectionCardProps = {
  title: string;
  entries: DirectionCardEntry[];
  isHighlighted: boolean;
};

const DirectionCard = ({ title, entries, isHighlighted }: DirectionCardProps) => (
  <div
    className={`mt-4 rounded-2xl border px-4 py-5 text-left transition ${
      isHighlighted ? 'border-[#6aaa64] bg-[#f4faf3]' : 'border-[#e2e5ea] bg-white'
    }`}
  >
    <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#1a1a1b]">{title}</p>
    <div className="mt-4 min-h-[3.5rem] space-y-3">
      {entries.length ? (
        <ol className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.key} className="flex items-start gap-3 text-base leading-relaxed">
              <span className="min-w-[2.5rem] text-sm font-semibold uppercase tracking-wide text-[#5a5e64]">
                {entry.clueNumber != null ? `${entry.clueNumber}.` : '—'}
              </span>
              <span className={`flex-1 ${entry.isCompleted ? 'text-[#1f2124]' : 'text-[#8b929a]'}`}>
                {entry.isCompleted ? (entry.description ?? 'Clue solved!') : null}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-base text-[#8b929a]">No clues for this direction.</p>
      )}
    </div>
  </div>
);

export default DirectionCard;
