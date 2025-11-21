import { useTranslation } from 'react-i18next';
import CloseButton from '../icons/CloseButton';

type AboutDialogProps = {
  onClose: () => void;
};

const BACKDROP_STYLE = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4';
const DIALOG_STYLE =
  'relative w-full max-w-2xl rounded-3xl border border-[#e2e5ea] bg-white p-6 sm:p-10 shadow-2xl';
const CLOSE_BUTTON_CONTAINER_STYLE = 'absolute right-4 top-4 sm:right-6 sm:top-6';

/**
 * Dialog component displaying information about the application.
 * Includes links to the source code and developer profile.
 *
 * @param props - Component properties
 * @param props.onClose - Callback to close the dialog
 */
const AboutDialog = ({ onClose }: AboutDialogProps) => {
  const { t } = useTranslation();

  return (
    <div className={BACKDROP_STYLE} onClick={onClose} role="dialog" aria-modal="true">
      <div className={DIALOG_STYLE} onClick={(e) => e.stopPropagation()}>
        <div className={CLOSE_BUTTON_CONTAINER_STYLE}>
          <CloseButton onClick={onClose} ariaLabel={t('about.close')} size="large" />
        </div>

        <h2 className="mb-6 text-3xl sm:text-4xl font-bold text-[#1a1a1b]">{t('about.title')}</h2>

        <div className="space-y-4 text-base sm:text-lg text-[#1a1a1b]/80 leading-relaxed">
          <p>{t('about.description')}</p>

          <p>
            {t('about.opensource')}{' '}
            <a
              href="https://github.com/evgenyvinnik/crosswordly"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0066cc] hover:underline font-semibold"
            >
              GitHub
            </a>
            .
          </p>

          <p>
            {t('about.follow')}{' '}
            <a
              href="https://www.linkedin.com/in/evgenyvinnik/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0066cc] hover:underline font-semibold"
            >
              LinkedIn
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutDialog;
