import React, { useState } from 'react';
import TrendLineChart from '../../components/charts/TrendLineChart';
import { Sparkles, Calendar } from 'lucide-react';

export default function HiringForecast() {
  const [selectedSkill, setSelectedSkill] = useState('TypeScript');

  const forecasts = {
    'TypeScript': [
      { label: 'Jun 26', val: 74 },
      { label: 'Jul 26', val: 78 },
      { label: 'Aug 26 (F)', val: 82 },
      { label: 'Sep 26 (F)', val: 86 }
    ],
    'Docker': [
      { label: 'Jun 26', val: 48 },
      { label: 'Jul 26', val: 55 },
      { label: 'Aug 26 (F)', val: 62 },
      { label: 'Sep 26 (F)', val: 68 }
    ]
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <span className="eyebrow" style={{ color: 'var(--t)' }}>Future Projections</span>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Demand Growth Forecasting</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Projections computed using Polynomial Regression models on historical skill data.</p>
      </div>

      <div className="grid-cols-2" style={{ marginBottom: '2rem' }}>
        {/* Forecast Chart */}
        <div className="card glass">
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '15px', color: '#fff' }}>Projected Demand (6 Months)</h3>
            <select
              className="form-input"
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              style={{ width: '130px', padding: '3px 8px', fontSize: '11px', background: 'var(--s2)' }}
            >
              <option value="TypeScript">TypeScript</option>
              <option value="Docker">Docker</option>
            </select>
          </div>
          <TrendLineChart data={forecasts[selectedSkill] || forecasts['TypeScript']} color="var(--v)" />
        </div>

        {/* Forecast Details */}
        <div className="card glass" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--v)', marginBottom: '10px' }}>
              <Sparkles size={16} />
              <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Forecast Analysis</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.7', marginBottom: '10px' }}>
              Based on historical data cycles, the demand for <strong>{selectedSkill}</strong> is projected to rise steadily over the next quarter.
            </p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.7' }}>
              We recommend placing early training programs or prioritizing candidates with this skillset to bridge gaps before market pricing rises.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '12px', color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
            <Calendar size={14} /> Forecast computed on 2026-06-27
          </div>
        </div>
      </div>
    </div>
  );
}
