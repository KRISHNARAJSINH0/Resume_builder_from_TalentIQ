import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye } from 'lucide-react';

const mockCandidates = [
  { id: 1, name: 'Kartik Shah', role: 'Frontend React Developer', score: 74, shortlistProb: 88, skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Git', 'SQL', 'Python'] },
  { id: 2, name: 'Anjali Verma', role: 'Fullstack Django Developer', score: 81, shortlistProb: 94, skills: ['Python', 'Django', 'PostgreSQL', 'HTML5', 'CSS3', 'Git'] },
  { id: 3, name: 'Rohan Das', role: 'Machine Learning Engineer', score: 56, shortlistProb: 45, skills: ['Python', 'SQL', 'Git'] },
  { id: 4, name: 'Pooja Sen', role: 'Frontend React Developer', score: 68, shortlistProb: 72, skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Git'] }
];

export default function TalentPool() {
  const navigate = useNavigate();

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <span className="eyebrow" style={{ color: 'var(--t)' }}>Hiring Pipeline</span>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Candidate Talent Pool</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Review candidates, check composite readiness, and shortlist using Random Forest predictive metrics.</p>
      </div>

      {/* Search and Filters row */}
      <div className="card glass flex-between" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--muted)' }} />
          <input type="text" placeholder="Filter by candidate, skill, role..." className="form-input" style={{ paddingLeft: '32px' }} />
        </div>
        <div>
          <select className="form-input" style={{ width: '150px' }}>
            <option value="">All Roles</option>
            <option value="Frontend">Frontend Dev</option>
            <option value="Backend">Backend Dev</option>
            <option value="ML">ML Engineer</option>
          </select>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="card glass" style={{ padding: 0 }}>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Candidate Name</th>
                <th>Target Role</th>
                <th>Readiness Index</th>
                <th>Shortlist Probability</th>
                <th>Skills Extracted</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockCandidates.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{c.name}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '12px' }}>{c.role}</td>
                  <td>
                    <span 
                      className="badge" 
                      style={{ 
                        background: c.score >= 70 ? 'rgba(30,203,123,0.1)' : c.score >= 50 ? 'rgba(245,166,35,0.1)' : 'rgba(255,107,107,0.1)',
                        color: c.score >= 70 ? 'var(--g)' : c.score >= 50 ? 'var(--a)' : 'var(--r)'
                      }}
                    >
                      {c.score}% Match
                    </span>
                  </td>
                  <td style={{ fontWeight: 'bold', color: c.shortlistProb >= 80 ? 'var(--g)' : c.shortlistProb >= 60 ? 'var(--a)' : 'var(--r)' }}>
                    {c.shortlistProb}% Shortlist
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                      {c.skills.slice(0, 3).map(s => (
                        <span key={s} className="badge bp" style={{ fontSize: '9px', padding: '2px 5px' }}>{s}</span>
                      ))}
                      {c.skills.length > 3 && <span className="badge bg" style={{ fontSize: '9px', padding: '2px 5px' }}>+{c.skills.length - 3}</span>}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => navigate(`/recruiter/talent/${c.id}`)}
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    >
                      <Eye size={12} /> Inspect Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
