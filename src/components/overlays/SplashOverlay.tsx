import { animated, type SpringValues } from '@react-spring/web';
import SplashScreen from '../SplashScreen';

type SplashOverlayProps = {
  isVisible: boolean;
  splashSpring: SpringValues<{ opacity: number }>;
  isSplashComplete: boolean;
  onComplete: () => void;
};

/**
 * Overlay component that displays the splash screen animation.
 * Manages the visibility and transition of the splash screen.
 *
 * @param props - Component properties
 * @param props.isVisible - Whether the overlay should be rendered
 * @param props.splashSpring - React Spring values for the fade-out animation
 * @param props.isSplashComplete - Whether the splash animation has finished
 * @param props.onComplete - Callback when the splash screen is fully dismissed
 */
const SplashOverlay = ({
  isVisible,
  splashSpring,
  isSplashComplete,
  onComplete,
}: SplashOverlayProps) => {
  if (!isVisible) {
    return null;
  }

  return (
    <animated.div
      style={splashSpring}
      className="absolute inset-0 z-20 bg-[#f6f5f0]"
      aria-hidden={isSplashComplete}
    >
      <SplashScreen onComplete={onComplete} />
    </animated.div>
  );
};

export default SplashOverlay;
