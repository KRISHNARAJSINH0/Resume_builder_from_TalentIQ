import React from 'react';
import { Bookmark, MapPin, Award, Banknote, ShieldCheck } from 'lucide-react';
import MatchBadge from './MatchBadge';

export default function JobCard({ job, onToggleSave, onApply }) {
  return (
    <div className="card glass" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="flex-between">
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'var(--s2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>
            {job.logo}
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{job.title}</h3>
            <p style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{job.company}</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MatchBadge percentage={job.match} />
          <button 
            onClick={() => onToggleSave(job.id)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: job.saved ? 'var(--a)' : 'var(--muted)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Bookmark size={16} fill={job.saved ? 'var(--a)' : 'none'} />
          </button>
        </div>
      </div>

      {/* Details Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', fontSize: '12px', color: 'var(--muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={12} /> {job.location}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Award size={12} /> {job.experience}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Banknote size={12} /> {job.salary}
        </span>
      </div>

      {/* Skills Match Row */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>Skills Match Analysis:</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {job.have.map(s => (
            <span key={s} className="badge bg" style={{ fontSize: '10px' }}>✓ {s}</span>
          ))}
          {job.missing.map(s => (
            <span key={s} className="badge br" style={{ fontSize: '10px' }}>✗ {s}</span>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
        <button 
          onClick={() => onApply(job.id)} 
          className="btn btn-primary" 
          style={{ flex: 1, padding: '0.5rem' }}
        >
          View & Apply
        </button>
      </div>
    </div>
  );
}
