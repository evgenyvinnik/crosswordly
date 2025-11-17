import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import type { StatsState } from '../../state/useProgressStore';
import CloseButton from '../icons/CloseButton';

type StatsDialogProps = {
  isOpen?: boolean;
  onRequestClose?: () => void;
  stats: StatsState;
};

const STATS_OVERLAY_STYLE =
  'fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6';
const STATS_DIALOG_CONTAINER_STYLE =
  'relative w-full max-w-xl rounded-[28px] bg-white p-6 text-[#1a1a1b] shadow-[0_30px_120px_rgba(15,23,42,0.35)] sm:p-8';
const STATS_PROGRESS_FILL_STYLE = 'absolute inset-y-0 left-0 rounded-full bg-[#0f172a] text-white';
const STATS_PROGRESS_VALUE_STYLE =
  'absolute inset-0 flex items-center justify-end px-3 text-sm sm:text-base font-semibold text-white';

export default function StatsDialog({ isOpen, onRequestClose, stats }: StatsDialogProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleClose =
    onRequestClose ||
    (() => {
      // No-op if onRequestClose is not provided
    });

  const totalSolved = Object.values(stats.solvedByWordCount).reduce((acc, value) => acc + value, 0);

  const bucketDisplay: { label: string; value: number }[] = [
    { label: t('stats.twoWords'), value: stats.solvedByWordCount.two },
    { label: t('stats.threeWords'), value: stats.solvedByWordCount.three },
    { label: t('stats.fourWords'), value: stats.solvedByWordCount.four },
    { label: t('stats.fiveWords'), value: stats.solvedByWordCount.five },
    { label: t('stats.sixWords'), value: stats.solvedByWordCount.six },
    { label: t('stats.sevenWords'), value: stats.solvedByWordCount.seven },
    { label: t('stats.eightWords'), value: stats.solvedByWordCount.eight },
  ];

  return (
    <div className={STATS_OVERLAY_STYLE} role="dialog" aria-modal="true">
      <div className="absolute inset-0" aria-hidden="true" onClick={handleClose} />
      <div className={STATS_DIALOG_CONTAINER_STYLE}>
        <header className="mb-6 flex items-start justify-between pb-4">
          <h2 className="text-2xl sm:text-4xl font-semibold text-[#1a1a1b]">{t('stats.title')}</h2>
          <CloseButton onClick={handleClose} ariaLabel={t('stats.close')} />
        </header>

        <section className="grid grid-cols-2 gap-4 text-center">
          <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-5">
            <p className="text-xl sm:text-3xl font-semibold text-[#1f1f23]">{t('stats.played')}</p>
            <p className="mt-2 text-4xl sm:text-5xl font-semibold text-[#0f172a]">
              {stats.sessionsPlayed}
            </p>
          </div>
          <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-5">
            <p className="text-xl sm:text-3xl font-semibold text-[#1f1f23]">{t('stats.solved')}</p>
            <p className="mt-2 text-4xl sm:text-5xl font-semibold text-[#0f172a]">{totalSolved}</p>
          </div>
        </section>

        <section className="mt-8">
          <h3 className="text-xl sm:text-3xl font-semibold text-[#1f1f23]">
            {t('stats.byWordCount')}
          </h3>

          <div className="mt-4 flex flex-col gap-3">
            {bucketDisplay.map((bucket) => {
              const maxValue = Math.max(...bucketDisplay.map((entry) => entry.value), 1);
              const widthPercent =
                bucket.value === 0 ? 10 : Math.max(15, (bucket.value / maxValue) * 100);

              return (
                <Fragment key={bucket.label}>
                  <div className="flex items-center gap-3">
                    <span className="w-20 sm:w-24 text-lg sm:text-2xl font-semibold text-[#1a1a1b]">
                      {bucket.label}
                    </span>
                    <div className="relative h-8 sm:h-10 flex-1 rounded-full bg-[#e2e8f0]">
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
