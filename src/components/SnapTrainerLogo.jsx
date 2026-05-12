import React from 'react';

export default function SnapTrainerLogo({ className = 'h-10 w-auto' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 840 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="SnapTrainer logo"
    >
      <rect width="840" height="180" fill="none" />
      <g transform="translate(24 24)">
        <rect x="0" y="0" width="132" height="132" rx="34" fill="#665CFF" />
        <path
          d="M39 43C39 36.3726 44.3726 31 51 31H82C88.6274 31 94 36.3726 94 43C94 49.6274 88.6274 55 82 55H56C46.6112 55 39 62.6112 39 72C39 81.3888 46.6112 89 56 89H81C87.6274 89 93 94.3726 93 101C93 107.627 87.6274 113 81 113H49"
          stroke="white"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="49" cy="113" r="7" fill="white" />
        <path
          d="M103.5 22L107.353 31.1469L116.5 35L107.353 38.8531L103.5 48L99.6469 38.8531L90.5 35L99.6469 31.1469L103.5 22Z"
          fill="white"
        />
      </g>
      <g transform="translate(186 40)">
        <text
          x="0"
          y="76"
          fontFamily="Inter, Arial, Helvetica, sans-serif"
          fontSize="78"
          fontWeight="600"
          letterSpacing="-2.4"
          fill="#0B1533"
        >
          Snap
        </text>
        <text
          x="186"
          y="76"
          fontFamily="Inter, Arial, Helvetica, sans-serif"
          fontSize="78"
          fontWeight="600"
          letterSpacing="-2.4"
          fill="#665CFF"
        >
          Trainer
        </text>
      </g>
    </svg>
  );
}
