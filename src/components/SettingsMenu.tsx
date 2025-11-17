import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CloseButton from './CloseButton';
import LanguageSwitcher from './LanguageSwitcher';

type SettingConfig = {
  id: string;
  name: string;
  description: string;
};

const SETTINGS: SettingConfig[] = [];

export type SettingsState = Record<string, boolean>;

export const DEFAULT_SETTINGS: SettingsState = SETTINGS.reduce(
  (acc, { id }) => ({
    ...acc,
    [id]: false,
  }),
  {} as SettingsState,
);

type SettingsMenuProps = {
  settings: SettingsState;
  onToggle: (id: string) => void;
  onClose: () => void;
  onEraseProgress: () => void;
};

const SETTINGS_MENU_CONTAINER_STYLE =
  'relative w-full max-w-xl rounded-[28px] bg-white p-6 text-[#1a1a1b] shadow-[0_30px_120px_rgba(15,23,42,0.35)] sm:p-8';
const ERASE_PROGRESS_BUTTON_STYLE =
  'erase-progress-button w-full rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-left text-xl sm:text-2xl font-semibold text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500';
const CONFIRMATION_OVERLAY_STYLE =
  'fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6';
const CONFIRMATION_DIALOG_STYLE =
  'relative w-full max-w-md rounded-2xl border border-white/20 bg-white p-6 text-center shadow-2xl';
const CONFIRMATION_BUTTON_STYLE =
  'flex-1 rounded-xl px-6 py-3 text-xl sm:text-2xl font-semibold transition focus-visible:outline-none focus-visible:ring-2';

export default function SettingsMenu({
  settings,
  onToggle,
  onClose,
  onEraseProgress,
}: SettingsMenuProps) {
  const { t } = useTranslation();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleEraseProgress = () => {
    onEraseProgress();
    setShowConfirmation(false);
    onClose();
  };

  return (
    <>
      <div className={SETTINGS_MENU_CONTAINER_STYLE}>
        <header className="mb-6 flex items-start justify-between pb-4">
          <h2 className="text-2xl sm:text-4xl font-semibold text-[#1a1a1b]">
            {t('settings.title')}
          </h2>
          <CloseButton onClick={onClose} ariaLabel={t('settings.close')} />
        </header>

        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <p className="text-xl sm:text-3xl font-semibold text-[#1f1f23]">
                {t('settings.language')}
              </p>
              <p className="mt-1 text-lg sm:text-2xl leading-relaxed text-[#6d6f76]">
                {t('settings.languageDescription')}
              </p>
            </div>
            <LanguageSwitcher />
          </div>

          {SETTINGS.map(({ id, name, description }) => (
            <div key={id} className="flex items-start justify-between gap-6">
              <div className="space-y-1">
                <p className="text-xl sm:text-3xl font-semibold text-[#1f1f23]">{name}</p>
                {description ? (
                  <p className="text-lg sm:text-2xl leading-relaxed text-[#6d6f76]">
                    {description}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={settings[id]}
                onClick={() => onToggle(id)}
                className={`settings-toggle ${settings[id] ? 'is-on' : ''}`}
              >
                <span className="sr-only">Toggle {name}</span>
                <span className="toggle-thumb" aria-hidden />
              </button>
            </div>
          ))}

          <div className="border-t border-[#e2e8f0] pt-6">
            <button
              type="button"
              className={ERASE_PROGRESS_BUTTON_STYLE}
              onClick={() => setShowConfirmation(true)}
            >
              {t('settings.eraseProgress')}
            </button>
          </div>
        </div>
      </div>

      {showConfirmation ? (
        <div className={CONFIRMATION_OVERLAY_STYLE} role="dialog" aria-modal="true">
          <div className="absolute inset-0" onClick={() => setShowConfirmation(false)} />
          <div className={CONFIRMATION_DIALOG_STYLE}>
            <h3 className="text-2xl sm:text-4xl font-semibold text-[#1a1a1b]">
              {t('settings.confirmTitle')}
            </h3>
            <p className="mt-3 text-xl sm:text-2xl text-[#4b4e52]">
              {t('settings.confirmMessage')}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className={`${CONFIRMATION_BUTTON_STYLE} border border-[#d3d6da] bg-white text-[#1a1a1b] hover:bg-gray-50`}
                onClick={() => setShowConfirmation(false)}
              >
                {t('settings.cancel')}
              </button>
              <button
                type="button"
                className={`${CONFIRMATION_BUTTON_STYLE} bg-red-600 text-white hover:bg-red-700`}
                onClick={handleEraseProgress}
              >
                {t('settings.erase')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
