import React, { useContext, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Building, Users, BarChart3, LineChart, LogOut, Settings, Menu
} from 'lucide-react';

export default function RecruiterLayout() {
  const { user, setRole, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleRoleToggle = (e) => {
    const val = e.target.value;
    setRole(val);
    if (val === 'recruiter') {
      navigate('/recruiter');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="layout-container">
      {/* Sidebar Overlay for Mobile drawer view */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} 
        onClick={() => setSidebarOpen(false)} 
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <NavLink to="/recruiter" className="sidebar-logo" style={{ color: 'var(--t)' }} onClick={() => setSidebarOpen(false)}>
          🏢 TalentIQ
        </NavLink>
        <nav className="sidebar-menu">
          <NavLink to="/recruiter" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <Building size={16} /> Overview
          </NavLink>
          <NavLink to="/recruiter/talent" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <Users size={16} /> Talent Pool
          </NavLink>
          <NavLink to="/recruiter/analytics" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <BarChart3 size={16} /> Market Analytics
          </NavLink>
          <NavLink to="/recruiter/forecast" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <LineChart size={16} /> Hiring Forecast
          </NavLink>
        </nav>
        
        {/* Footer log out */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <button onClick={logout} className="sidebar-link" style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => setSidebarOpen(true)}
              className="btn-menu-toggle"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text)',
                cursor: 'pointer',
                display: 'none', // Block display handled in media queries
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                marginRight: '8px'
              }}
              title="Open Navigation"
            >
              <Menu size={20} />
            </button>
            <span className="badge bt">Recruiter Portal</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Quick Demo Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>Demo Role:</span>
              <select 
                value="recruiter" 
                onChange={handleRoleToggle}
                style={{
                  background: 'var(--s2)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer'
                }}
              >
                <option value="seeker">Job Seeker</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>

            {/* User display */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150" 
                alt="Recruiter" 
                style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--border)' }}
              />
              <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>Anjali Sharma</span>
            </div>
          </div>
        </header>

        {/* Dynamic page area */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
