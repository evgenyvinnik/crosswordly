import { IconProps } from './types';

const PodiumIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    strokeWidth="1.6"
    aria-hidden="true"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 13.5h3.5V20H6zM10.75 8h2.5v12h-2.5zM15.5 11h3.5v9h-3.5z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 5.5l1.2 2.5 2.8.4-2 1.9.5 2.7L12 11.3 9.5 13l.5-2.7-2-1.9 2.8-.4z"
    />
  </svg>
);

export default PodiumIcon;
