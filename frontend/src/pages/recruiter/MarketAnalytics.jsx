import React, { useState } from 'react';
import TrendLineChart from '../../components/charts/TrendLineChart';
import HeatmapChart from '../../components/charts/HeatmapChart';
import { BarChart, Info } from 'lucide-react';

export default function MarketAnalytics() {
  const [selectedRole, setSelectedRole] = useState('Frontend');
  const marketData = {
    'Frontend': [
      { label: 'Wk 1', val: 52 },
      { label: 'Wk 2', val: 55 },
      { label: 'Wk 3', val: 63 },
      { label: 'Wk 4', val: 70 },
      { label: 'Wk 5', val: 78 }
    ],
    'Backend': [
      { label: 'Wk 1', val: 40 },
      { label: 'Wk 2', val: 48 },
      { label: 'Wk 3', val: 52 },
      { label: 'Wk 4', val: 65 },
      { label: 'Wk 5', val: 72 }
    ]
  };

  const currentData = marketData[selectedRole] || marketData['Frontend'];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <span className="eyebrow" style={{ color: 'var(--t)' }}>Market Intelligence</span>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Recruitment Market Analytics</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Aggregated hiring indexes, role availability metrics, and market demand stats.</p>
      </div>

      <div className="grid-cols-2" style={{ marginBottom: '2rem' }}>
        {/* Role Demand chart */}
        <div className="card glass">
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '15px', color: '#fff' }}>Hiring Demand Index</h3>
            <select
              className="form-input"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{ width: '130px', padding: '3px 8px', fontSize: '11px', background: 'var(--s2)' }}
            >
              <option value="Frontend">Frontend Dev</option>
              <option value="Backend">Backend Dev</option>
            </select>
          </div>
          <TrendLineChart data={currentData} color="var(--t)" />
        </div>

        {/* Shortages overview */}
        <div className="card glass">
          <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '1rem' }}>Talent Shortages Matrix</h3>
          <HeatmapChart />
        </div>
      </div>

      <div className="card glass" style={{ borderLeft: '3px solid var(--a)', background: 'rgba(245,166,35,0.02)' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--a)', marginBottom: '5px' }}>
          <Info size={16} />
          <h4 style={{ fontSize: '13px', fontWeight: 600 }}>Analytics Explanation</h4>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: '1.6' }}>
          Data is gathered from daily web-scraping pipelines that crawl technology boards. The demand index maps the ratio of open positions versus registered candidates for each role category.
        </p>
      </div>
    </div>
  );
}
