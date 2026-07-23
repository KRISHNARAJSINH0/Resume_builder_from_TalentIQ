import React from 'react';

export default function GapBarChart({ data = [] }) {
  if (!data || data.length === 0) {
    return <div style={{ color: 'var(--muted)', fontSize: '12px' }}>No gap data available</div>;
  }

  const height = data.length * 35 + 20;

  return (
    <div style={{ width: '100%' }}>
      <svg width="100%" height={height} viewBox={`0 0 350 ${height}`}>
        {data.map((item, idx) => {
          const y = idx * 35 + 10;
          const barWidth = Math.round((item.frequency / 100) * 180);
          
          return (
            <g key={item.name}>
              {/* Skill Name */}
              <text
                x="10"
                y={y + 16}
                fill="var(--text)"
                fontSize="11"
                fontFamily="var(--font-mono)"
                fontWeight="500"
              >
                {item.name}
              </text>

              {/* Bar Track */}
              <rect
                x="110"
                y={y + 6}
                width="180"
                height="12"
                rx="3"
                fill="var(--s2)"
              />

              {/* Bar Fill */}
              <rect
                x="110"
                y={y + 6}
                width={barWidth}
                height="12"
                rx="3"
                fill="var(--r)"
                className="chart-bar"
              />

              {/* Percentage Label */}
              <text
                x="300"
                y={y + 16}
                fill="var(--muted)"
                fontSize="10"
                fontFamily="var(--font-mono)"
              >
                {item.frequency}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
