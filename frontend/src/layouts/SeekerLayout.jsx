import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Wand2, Menu } from 'lucide-react';
import TalentIQAssistant from '../components/resume/TalentIQAssistant';
import ThemeSelector from '../components/common/ThemeSelector';
import { useResumeContext } from '../pages/seeker/ResumeProfile';

// Inner layout component that can safely read the Resume context
// (context is provided by <ResumeProfile> rendered inside the <Outlet>)
function LayoutWithAssistant() {
  const resumeContext = useResumeContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout-container">
      {/* Sidebar Overlay (Active on Mobile Drawer Mode) */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} 
        onClick={() => setSidebarOpen(false)} 
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <NavLink to="/resume" className="sidebar-logo" onClick={() => setSidebarOpen(false)}>
          🧠 TalentIQ
        </NavLink>
        <nav className="sidebar-menu">
          <NavLink 
            to="/resume" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Wand2 size={16} /> AI Resume Builder
          </NavLink>
        </nav>
      </aside>

      {/* Main Panel */}
      <div className="main-content">
        <header className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            <span className="badge bg">TalentIQ Engine</span>
          </div>
          <ThemeSelector />
        </header>

        {/* Dynamic page area */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>

      {/* ── TalentIQ Resume Assistant (always-on floating panel) ── */}
      <TalentIQAssistant resumeContext={resumeContext} />
    </div>
  );
}

export default function SeekerLayout() {
  return <LayoutWithAssistant />;
}

