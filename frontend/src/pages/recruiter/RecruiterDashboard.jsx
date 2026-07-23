import React from 'react';
import HeatmapChart from '../../components/charts/HeatmapChart';
import NetworkGraph from '../../components/charts/NetworkGraph';
import { Users, FileCode, Percent, RefreshCw } from 'lucide-react';

export default function RecruiterDashboard() {
  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <span className="eyebrow" style={{ color: 'var(--t)' }}>Recruiter Control Panel</span>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Talent Pool Overview</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Real-time statistics of candidate profiles, skill gap shortage trends, and scraped market demands.</p>
        </div>
      </div>

      {/* Recruiter Stats cards */}
      <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
        <div className="card glass">
          <span style={{ display: 'block', fontSize: '28px', fontWeight: 800, color: 'var(--v)' }}>124</span>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>Total Seekers</span>
        </div>
        <div className="card glass">
          <span style={{ display: 'block', fontSize: '28px', fontWeight: 800, color: 'var(--t)' }}>68%</span>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>Avg Readiness Score</span>
        </div>
        <div className="card glass">
          <span style={{ display: 'block', fontSize: '28px', fontWeight: 800, color: 'var(--a)' }}>28.5%</span>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>Avg Shortlist Ratio</span>
        </div>
        <div className="card glass">
          <span style={{ display: 'block', fontSize: '28px', fontWeight: 800, color: 'var(--g)' }}>450</span>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>Scraped Job Listings</span>
        </div>
      </div>

      <div className="grid-cols-2">
        {/* Heatmap shortage */}
        <div className="card glass">
          <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '1.25rem' }}>Talent Shortage Heatmap (Role × Skill Gap)</h3>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '10px' }}>
            Represents percentage of candidate pool lacking required skills in scraped job descriptions.
          </p>
          <HeatmapChart />
        </div>

        {/* Network diagram */}
        <div className="card glass">
          <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '1.25rem' }}>Market Skill Clusters (Co-occurrences)</h3>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '10px' }}>
            Shows node-link representation of skills appearing together inside scraped developer JDs.
          </p>
          <NetworkGraph />
        </div>
      </div>

      {/* Placeholders warning list */}
      <div className="card glass" style={{ marginTop: '2rem', borderLeft: '3px solid var(--r)', background: 'rgba(255,107,107,0.02)' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--r)', marginBottom: '4px' }}>Talent Shortage Alert</h4>
        <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
          Only 12% of candidates have matching credentials for Backend Django Developer. Primary gaps identified: <strong>Celery</strong> and <strong>PostgreSQL</strong> caching configurations.
        </p>
      </div>
    </div>
  );
}
