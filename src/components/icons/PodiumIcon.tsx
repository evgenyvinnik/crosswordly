import { IconProps } from './IconTypes';

const PodiumIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
    {...props}
  >
    {/* Second place - left, medium height */}
    <rect
      x="3"
      y="12"
      width="5.5"
      height="8"
      rx="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* First place - center, tallest */}
    <rect
      x="9.25"
      y="7"
      width="5.5"
      height="13"
      rx="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Third place - right, shortest */}
    <rect
      x="15.5"
      y="14"
      width="5.5"
      height="6"
      rx="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Numbers */}
    <text
      x="5.75"
      y="17"
      fontSize="3.5"
      fontWeight="bold"
      fill="currentColor"
      textAnchor="middle"
      stroke="none"
    >
      2
    </text>
    <text
      x="12"
      y="14.5"
      fontSize="3.5"
      fontWeight="bold"
      fill="currentColor"
      textAnchor="middle"
      stroke="none"
    >
      1
    </text>
    <text
      x="18.25"
      y="17.5"
      fontSize="3.5"
      fontWeight="bold"
      fill="currentColor"
      textAnchor="middle"
      stroke="none"
    >
      3
    </text>
  </svg>
);

export default PodiumIcon;
