import { useState } from 'react';
import SettingsMenu, { DEFAULT_SETTINGS, SettingsState } from './components/SettingsMenu';
import SplashScreen from './components/SplashScreen';

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);

  const toggleSetting = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="relative">
      <SplashScreen />

      <button
        type="button"
        className="group absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-white/20 sm:right-8 sm:top-8"
        onClick={() => setIsSettingsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isSettingsOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="h-4 w-4"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-['Karla'] tracking-[0.4em]">Settings</span>
      </button>

      {isSettingsOpen ? (
        <div
          className="fixed inset-0 z-30 flex min-h-screen items-center justify-center bg-black/60 px-4 py-10"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
            onClick={() => setIsSettingsOpen(false)}
          />
          <SettingsMenu settings={settings} onToggle={toggleSetting} onClose={() => setIsSettingsOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
