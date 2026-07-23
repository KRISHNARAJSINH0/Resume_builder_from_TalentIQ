import React, { useState } from 'react';
import TrendLineChart from '../../components/charts/TrendLineChart';
import HeatmapChart from '../../components/charts/HeatmapChart';
import NetworkGraph from '../../components/charts/NetworkGraph';
import { LineChart, LayoutGrid } from 'lucide-react';

export default function MarketTrends() {
  const [selectedSkill, setSelectedSkill] = useState('TypeScript');

  const forecasts = {
    'TypeScript': [
      { label: 'Apr 26', val: 62 },
      { label: 'May 26', val: 65 },
      { label: 'Jun 26', val: 74 },
      { label: 'Jul 26', val: 78 },
      { label: 'Aug 26 (F)', val: 82 },
      { label: 'Sep 26 (F)', val: 86 }
    ],
    'Docker': [
      { label: 'Apr 26', val: 40 },
      { label: 'May 26', val: 45 },
      { label: 'Jun 26', val: 48 },
      { label: 'Jul 26', val: 55 },
      { label: 'Aug 26 (F)', val: 62 },
      { label: 'Sep 26 (F)', val: 68 }
    ],
    'Next.js': [
      { label: 'Apr 26', val: 32 },
      { label: 'May 26', val: 38 },
      { label: 'Jun 26', val: 45 },
      { label: 'Jul 26', val: 54 },
      { label: 'Aug 26 (F)', val: 61 },
      { label: 'Sep 26 (F)', val: 66 }
    ]
  };

  const currentForecast = forecasts[selectedSkill] || forecasts['TypeScript'];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <span className="eyebrow">Market Intelligence</span>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Skill Market Trends</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Analyze live skill trends scraped daily and forecasted using Polynomial Regression models.</p>
      </div>

      {/* Row 1: Line Forecast & Selector */}
      <div className="grid-cols-2" style={{ marginBottom: '2rem' }}>
        {/* Forecast Line Chart */}
        <div className="card glass">
          <div className="flex-between" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '15px', color: '#fff' }}>Skill Demand Forecasting (3-6 Months)</h3>
            <select
              className="form-input"
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              style={{ width: '130px', padding: '3px 8px', fontSize: '11px', background: 'var(--s2)' }}
            >
              <option value="TypeScript">TypeScript</option>
              <option value="Docker">Docker</option>
              <option value="Next.js">Next.js</option>
            </select>
          </div>
          <TrendLineChart data={currentForecast} color="var(--t)" />
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '8px', textAlign: 'right' }}>
            * (F) represents ML Polynomial forecasted values
          </div>
        </div>

        {/* Hot / Cold summary cards */}
        <div className="card glass" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '1rem' }}>Top Growth Skill Indicators</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="flex-between" style={{ padding: '8px 12px', background: 'var(--s2)', borderRadius: '6px', fontSize: '13px' }}>
                <span style={{ fontWeight: 600 }}>1. TypeScript</span>
                <span className="badge bg">+24% growth</span>
              </div>
              <div className="flex-between" style={{ padding: '8px 12px', background: 'var(--s2)', borderRadius: '6px', fontSize: '13px' }}>
                <span style={{ fontWeight: 600 }}>2. Next.js</span>
                <span className="badge bg">+18% growth</span>
              </div>
              <div className="flex-between" style={{ padding: '8px 12px', background: 'var(--s2)', borderRadius: '6px', fontSize: '13px' }}>
                <span style={{ fontWeight: 600 }}>3. Docker / MLOps</span>
                <span className="badge bg">+15% growth</span>
              </div>
              <div className="flex-between" style={{ padding: '8px 12px', background: 'var(--s2)', borderRadius: '6px', fontSize: '13px' }}>
                <span style={{ fontWeight: 600 }}>4. PostgreSQL Caching</span>
                <span className="badge ba">+8% growth</span>
              </div>
            </div>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '15px', lineHeight: '1.5' }}>
            Weekly scraping tracks Indeed and Naukri listings. Polynomial curves are fit per skill sequence to identify velocity.
          </p>
        </div>
      </div>

      {/* Row 2: Heatmap Shortages & Network Clusters */}
      <div className="grid-cols-2">
        {/* Heatmap */}
        <div className="card glass">
          <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '1.25rem' }}>Shortage Heatmap (Role × Skill)</h3>
          <HeatmapChart />
        </div>

        {/* Network Graph */}
        <div className="card glass">
          <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '1.25rem' }}>Skill Co-occurrence Network</h3>
          <NetworkGraph />
        </div>
      </div>
    </div>
  );
}
