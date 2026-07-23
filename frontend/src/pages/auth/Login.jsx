import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('kartik@email.com');
  const [password, setPassword] = useState('password123');
  const [roleSelect, setRoleSelect] = useState('seeker');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password, roleSelect);
    if (roleSelect === 'seeker') {
      navigate('/dashboard');
    } else {
      navigate('/recruiter');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ fontSize: '18px', color: '#fff', marginBottom: '1.25rem', fontWeight: 600 }}>Sign In</h2>
      
      <div className="form-group">
        <label className="form-label">Email Address</label>
        <input 
          type="email" 
          required 
          className="form-input" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
        />
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <input 
          type="password" 
          required 
          className="form-input" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
        />
      </div>

      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <label className="form-label">Sign in as</label>
        <select 
          className="form-input" 
          value={roleSelect} 
          onChange={e => setRoleSelect(e.target.value)}
        >
          <option value="seeker">Job Seeker</option>
          <option value="recruiter">Technical Recruiter</option>
        </select>
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
        Log In
      </button>

      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '12px' }}>
        <span style={{ color: 'var(--muted)' }}>Don't have an account? </span>
        <Link to="/register" style={{ color: 'var(--v)', textDecoration: 'none', fontWeight: 600 }}>Sign Up</Link>
      </div>
    </form>
  );
}
