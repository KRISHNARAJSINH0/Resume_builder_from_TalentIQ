import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--bg)', padding: '1rem' }}>
      <div className="card glass" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem 2rem', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '28px', color: '#fff', fontFamily: 'var(--font-mono)' }}>🧠 TalentIQ</h1>
          <p style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '4px' }}>AI Career Intelligence Platform</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
