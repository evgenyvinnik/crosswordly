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

const SETTINGS_MENU_CONTAINER_STYLE =
  'relative w-full max-w-xl rounded-[28px] bg-white p-6 text-[#1a1a1b] shadow-[0_30px_120px_rgba(15,23,42,0.35)] sm:p-8';
const SETTINGS_CLOSE_BUTTON_STYLE =
  'flex h-11 w-11 items-center justify-center rounded-full border border-[#d3d6da] bg-white/85 text-[#1a1a1b] shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1b]/40';

export default function SettingsMenu({ settings, onToggle, onClose }: SettingsMenuProps) {
  return (
    <div className={SETTINGS_MENU_CONTAINER_STYLE}>
      <header className="mb-6 flex items-start justify-between pb-4">
        <h2 className="text-lg font-semibold text-[#1a1a1b]">Settings</h2>
        <button
          type="button"
          className={SETTINGS_CLOSE_BUTTON_STYLE}
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
