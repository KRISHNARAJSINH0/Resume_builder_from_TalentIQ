import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('seeker');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ fontSize: '18px', color: '#fff', marginBottom: '1.25rem', fontWeight: 600 }}>Create Account</h2>
      
      <div className="form-group">
        <label className="form-label">Full Name</label>
        <input 
          type="text" 
          required 
          placeholder="Kartik Shah"
          className="form-input" 
          value={name} 
          onChange={e => setName(e.target.value)} 
        />
      </div>

      <div className="form-group">
        <label className="form-label">Email Address</label>
        <input 
          type="email" 
          required 
          placeholder="kartik@email.com"
          className="form-input" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
        />
      </div>

      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <label className="form-label">I am a...</label>
        <select 
          className="form-input" 
          value={role} 
          onChange={e => setRole(e.target.value)}
        >
          <option value="seeker">Job Seeker (Looking for jobs)</option>
          <option value="recruiter">Recruiter (Hiring talent)</option>
        </select>
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
        Register
      </button>

      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '12px' }}>
        <span style={{ color: 'var(--muted)' }}>Already have an account? </span>
        <Link to="/login" style={{ color: 'var(--v)', textDecoration: 'none', fontWeight: 600 }}>Log In</Link>
      </div>
    </form>
  );
}
