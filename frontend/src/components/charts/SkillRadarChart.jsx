import React from 'react';

export default function SkillRadarChart({ categories = [] }) {
  if (!categories || categories.length === 0) {
    return <div style={{ color: 'var(--muted)', fontSize: '12px' }}>No performance data available</div>;
  }

  const width = 300;
  const height = 240;
  const cx = width / 2;
  const cy = height / 2 - 10;
  const r = 80;

  // Calculate polygon points based on category score
  const getCoordinates = (idx, total, value) => {
    const angle = (Math.PI * 2 / total) * idx - Math.PI / 2;
    const factor = value / 100;
    return {
      x: cx + r * factor * Math.cos(angle),
      y: cy + r * factor * Math.sin(angle)
    };
  };

  const getLabelCoordinates = (idx, total) => {
    const angle = (Math.PI * 2 / total) * idx - Math.PI / 2;
    return {
      x: cx + (r + 16) * Math.cos(angle),
      y: cy + (r + 10) * Math.sin(angle)
    };
  };

  // Build grid lines
  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const total = categories.length;

  const points = categories.map((cat, idx) => {
    const coords = getCoordinates(idx, total, cat.score);
    return `${coords.x},${coords.y}`;
  }).join(' ');

  const idealPoints = categories.map((_, idx) => {
    const coords = getCoordinates(idx, total, 95);
    return `${coords.x},${coords.y}`;
  }).join(' ');

  return (
    <div style={{ width: '100%' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Radar concentric grids */}
        {gridLevels.map((lvl) => {
          const gridPoints = categories.map((_, idx) => {
            const angle = (Math.PI * 2 / total) * idx - Math.PI / 2;
            const x = cx + r * lvl * Math.cos(angle);
            const y = cy + r * lvl * Math.sin(angle);
            return `${x},${y}`;
          }).join(' ');
          
          return (
            <polygon
              key={lvl}
              points={gridPoints}
              className="radar-grid"
            />
          );
        })}

        {/* Axis lines */}
        {categories.map((_, idx) => {
          const endCoords = getCoordinates(idx, total, 100);
          return (
            <line
              key={idx}
              x1={cx}
              y1={cy}
              x2={endCoords.x}
              y2={endCoords.y}
              className="radar-axis"
            />
          );
        })}

        {/* Ideal benchmark area */}
        <polygon points={idealPoints} className="radar-polygon-ideal" />

        {/* Candidate actual score polygon */}
        <polygon points={points} className="radar-polygon" />

        {/* Labels and values */}
        {categories.map((cat, idx) => {
          const coords = getLabelCoordinates(idx, total);
          const scoreCoords = getCoordinates(idx, total, cat.score);
          
          let textAnchor = 'middle';
          if (coords.x < cx - 10) textAnchor = 'end';
          else if (coords.x > cx + 10) textAnchor = 'start';

          return (
            <g key={idx}>
              <text
                x={coords.x}
                y={coords.y + 4}
                className="radar-label"
                textAnchor={textAnchor}
                fill="var(--text)"
              >
                {cat.name}
              </text>
              {/* Score label near the point */}
              <circle cx={scoreCoords.x} cy={scoreCoords.y} r="3" fill="var(--t)" />
              <text
                x={scoreCoords.x}
                y={scoreCoords.y - 6}
                fontSize="8"
                fontWeight="700"
                fontFamily="var(--font-mono)"
                fill="var(--t)"
                textAnchor="middle"
              >
                {cat.score}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
