import React, { useState } from 'react';
import { PROFESSIONS } from '../../hooks/useResumeBuilder';
import { Wand2, ChevronRight, Search } from 'lucide-react';

const CATEGORIES = [...new Set(PROFESSIONS.map((p) => p.category))];

const CATEGORY_COLORS = {
  Tech: 'var(--v)',
  Design: 'var(--pk)',
  Engineering: 'var(--b)',
  Healthcare: 'var(--g)',
  Education: 'var(--t)',
  Finance: 'var(--a)',
  Management: 'var(--v)',
  'Public Service': 'var(--r)',
  Creative: 'var(--pk)',
  Hospitality: 'var(--a)',
  Media: 'var(--t)',
  'Entry Level': 'var(--g)',
};

export default function ProfessionPicker({ onSelect, loading }) {
  const [search, setSearch] = useState('');
  const [hoveredId, setHoveredId] = useState(null);

  const filtered = PROFESSIONS.filter((p) =>
    p.label.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = filtered.filter((p) => p.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          background: 'rgba(123,111,255,0.1)', border: '1px solid rgba(123,111,255,0.25)',
          borderRadius: '50px', padding: '6px 16px', marginBottom: '1.25rem',
        }}>
          <Wand2 size={14} style={{ color: 'var(--v)' }} />
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--v)' }}>
            AI RESUME INTELLIGENCE ENGINE
          </span>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '0.75rem' }}>
          Select Your{' '}
          <span className="text-gradient">Profession</span>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '15px', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
          Choose your career path and our AI recruiter will interview you step-by-step to build your perfect resume.
        </p>

        {/* Search bar */}
        <div style={{ position: 'relative', maxWidth: '380px', margin: '0 auto' }}>
          <Search size={14} style={{
            position: 'absolute', left: '14px', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--muted)',
          }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search profession..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px', background: 'var(--s2)', textAlign: 'left' }}
          />
        </div>
      </div>

      {/* Stats Banner */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px',
        marginBottom: '2rem',
      }}>
        {[
          { label: '38 Professions', sub: 'Supported' },
          { label: '12 AI Phases', sub: 'Full Pipeline' },
          { label: 'AI Powered', sub: 'Industry Standard' },
        ].map((stat) => (
          <div key={stat.label} className="card glass" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)' }}>{stat.label}</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Grouped Profession Grid */}
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} style={{ marginBottom: '2rem' }}>
          <div className="section-divider" style={{ marginBottom: '1rem' }}>
            <span style={{ color: CATEGORY_COLORS[category] || 'var(--v)' }}>
              {category}
            </span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '10px',
          }}>
            {items.map((prof) => {
              const color = CATEGORY_COLORS[prof.category] || 'var(--v)';
              const isHovered = hoveredId === prof.id;
              return (
                <button
                  key={prof.id}
                  onClick={() => !loading && onSelect(prof)}
                  onMouseEnter={() => setHoveredId(prof.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  disabled={loading}
                  style={{
                    background: isHovered
                      ? `rgba(${hexToRgbStr(color)}, 0.06)`
                      : 'var(--s1)',
                    border: `1px solid ${isHovered ? color : 'var(--border)'}`,
                    borderRadius: '10px',
                    padding: '1rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '6px',
                    transition: 'all 0.18s ease',
                    transform: isHovered ? 'translateY(-2px)' : 'none',
                    boxShadow: isHovered ? `0 4px 20px rgba(0,0,0,0.3)` : 'none',
                    opacity: loading ? 0.6 : 1,
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <span style={{ fontSize: '22px' }}>{prof.icon}</span>
                  <span style={{
                    fontSize: '12px', fontWeight: 600,
                    color: isHovered ? color : 'var(--text)',
                    lineHeight: 1.3,
                    transition: 'color 0.15s ease',
                  }}>
                    {prof.label}
                  </span>
                  {isHovered && (
                    <span style={{ fontSize: '10px', color, display: 'flex', alignItems: 'center', gap: '3px' }}>
                      Select <ChevronRight size={10} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
          No professions match your search.
        </div>
      )}
    </div>
  );
}

// Minimal helper — returns "r,g,b" from css var string (approximated for known vars)
function hexToRgbStr(cssVar) {
  const map = {
    'var(--v)': '123,111,255',
    'var(--pk)': '232,101,200',
    'var(--b)': '79,143,255',
    'var(--g)': '30,203,123',
    'var(--t)': '0,207,168',
    'var(--a)': '245,166,35',
    'var(--r)': '255,107,107',
  };
  return map[cssVar] || '123,111,255';
}
