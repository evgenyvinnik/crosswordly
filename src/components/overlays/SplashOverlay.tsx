import { ViewTransition } from 'react';
import SplashScreen from '../SplashScreen';

type SplashOverlayProps = {
  isVisible: boolean;
  onComplete: () => void;
};

/**
 * Overlay component that displays the splash screen animation.
 * Fades out when it is removed inside a transition.
 *
 * @param props - Component properties
 * @param props.isVisible - Whether the overlay should be rendered
 * @param props.onComplete - Callback when the splash animation has finished
 */
const SplashOverlay = ({ isVisible, onComplete }: SplashOverlayProps) => {
  if (!isVisible) {
    return null;
  }

  return (
    <ViewTransition exit="splash-exit" default="none">
      <div className="absolute inset-0 z-20 bg-[#f6f5f0]">
        <SplashScreen onComplete={onComplete} />
      </div>
    </ViewTransition>
  );
};

export default SplashOverlay;
