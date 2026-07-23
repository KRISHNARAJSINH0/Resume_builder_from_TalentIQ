import React from 'react';
import useGapAnalysis from '../../hooks/useGapAnalysis';
import GapBarChart from '../../components/charts/GapBarChart';
import { CheckCircle2, AlertTriangle, ExternalLink, Sparkles } from 'lucide-react';

export default function GapAnalysis() {
  const { targetRole, have, missing, loading, changeRole, allRoles } = useGapAnalysis();

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <span className="eyebrow">Skill Gap Engine</span>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Skill Gap Analysis</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Analyze which skills are highly demanded for your target career path.</p>
        </div>

        {/* Role Selector dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>Target Role:</span>
          <select
            className="form-input"
            value={targetRole}
            onChange={(e) => changeRole(e.target.value)}
            style={{ width: '220px', background: 'var(--s1)', borderColor: 'var(--border)' }}
          >
            {allRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card glass flex-center" style={{ minHeight: '300px' }}>
          <p style={{ color: 'var(--muted)' }}>Calculating set difference and group frequencies...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Chart & Stats row */}
          <div className="grid-cols-2">
            {/* Visual Gap chart */}
            <div className="card glass">
              <h3 style={{ marginBottom: '1rem', color: '#fff', fontSize: '15px' }}>Market Demand Frequency for Gaps</h3>
              <GapBarChart data={missing} />
            </div>

            {/* AI booster summary */}
            <div className="card glass" style={{ borderLeft: '3px solid var(--t)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--t)', marginBottom: '10px' }}>
                  <Sparkles size={18} />
                  <h3 style={{ fontSize: '15px', fontWeight: 600 }}>TalentIQ AI Advisory</h3>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.7', marginBottom: '10px' }}>
                  For the role of <strong>{targetRole}</strong>, learning <strong>{missing[0]?.name}</strong> will increase your matching listing score by <strong>{missing[0]?.frequency}%</strong>.
                </p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.7' }}>
                  Adding Docker or cloud services represents a salary boost premium of approximately <strong>₹1.5L - ₹2.5L LPA</strong> in the current Indian marketplace.
                </p>
              </div>
              <div style={{ padding: '10px 12px', background: 'var(--s2)', borderRadius: '6px', fontSize: '11px', color: 'var(--a)', border: '1px solid rgba(245,166,35,0.1)', marginTop: '15px' }}>
                💡 Tip: Check learning resource suggestions to start bridging these gaps today.
              </div>
            </div>
          </div>

          {/* Have vs Missing Detail lists */}
          <div className="grid-cols-2">
            {/* Skills Have */}
            <div className="card glass">
              <h3 style={{ marginBottom: '1rem', color: 'var(--g)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} /> Skills You Have ({have.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {have.map(s => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', padding: '8px', background: 'var(--s2)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--g)', fontWeight: 'bold' }}>✓</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Missing & Learning Resources */}
            <div className="card glass">
              <h3 style={{ marginBottom: '1rem', color: 'var(--r)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} /> Missing Skills Roadmap ({missing.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {missing.map(item => (
                  <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px', background: 'var(--s2)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <div className="flex-between">
                      <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text)' }}>{item.name}</span>
                      <span className="badge br">{item.level} Priority</span>
                    </div>
                    <div className="flex-between" style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                      <span>Appears in {item.frequency}% of Job Listings</span>
                      <span style={{ color: 'var(--g)' }}>+ {formatSalary(item.salaryPremium)} CTC</span>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '6px', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Course: {item.resource}</span>
                      <a href="#" style={{ fontSize: '11px', color: 'var(--t)', display: 'flex', alignItems: 'center', gap: '2px', textDecoration: 'none' }}>
                        Learn <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  function formatSalary(premium) {
    return `₹${(premium / 100000).toFixed(1)}L`;
  }
}
