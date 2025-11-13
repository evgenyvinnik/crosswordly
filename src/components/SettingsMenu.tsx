import { useState } from 'react';

type SettingConfig = {
  id: string;
  name: string;
  description: string;
};

const SETTINGS: SettingConfig[] = [
  {
    id: 'hard',
    name: 'Hard Mode',
    description: 'Any revealed hints must be used in subsequent guesses.',
  },
  {
    id: 'dark',
    name: 'Dark Theme',
    description: '',
  },
  {
    id: 'contrast',
    name: 'High Contrast Mode',
    description: 'Contrast and colorblindness improvements',
  },
  {
    id: 'keyboard',
    name: 'Onscreen Keyboard Input Only',
    description:
      'Ignore key input except from the onscreen keyboard. Most helpful for users using speech recognition or other assistive devices.',
  },
];

export default function SettingsMenu() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    hard: false,
    dark: false,
    contrast: false,
    keyboard: false,
  });

  const toggleSetting = (id: string) => {
    setToggles((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f3f7] px-4 py-10 text-[#1a1a1b]">
      <div className="relative w-full max-w-xl rounded-[28px] bg-white p-6 shadow-[0_30px_120px_rgba(15,23,42,0.2)] sm:p-8">
        <header className="mb-6 flex items-center justify-between border-b border-black/5 pb-4">
          <span className="text-xs font-semibold tracking-[0.4em] text-[#b2b4ba]">SETTINGS</span>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-[#6c6e74] transition-colors duration-200 hover:border-black/30 hover:text-black"
            aria-label="Close settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m6 6 12 12M6 18 18 6" />
            </svg>
          </button>
        </header>

        <div className="space-y-6">
          {SETTINGS.map(({ id, name, description }) => (
            <div key={id} className="flex items-start justify-between gap-6">
              <div className="space-y-1">
                <p className="text-base font-semibold text-[#1f1f23]">{name}</p>
                {description ? (
                  <p className="text-sm leading-relaxed text-[#6d6f76]">{description}</p>
                ) : null}
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={toggles[id]}
                onClick={() => toggleSetting(id)}
                className={`settings-toggle ${toggles[id] ? 'is-on' : ''}`}
              >
                <span className="sr-only">Toggle {name}</span>
                <span className="toggle-thumb" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
