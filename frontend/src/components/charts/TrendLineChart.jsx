import React from 'react';

export default function TrendLineChart({ data = [], color = 'var(--v)', showForecast = false }) {
  if (!data || data.length === 0) {
    return <div style={{ color: 'var(--muted)', fontSize: '12px' }}>No trend data available</div>;
  }

  const width = 360;
  const height = 150;
  const paddingLeft = 30;
  const paddingRight = 10;
  const paddingTop = 10;
  const paddingBottom = 20;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const minVal = 0;
  const maxVal = 100;

  const getX = (idx) => paddingLeft + (idx / (data.length - 1)) * chartWidth;
  const getY = (val) => paddingTop + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;

  // Build the path string
  let pathD = '';
  data.forEach((item, idx) => {
    const x = getX(idx);
    const y = getY(item.val);
    if (idx === 0) {
      pathD += `M ${x} ${y}`;
    } else {
      pathD += ` L ${x} ${y}`;
    }
  });

  return (
    <div style={{ width: '100%' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Horizontal grid lines */}
        {[0, 25, 50, 75, 100].map((gridVal) => {
          const y = getY(gridVal);
          return (
            <g key={gridVal}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} className="chart-grid" />
              <text x={paddingLeft - 8} y={y + 3} textAnchor="end" className="chart-grid-text">
                {gridVal}
              </text>
            </g>
          );
        })}

        {/* The line path */}
        <path
          d={pathD}
          className="chart-line"
          style={{ stroke: color }}
        />

        {/* Data points */}
        {data.map((item, idx) => {
          const x = getX(idx);
          const y = getY(item.val);
          return (
            <g key={idx}>
              <circle
                cx={x}
                cy={y}
                r="3.5"
                fill="var(--bg)"
                stroke={color}
                strokeWidth="2"
              />
              {/* Tooltip-like value */}
              <text x={x} y={y - 7} textAnchor="middle" fill="var(--text)" fontSize="8" fontFamily="var(--font-mono)">
                {item.val}
              </text>
            </g>
          );
        })}

        {/* X Axis labels */}
        {data.map((item, idx) => {
          const x = getX(idx);
          return (
            <text
              key={idx}
              x={x}
              y={height - 4}
              textAnchor="middle"
              className="chart-grid-text"
            >
              {item.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
