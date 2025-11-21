import type { ReactNode } from 'react';

const SETTINGS_OVERLAY_STYLE =
  'fixed inset-0 z-30 flex min-h-screen items-center justify-center bg-[#f6f5f0]/90 px-4 py-10 backdrop-blur-sm';

type SettingsOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

const SettingsOverlay = ({ isOpen, onClose, children }: SettingsOverlayProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={SETTINGS_OVERLAY_STYLE} role="dialog" aria-modal="true">
      <div className="absolute inset-0 h-full w-full" aria-hidden="true" onClick={onClose} />
      {children}
    </div>
  );
};

export default SettingsOverlay;
