import AboutDialog from '../menu/AboutDialog';

type AboutModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AboutModal = ({ isOpen, onClose }: AboutModalProps) => {
  if (!isOpen) {
    return null;
  }

  return <AboutDialog onClose={onClose} />;
};

export default AboutModal;
