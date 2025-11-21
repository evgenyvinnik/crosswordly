import { animated, type SpringValues } from '@react-spring/web';
import SplashScreen from '../SplashScreen';

type SplashOverlayProps = {
  isVisible: boolean;
  splashSpring: SpringValues<{ opacity: number }>;
  isSplashComplete: boolean;
  onComplete: () => void;
};

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
