import React from 'react';

export default function SalaryBoxPlot() {
  // Let's render a nice mock box-plot SVG
  return (
    <div style={{ width: '100%' }}>
      <svg width="100%" height="160" viewBox="0 0 400 160">
        {/* Grid lines */}
        <line x1="50" y1="30" x2="350" y2="30" className="chart-grid" />
        <line x1="50" y1="80" x2="350" y2="80" className="chart-grid" />
        <line x1="50" y1="130" x2="350" y2="130" className="chart-grid" />

        {/* Y Axis labels */}
        <text x="15" y="34" className="chart-grid-text">Senior</text>
        <text x="15" y="84" className="chart-grid-text">Mid</text>
        <text x="15" y="134" className="chart-grid-text">Junior</text>

        {/* X Axis scale */}
        <line x1="50" y1="145" x2="350" y2="145" stroke="var(--border)" strokeWidth="1" />
        <text x="50" y="157" className="chart-grid-text" textAnchor="middle">₹3L</text>
        <text x="125" y="157" className="chart-grid-text" textAnchor="middle">₹7L</text>
        <text x="200" y="157" className="chart-grid-text" textAnchor="middle">₹11L</text>
        <text x="275" y="157" className="chart-grid-text" textAnchor="middle">₹15L</text>
        <text x="350" y="157" className="chart-grid-text" textAnchor="middle">₹20L+</text>

        {/* Junior Box Plot */}
        <g>
          {/* Whiskers */}
          <line x1="60" y1="130" x2="160" y2="130" className="boxplot-line" />
          <line x1="60" y1="125" x2="60" y2="135" className="boxplot-line" />
          <line x1="160" y1="125" x2="160" y2="135" className="boxplot-line" />
          {/* Box */}
          <rect x="80" y="120" width="60" height="20" className="boxplot-box" />
          {/* Median */}
          <line x1="110" y1="120" x2="110" y2="140" className="boxplot-median" />
        </g>

        {/* Mid Box Plot */}
        <g>
          {/* Whiskers */}
          <line x1="100" y1="80" x2="280" y2="80" className="boxplot-line" />
          <line x1="100" y1="75" x2="100" y2="85" className="boxplot-line" />
          <line x1="280" y1="75" x2="280" y2="85" className="boxplot-line" />
          {/* Box */}
          <rect x="140" y="70" width="90" height="20" className="boxplot-box" />
          {/* Median */}
          <line x1="190" y1="70" x2="190" y2="90" className="boxplot-median" />
        </g>

        {/* Senior Box Plot */}
        <g>
          {/* Whiskers */}
          <line x1="160" y1="30" x2="340" y2="30" className="boxplot-line" />
          <line x1="160" y1="25" x2="160" y2="35" className="boxplot-line" />
          <line x1="340" y1="25" x2="340" y2="35" className="boxplot-line" />
          {/* Box */}
          <rect x="200" y="20" width="100" height="20" className="boxplot-box" />
          {/* Median */}
          <line x1="250" y1="20" x2="250" y2="40" className="boxplot-median" />
          {/* Outlier */}
          <circle cx="355" cy="30" r="3" className="boxplot-outlier" />
        </g>
      </svg>
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '5px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '10px', height: '10px', background: 'var(--v-glow)', border: '1px solid var(--v)', borderRadius: '2px' }}></span> Range (25th-75th)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '12px', height: '3px', background: 'var(--t)' }}></span> Median CTC
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '6px', height: '6px', background: 'var(--r)', borderRadius: '50%' }}></span> Outlier (High CTC)
        </span>
      </div>
    </div>
  );
}
