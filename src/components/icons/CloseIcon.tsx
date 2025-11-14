import { IconProps } from './IconTypes';

const CloseIcon = ({ strokeWidth = 1.8, ...props }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    aria-hidden="true"
    {...props}
  >
    <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="6" y1="18" x2="18" y2="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default CloseIcon;
