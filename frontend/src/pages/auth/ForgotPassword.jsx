import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      <h2 style={{ fontSize: '18px', color: '#fff', marginBottom: '1.25rem', fontWeight: 600 }}>Reset Password</h2>
      
      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '1.5rem' }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              required 
              className="form-input" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
            Send Reset Link
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--g)', fontWeight: 600, fontSize: '14px', marginBottom: '1rem' }}>
            ✓ Reset link sent successfully!
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '1.5rem' }}>
            Check your inbox for instructions to set your new password.
          </p>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '12px' }}>
        <Link to="/login" style={{ color: 'var(--v)', textDecoration: 'none', fontWeight: 600 }}>Back to Login</Link>
      </div>
    </div>
  );
}
