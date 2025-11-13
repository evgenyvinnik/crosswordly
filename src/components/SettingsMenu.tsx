import CloseIcon from './icons/CloseIcon';

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
};

export default function SettingsMenu({ settings, onToggle, onClose }: SettingsMenuProps) {
  return (
    <div className="relative w-full max-w-xl rounded-[28px] bg-white p-6 text-[#1a1a1b] shadow-[0_30px_120px_rgba(15,23,42,0.35)] sm:p-8">
      <header className="mb-6 flex items-center justify-between border-b border-black/5 pb-4">
        <span className="text-xs font-semibold tracking-[0.4em] text-[#b2b4ba]">SETTINGS</span>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-[#6c6e74] transition-colors duration-200 hover:border-black/30 hover:text-black"
          aria-label="Close settings"
          onClick={onClose}
        >
          <CloseIcon className="h-5 w-5" />
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
              aria-checked={settings[id]}
              onClick={() => onToggle(id)}
              className={`settings-toggle ${settings[id] ? 'is-on' : ''}`}
            >
              <span className="sr-only">Toggle {name}</span>
              <span className="toggle-thumb" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
