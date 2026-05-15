import React from 'react';

/**
 * Full SnapTrainer wordmark: graphite/mint diamond icon + "SnapTrainer" text.
 * Uses the brand image asset shipped in /public/brand/.
 */
export default function SnapTrainerLogo({ className = 'h-10 w-auto' }) {
  return (
    <img
      src="/brand/snaptrainer-logo.jpg"
      alt="SnapTrainer"
      className={className}
      draggable={false}
    />
  );
}
