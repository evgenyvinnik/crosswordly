import AboutDialog from '../menu/AboutDialog';

type AboutModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * Modal component for displaying the "About" information.
 * Wraps the `AboutDialog` component.
 *
 * @param props - Component properties
 * @param props.isOpen - Whether the modal is currently open
 * @param props.onClose - Callback to close the modal
 */
const AboutModal = ({ isOpen, onClose }: AboutModalProps) => {
  if (!isOpen) {
    return null;
  }

  return <AboutDialog onClose={onClose} />;
};

export default AboutModal;
