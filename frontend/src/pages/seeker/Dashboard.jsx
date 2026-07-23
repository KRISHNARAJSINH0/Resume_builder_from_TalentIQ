import React from 'react';
import useReadiness from '../../hooks/useReadiness';
import ReadinessGauge from '../../components/charts/ReadinessGauge';
import TrendLineChart from '../../components/charts/TrendLineChart';
import { RefreshCw, FileCode, CheckCircle, Target } from 'lucide-react';

export default function Dashboard() {
  const { score, breakdown, history, loading, refresh } = useReadiness();

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <span className="eyebrow">Career Intelligence</span>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Welcome Back, Kartik</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Track your AI-calculated career readiness and bridge your talent gaps.</p>
        </div>
        <button 
          onClick={refresh} 
          className="btn btn-primary" 
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Recomputing...' : 'Recompute Score'}
        </button>
      </div>

      {/* Overview stats & Gauge */}
      <div className="grid-cols-2" style={{ marginBottom: '2rem', alignItems: 'stretch' }}>
        {/* Gauge Card */}
        <div className="card glass flex-center" style={{ flexDirection: 'column', minHeight: '220px' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text)', fontSize: '15px' }}>Overall Readiness Score</h3>
          <ReadinessGauge score={score} />
        </div>

        {/* Breakdown Card */}
        <div className="card glass" style={{ minHeight: '220px' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text)', fontSize: '15px' }}>Score Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(breakdown).map(([key, val]) => (
              <div key={key}>
                <div className="flex-between" style={{ fontSize: '12px', marginBottom: '4px', textTransform: 'capitalize' }}>
                  <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{key} Fit</span>
                  <span style={{ color: 'var(--text)', fontWeight: 600 }}>{val}%</span>
                </div>
                <div className="score-bar">
                  <div 
                    className="score-bar-fill" 
                    style={{ 
                      width: `${val}%`, 
                      background: val >= 70 ? 'var(--g)' : val >= 40 ? 'var(--a)' : 'var(--r)' 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History and Quick Details */}
      <div className="grid-cols-2" style={{ alignItems: 'stretch' }}>
        {/* History Chart */}
        <div className="card glass">
          <h3 style={{ marginBottom: '1rem', color: 'var(--text)', fontSize: '15px' }}>Weekly Readiness History</h3>
          <div style={{ marginTop: '1rem' }}>
            <TrendLineChart data={history} color="var(--v)" />
          </div>
        </div>

        {/* Feature Summary Card */}
        <div className="card glass" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text)', fontSize: '15px' }}>Action Items</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <CheckCircle size={18} style={{ color: 'var(--g)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600 }}>Resume completeness at 85%</h4>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Your basic details and core experience are parsed correctly.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Target size={18} style={{ color: 'var(--a)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600 }}>Bridge 5 Skill Gaps</h4>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Next.js and TypeScript are highly demanded in matching listings.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <FileCode size={18} style={{ color: 'var(--v)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600 }}>Mock Interview Recommended</h4>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Simulate a Frontend React developer interview to boost your score.</p>
                </div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '15px' }}>
            🧠 composite score = 40% skills + 20% exp + 15% edu + 15% projects + 10% mock interview
          </div>
        </div>
      </div>
    </div>
  );
}
