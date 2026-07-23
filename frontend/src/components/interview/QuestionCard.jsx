import React from 'react';

export default function QuestionCard({ question, currentIndex, total }) {
  if (!question) return null;

  return (
    <div className="card glass" style={{ borderLeft: '3px solid var(--v)', background: 'rgba(123,111,255,0.03)', marginBottom: '1.5rem' }}>
      <span className="eyebrow" style={{ color: 'var(--v)' }}>
        Question {currentIndex + 1} of {total}
      </span>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginTop: '6px', lineHeight: '1.6' }}>
        {question.text}
      </h3>
      <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>Expected concepts:</span>
        {question.keywords.map(k => (
          <span key={k} className="chip">{k}</span>
        ))}
      </div>
    </div>
  );
}
