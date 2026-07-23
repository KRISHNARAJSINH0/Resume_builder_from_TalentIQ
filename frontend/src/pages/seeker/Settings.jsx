import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Sliders, Database } from 'lucide-react';

export default function Settings() {
  const [debug, setDebug] = useState(true);
  const [modelType, setModelType] = useState('Random Forest');

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <span className="eyebrow">Preferences</span>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Account & System Settings</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Configure backend models and simulator parameter profiles.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
        {/* Core settings */}
        <div className="card glass">
          <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={16} style={{ color: 'var(--v)' }} /> Model Classifier Options
          </h3>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Interview Score Predictor model</label>
            <select className="form-input" value={modelType} onChange={e => setModelType(e.target.value)}>
              <option value="Random Forest">Random Forest Classifier (rf_model.pkl)</option>
              <option value="SVM">Support Vector Machine (svm_model.pkl)</option>
            </select>
          </div>
          <div className="flex-between">
            <div>
              <strong style={{ display: 'block', fontSize: '13px' }}>Django Debug Logger Mode</strong>
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Enable verbose API console print outputs</span>
            </div>
            <input 
              type="checkbox" 
              checked={debug} 
              onChange={e => setDebug(e.target.checked)}
              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
            />
          </div>
        </div>

        {/* Database administration */}
        <div className="card glass">
          <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={16} style={{ color: 'var(--t)' }} /> Database Administration
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '1.25rem' }}>
            Seed learning resources, placeholder interview questions, and clear candidate listing tables.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => alert('Seeding learning resources...')}>Seed Resources</button>
            <button className="btn" onClick={() => alert('Seeding question bank...')}>Seed Question Bank</button>
            <button className="btn" style={{ borderColor: 'var(--r)', color: 'var(--r)' }} onClick={() => alert('Warning: database tables cleared.')}>Clear Mock History</button>
          </div>
        </div>

        {/* Security parameters */}
        <div className="card glass">
          <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} style={{ color: 'var(--a)' }} /> Security Profile
          </h3>
          <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
            <p>JWT Access Expiry: <strong style={{ color: '#fff' }}>5 minutes</strong></p>
            <p>JWT Refresh Expiry: <strong style={{ color: '#fff' }}>24 hours</strong></p>
            <p style={{ marginTop: '5px' }}>Role Type Authorized: <strong style={{ color: 'var(--g)' }}>JOB SEEKER (read/write limits)</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
