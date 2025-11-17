import { useTranslation } from 'react-i18next';
import CloseIcon from './icons/CloseIcon';
import { CLOSE_BUTTON_STYLE } from '../styles/constants';

type CloseButtonProps = {
  onClick: () => void;
  ariaLabel?: string;
  size?: 'small' | 'large';
  className?: string;
};

/**
 * Reusable close button component used in dialogs and modals
 */
export default function CloseButton({
  onClick,
  ariaLabel,
  size = 'large',
  className,
}: CloseButtonProps) {
  const { t } = useTranslation();
  const iconClassName = size === 'large' ? 'h-5 w-5 sm:h-10 sm:w-10' : 'h-5 w-5';
  const finalAriaLabel = ariaLabel || t('settings.close');

  return (
    <button
      type="button"
      className={className || CLOSE_BUTTON_STYLE}
      aria-label={finalAriaLabel}
      onClick={onClick}
    >
      <CloseIcon className={iconClassName} />
    </button>
  );
}
