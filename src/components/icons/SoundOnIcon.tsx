import { IconProps } from './types';

const SoundOnIcon = (props: IconProps) => (
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
      d="M4.5 9v6a1.5 1.5 0 0 0 1.5 1.5h2.25L14.25 21V3L8.25 5.25H6A1.5 1.5 0 0 0 4.5 6.75Z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5a5 5 0 0 1 0 9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 5.25a8 8 0 0 1 0 13.5" />
  </svg>
);

export default SoundOnIcon;
