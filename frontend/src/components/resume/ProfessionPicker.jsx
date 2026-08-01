import React, { useState } from 'react';
import { PROFESSIONS } from '../../hooks/useResumeBuilder';
import { Wand2, ChevronRight, Search } from 'lucide-react';

const CATEGORIES = [...new Set(PROFESSIONS.map((p) => p.category))];

const CATEGORY_COLORS = {
  Tech:            '#0ea5e9',
  Design:          '#ec4899',
  Engineering:     '#3b82f6',
  Healthcare:      '#10b981',
  Education:       '#06b6d4',
  Finance:         '#f59e0b',
  Management:      '#6366f1',
  'Public Service':'#ef4444',
  Creative:        '#ec4899',
  Hospitality:     '#f59e0b',
  Media:           '#06b6d4',
  'Entry Level':   '#10b981',
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
    <div style={{ maxWidth: '920px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', paddingTop: '0.5rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(14,165,233,0.10)', border: '1px solid rgba(14,165,233,0.25)',
          borderRadius: '50px', padding: '6px 18px', marginBottom: '1.5rem',
          backdropFilter: 'blur(10px)',
        }}>
          <Wand2 size={13} style={{ color: '#0ea5e9' }} />
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#0284c7', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            AI RESUME INTELLIGENCE ENGINE
          </span>
        </div>

        <h1 style={{ fontSize: '38px', fontWeight: 900, marginBottom: '0.85rem', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
          Select Your{' '}
          <span style={{ background: 'linear-gradient(135deg,#0ea5e9 0%,#6366f1 60%,#06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Profession
          </span>
        </h1>

        <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '480px', margin: '0 auto 2rem', lineHeight: 1.75 }}>
          Choose your career path and our AI recruiter will interview you step-by-step to build your perfect resume.
        </p>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '400px', margin: '0 auto' }}>
          <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text" className="form-input"
            placeholder="Search profession..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '40px', textAlign: 'left' }}
          />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '14px', marginBottom: '2.5rem' }}>
        {[
          { label: '38 Professions', sub: 'Supported',       icon: '🏆', color: '#0ea5e9' },
          { label: '12 AI Phases',   sub: 'Full Pipeline',   icon: '⚡', color: '#6366f1' },
          { label: 'AI Powered',     sub: 'Industry Standard', icon: '🤖', color: '#06b6d4' },
        ].map((s) => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '1.25rem 1rem' }}>
            <div style={{ fontSize: '22px', marginBottom: '6px' }}>{s.icon}</div>
            <div style={{ fontWeight: 800, fontSize: '16px', color: s.color, marginBottom: '3px' }}>{s.label}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Profession Grid */}
      {Object.entries(grouped).map(([category, items]) => {
        const col = CATEGORY_COLORS[category] || '#0ea5e9';
        return (
          <div key={category} style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.9rem' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: col, textTransform: 'uppercase', letterSpacing: '0.14em', background: `${col}15`, padding: '3px 10px', borderRadius: '20px', border: `1px solid ${col}30` }}>
                {category}
              </span>
              <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg,${col}30,transparent)` }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(175px,1fr))', gap: '10px' }}>
              {items.map((prof) => {
                const c = CATEGORY_COLORS[prof.category] || '#0ea5e9';
                const hov = hoveredId === prof.id;
                return (
                  <button
                    key={prof.id}
                    onClick={() => !loading && onSelect(prof)}
                    onMouseEnter={() => setHoveredId(prof.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    disabled={loading}
                    style={{
                      background: hov ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.72)',
                      border: `1.5px solid ${hov ? c : 'rgba(255,255,255,0.80)'}`,
                      borderRadius: '14px', padding: '1.1rem',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px',
                      transition: 'all 0.2s ease',
                      transform: hov ? 'translateY(-3px)' : 'none',
                      boxShadow: hov ? `0 8px 28px ${c}25,0 2px 8px rgba(0,0,0,0.08)` : '0 2px 8px rgba(14,165,233,0.06)',
                      backdropFilter: 'blur(14px)', opacity: loading ? 0.6 : 1,
                      textAlign: 'left', width: '100%', outline: 'none',
                    }}
                  >
                    <span style={{ fontSize: '24px', background: hov ? `${c}18` : 'rgba(14,165,233,0.06)', padding: '6px', borderRadius: '10px', display: 'inline-flex', transition: 'background 0.2s ease' }}>
                      {prof.icon}
                    </span>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: hov ? c : '#1e293b', lineHeight: 1.3, transition: 'color 0.15s ease' }}>
                      {prof.label}
                    </span>
                    {hov && (
                      <span style={{ fontSize: '10px', color: c, display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        Select <ChevronRight size={10} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
          No professions match your search.
        </div>
      )}
    </div>
  );
}
