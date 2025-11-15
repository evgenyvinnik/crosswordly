import { useEffect, useId, useRef, useState } from 'react';
import MenuIcon from './icons/MenuIcon';
import SettingsIcon from './icons/SettingsIcon';
import PodiumIcon from './icons/PodiumIcon';
import CloseIcon from './icons/CloseIcon';

type AppMenuProps = {
  onOpenSettings: () => void;
  onOpenStats: () => void;
};

const MENU_TRIGGER_STYLE =
  'flex h-11 w-11 items-center justify-center rounded-full border border-[#d3d6da] bg-white/90 text-[#1a1a1b] shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1b]/40';

const MENU_PANEL_STYLE =
  'flex flex-col gap-1 rounded-2xl border border-[#d3d6da] bg-white/95 p-3 text-left shadow-lg';

const MENU_ITEM_STYLE =
  'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-[#1a1a1b] transition hover:bg-[#f6f5f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1b]/40';

const AppMenu = ({ onOpenSettings, onOpenStats }: AppMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectAndClose = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className={MENU_TRIGGER_STYLE}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => setIsOpen((open) => !open)}
      >
        <MenuIcon className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </button>

      <div
        id={menuId}
        className={`absolute left-0 top-full mt-3 hidden origin-top-left transition md:block ${
          isOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
        }`}
      >
        <div className={MENU_PANEL_STYLE} role="menu" aria-label="Game menu">
          <button
            type="button"
            className={MENU_ITEM_STYLE}
            onClick={() => selectAndClose(onOpenSettings)}
          >
            <SettingsIcon className="h-4 w-4" />
            Settings
          </button>
          <button
            type="button"
            className={MENU_ITEM_STYLE}
            onClick={() => selectAndClose(onOpenStats)}
          >
            <PodiumIcon className="h-4 w-4" />
            Stats
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-30 flex md:hidden" aria-modal="true" role="dialog">
          <div className="relative flex h-full w-72 max-w-[80%] flex-col bg-white p-6 shadow-2xl">
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full border border-[#d3d6da] bg-white/90 p-2 text-[#1a1a1b] shadow-sm"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
            <p className="mb-6 text-lg font-semibold text-[#1a1a1b]">Menu</p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                className="flex items-center gap-4 rounded-2xl border border-[#e5e7eb] px-4 py-3 text-left text-base font-semibold text-[#1a1a1b]"
                onClick={() => selectAndClose(onOpenSettings)}
              >
                <SettingsIcon className="h-5 w-5" />
                Settings
              </button>
              <button
                type="button"
                className="flex items-center gap-4 rounded-2xl border border-[#e5e7eb] px-4 py-3 text-left text-base font-semibold text-[#1a1a1b]"
                onClick={() => selectAndClose(onOpenStats)}
              >
                <PodiumIcon className="h-5 w-5" />
                Stats
              </button>
            </div>
          </div>
          <button
            type="button"
            className="flex-1 bg-black/30"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          />
        </div>
      ) : null}
    </div>
  );
};

export default AppMenu;
