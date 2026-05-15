import React from 'react';

/**
 * SnapTrainer brand icon — just the mint lightning diamond, no wordmark.
 * Used in headers and other tight UI spots where the full logo is too wide.
 */
export default function SnapTrainerIcon({ className = 'h-9 w-9' }) {
  return (
    <img src="https://media.base44.com/images/public/6a03899410cdfd21b8008115/d3cb43a27_SnapTrainer_icon-removebg-preview.png"

    alt="SnapTrainer"
    className={`${className} rounded-lg object-contain`}
    draggable={false} />);


}