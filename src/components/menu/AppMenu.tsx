import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MenuIcon from '../icons/MenuIcon';
import SettingsIcon from '../icons/SettingsIcon';
import PodiumIcon from '../icons/PodiumIcon';
import CloseIcon from '../icons/CloseIcon';

type AppMenuProps = {
  onOpenSettings: () => void;
  onOpenStats: () => void;
};

const MENU_TRIGGER_STYLE =
  'flex h-11 w-11 sm:h-16 sm:w-16 items-center justify-center rounded-full border border-[#d3d6da] bg-white/90 text-[#1a1a1b] shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1b]/40';

const MENU_PANEL_STYLE =
  'flex flex-col gap-1 sm:gap-2 rounded-2xl border border-[#d3d6da] bg-white/95 p-3 sm:p-5 text-left shadow-lg';

const MENU_ITEM_STYLE =
  'flex items-center gap-3 sm:gap-4 rounded-xl px-3 py-2 sm:px-6 sm:py-4 text-sm sm:text-2xl font-semibold text-[#1a1a1b] transition hover:bg-[#f6f5f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1b]/40';

const MOBILE_DRAWER_STYLE =
  'relative flex h-full w-72 max-w-[80%] flex-col bg-white p-6 shadow-2xl';

const MOBILE_CLOSE_BUTTON_STYLE =
  'absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#d3d6da] bg-white/85 text-[#1a1a1b] shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1b]/40';

const MOBILE_MENU_ITEM_STYLE =
  'flex items-center gap-4 rounded-2xl border border-[#e5e7eb] px-4 py-2 text-left text-2xl font-semibold text-[#1a1a1b]';

const AppMenu = ({ onOpenSettings, onOpenStats }: AppMenuProps) => {
  const { t } = useTranslation();
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
        <MenuIcon className="h-5 w-5 sm:h-8 sm:w-8" />
        <span className="sr-only">{t('menu.open')}</span>
      </button>

      <div
        id={menuId}
        className={`app-menu-panel absolute left-0 top-full mt-3 hidden origin-top-left transition md:block ${
          isOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
        }`}
      >
        <div className={MENU_PANEL_STYLE} role="menu" aria-label="Game menu">
          <button
            type="button"
            className={MENU_ITEM_STYLE}
            onClick={() => selectAndClose(onOpenSettings)}
          >
            <SettingsIcon className="h-4 w-4 sm:h-7 sm:w-7" />
            {t('menu.settings')}
          </button>
          <button
            type="button"
            className={MENU_ITEM_STYLE}
            onClick={() => selectAndClose(onOpenStats)}
          >
            <PodiumIcon className="h-4 w-4 sm:h-7 sm:w-7" />
            {t('menu.stats')}
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-30 flex md:hidden" aria-modal="true" role="dialog">
          <div className={MOBILE_DRAWER_STYLE}>
            <button
              type="button"
              className={MOBILE_CLOSE_BUTTON_STYLE}
              onClick={() => setIsOpen(false)}
              aria-label={t('menu.close')}
            >
              <CloseIcon className="h-5 w-5" />
            </button>
            <p className="mb-6 text-3xl font-semibold text-[#1a1a1b] sm:text-4xl">
              {t('menu.title')}
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                className={MOBILE_MENU_ITEM_STYLE}
                onClick={() => selectAndClose(onOpenSettings)}
              >
                <SettingsIcon className="h-7 w-7" />
                {t('menu.settings')}
              </button>
              <button
                type="button"
                className={MOBILE_MENU_ITEM_STYLE}
                onClick={() => selectAndClose(onOpenStats)}
              >
                <PodiumIcon className="h-7 w-7" />
                {t('menu.stats')}
              </button>
            </div>
          </div>
          <button
            type="button"
            className="flex-1 bg-black/30"
            onClick={() => setIsOpen(false)}
            aria-label={t('menu.close')}
          />
        </div>
      ) : null}
    </div>
  );
};

export default AppMenu;
