import React from 'react';
import { Mail, GraduationCap, Building2, Calendar } from 'lucide-react';

export default function ProfileCard({ user }) {
  if (!user) return null;

  return (
    <div className="card glass">
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <img 
          src={user.avatar} 
          alt={user.name} 
          style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--v)' }}
        />
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{user.name}</h3>
          <p style={{ color: 'var(--muted)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
            <Mail size={12} /> {user.email}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Education section */}
        <div>
          <h4 style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--t)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            Education
          </h4>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <GraduationCap size={16} style={{ color: 'var(--muted)', marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600 }}>Bachelor of Technology - Computer Science</p>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Delhi Technological University (Graduation: 2026)</p>
            </div>
          </div>
        </div>

        {/* Experience section */}
        <div>
          <h4 style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--t)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            Work Experience
          </h4>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px' }}>
            <Building2 size={16} style={{ color: 'var(--muted)', marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600 }}>Software Engineering Intern</p>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>WebSolutions Pvt. Ltd. (May 2025 - July 2025)</p>
              <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>Built interactive React components and improved page loading performance by 15%.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
