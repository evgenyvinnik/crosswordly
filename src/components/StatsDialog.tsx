import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import type { StatsState } from '../state/useProgressStore';

type StatsDialogProps = {
  isOpen?: boolean;
  onRequestClose?: () => void;
  stats: StatsState;
};

const STATS_OVERLAY_STYLE =
  'fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6';
const STATS_DIALOG_CONTAINER_STYLE =
  'relative w-full max-w-md rounded-2xl border border-white/20 bg-white p-6 text-[#0f172a] shadow-2xl';
const STATS_HEADER_STYLE =
  'flex items-center justify-center text-xs font-semibold tracking-[0.35em] text-[#475569]';
const STATS_CLOSE_BUTTON_STYLE =
  'absolute right-4 top-4 rounded-full p-1 text-[#94a3b8] transition hover:bg-slate-100 hover:text-slate-600';
const STATS_PROGRESS_FILL_STYLE = 'absolute inset-y-0 left-0 rounded-full bg-[#0f172a] text-white';
const STATS_PROGRESS_VALUE_STYLE =
  'absolute inset-0 flex items-center justify-end px-3 text-sm font-semibold text-white';

export default function StatsDialog({ isOpen = true, onRequestClose, stats }: StatsDialogProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const totalSolved = Object.values(stats.solvedByWordCount).reduce((acc, value) => acc + value, 0);

  const bucketDisplay: { label: string; value: number }[] = [
    { label: t('stats.twoWords'), value: stats.solvedByWordCount.two },
    { label: t('stats.threeWords'), value: stats.solvedByWordCount.three },
    { label: t('stats.fourWords'), value: stats.solvedByWordCount.four },
    { label: t('stats.fourPlusWords'), value: stats.solvedByWordCount.more },
  ];

  return (
    <div className={STATS_OVERLAY_STYLE} role="dialog" aria-modal="true">
      <div className="absolute inset-0" aria-hidden="true" onClick={onRequestClose} />
      <div className={STATS_DIALOG_CONTAINER_STYLE}>
        <header className={STATS_HEADER_STYLE}>{t('stats.title')}</header>

        <button
          aria-label={t('stats.close')}
          onClick={onRequestClose}
          className={STATS_CLOSE_BUTTON_STYLE}
        >
          <span aria-hidden className="text-lg">
            &times;
          </span>
        </button>

        <section className="mt-6 grid grid-cols-2 gap-4 text-center">
          <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#94a3b8]">
              {t('stats.played')}
            </p>
            <p className="mt-2 text-4xl font-semibold text-[#0f172a]">{stats.sessionsPlayed}</p>
          </div>
          <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#94a3b8]">
              {t('stats.solved')}
            </p>
            <p className="mt-2 text-4xl font-semibold text-[#0f172a]">{totalSolved}</p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-center text-xs font-semibold tracking-[0.35em] text-[#94a3b8]">
            {t('stats.byWordCount')}
          </h2>

          <div className="mt-4 flex flex-col gap-3">
            {bucketDisplay.map((bucket) => {
              const maxValue = Math.max(...bucketDisplay.map((entry) => entry.value), 1);
              const widthPercent =
                bucket.value === 0 ? 10 : Math.max(15, (bucket.value / maxValue) * 100);

              return (
                <Fragment key={bucket.label}>
                  <div className="flex items-center gap-3">
                    <span className="w-20 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                      {bucket.label}
                    </span>
                    <div className="relative h-8 flex-1 rounded-full bg-[#e2e8f0]">
                      <div
                        className={STATS_PROGRESS_FILL_STYLE}
                        style={{ width: `${widthPercent}%` }}
                      />
                      <span className={STATS_PROGRESS_VALUE_STYLE}>{bucket.value}</span>
                    </div>
                  </div>
                </Fragment>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
