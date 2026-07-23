import React from 'react';

export default function ReadinessGauge({ score = 74 }) {
  // SVG gauge constants
  const radius = 50;
  const strokeWidth = 10;
  const circumference = Math.PI * radius; // semi-circle
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = 'var(--r)'; // red
  let label = 'Not Ready';
  if (score >= 70) {
    color = 'var(--g)'; // green
    label = 'Ready to Apply';
  } else if (score >= 40) {
    color = 'var(--a)'; // amber
    label = 'Getting There';
  }

  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <svg width="180" height="110" viewBox="0 0 120 70" className="gauge-svg">
        {/* Track */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          className="gauge-track"
        />
        {/* Fill */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          className="gauge-fill"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
            stroke: color
          }}
        />
        {/* Center Text */}
        <text x="60" y="55" textAnchor="middle" className="gauge-text" style={{ transform: 'rotate(180deg)', transformOrigin: '60px 55px' }}>
          {score}%
        </text>
      </svg>
      <div style={{ color: color, fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '-10px' }}>
        {label}
      </div>
    </div>
  );
}
