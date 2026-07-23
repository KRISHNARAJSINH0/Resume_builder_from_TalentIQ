import React from 'react';

export default function HeatmapChart() {
  const roles = ['Frontend', 'Backend', 'Data Eng', 'ML Eng'];
  const skills = ['React', 'Python', 'Node.js', 'PostgreSQL', 'Docker'];

  // short/demand matrix (density 0 to 10)
  const matrix = [
    [9, 2, 7, 3, 5], // Frontend: React high, Python low, Node high, Postgres low, Docker med
    [4, 8, 9, 8, 7], // Backend: React low, Python high, Node high, Postgres high, Docker med-high
    [2, 9, 4, 9, 8], // Data Eng: Python high, Postgres high, Docker high
    [3, 10, 2, 6, 7] // ML Eng: Python max, Postgres med, Docker med-high
  ];

  const cellWidth = 50;
  const cellHeight = 25;
  const paddingLeft = 70;
  const paddingTop = 25;

  const getColor = (val) => {
    // scale from 0 to 10
    const opacity = (val / 10) * 0.8 + 0.1;
    return `rgba(123, 111, 255, ${opacity})`;
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg width="350" height="150" viewBox="0 0 350 150">
        {/* Render Column headers (skills) */}
        {skills.map((skill, idx) => (
          <text
            key={skill}
            x={paddingLeft + idx * cellWidth + cellWidth / 2}
            y="15"
            fontSize="8"
            fontFamily="var(--font-mono)"
            fill="var(--muted)"
            textAnchor="middle"
          >
            {skill}
          </text>
        ))}

        {/* Render Row headers (roles) */}
        {roles.map((role, rIdx) => (
          <text
            key={role}
            x="10"
            y={paddingTop + rIdx * cellHeight + cellHeight / 2 + 3}
            fontSize="9"
            fontFamily="var(--font-mono)"
            fill="var(--text)"
            alignmentBaseline="middle"
          >
            {role}
          </text>
        ))}

        {/* Render Heatmap grid */}
        {roles.map((_, rIdx) =>
          skills.map((_, cIdx) => {
            const val = matrix[rIdx][cIdx];
            const x = paddingLeft + cIdx * cellWidth;
            const y = paddingTop + rIdx * cellHeight;
            const color = getColor(val);

            return (
              <g key={`${rIdx}-${cIdx}`}>
                <rect
                  x={x}
                  y={y}
                  width={cellWidth - 2}
                  height={cellHeight - 2}
                  rx="3"
                  fill={color}
                  stroke="var(--border)"
                  strokeWidth="0.5"
                />
                <text
                  x={x + cellWidth / 2}
                  y={y + cellHeight / 2 + 3}
                  fontSize="8"
                  fontWeight="600"
                  fontFamily="var(--font-mono)"
                  fill={val > 6 ? '#fff' : 'var(--muted)'}
                  textAnchor="middle"
                >
                  {val * 10}%
                </text>
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
}
