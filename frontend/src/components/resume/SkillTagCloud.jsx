import React from 'react';

export default function SkillTagCloud({ skills = [], type = 'have' }) {
  if (!skills || skills.length === 0) {
    return <div style={{ color: 'var(--muted)', fontSize: '12px' }}>No skills identified yet</div>;
  }

  const badgeClass = type === 'have' ? 'bg' : type === 'missing' ? 'br' : 'bp';

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {skills.map((skill) => (
        <span 
          key={skill} 
          className={`badge ${badgeClass}`}
          style={{ fontSize: '11px', padding: '4px 10px', textTransform: 'none', letterSpacing: 'normal' }}
        >
          {skill}
        </span>
      ))}
    </div>
  );
}
