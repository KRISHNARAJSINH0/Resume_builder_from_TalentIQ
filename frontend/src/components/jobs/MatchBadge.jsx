import React from 'react';

export default function MatchBadge({ percentage = 80 }) {
  let badgeColorClass = 'bg'; // green
  if (percentage < 50) {
    badgeColorClass = 'br'; // red
  } else if (percentage < 80) {
    badgeColorClass = 'ba'; // amber
  }

  return (
    <span 
      className={`badge ${badgeColorClass}`}
      style={{
        padding: '3px 8px',
        fontSize: '11px',
        fontWeight: '700',
        borderRadius: '4px'
      }}
    >
      {percentage}% Match
    </span>
  );
}
