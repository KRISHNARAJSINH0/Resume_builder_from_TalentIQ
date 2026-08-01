import React from 'react';
import { Outlet } from 'react-router-dom';
import TalentIQAssistant from '../components/resume/TalentIQAssistant';
import { useResumeContext } from '../pages/seeker/ResumeProfile';

function LayoutWithAssistant() {
  const resumeContext = useResumeContext();

  return (
    <div className="layout-container">
      <div className="main-content">
        {/* Glassmorphism Topbar — no sidebar */}
        <header className="topbar">
          <a href="/resume" className="topbar-logo">
            🧠 TalentIQ
          </a>
          <span className="badge bp">✦ AI Resume Engine</span>
        </header>

        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>

      <TalentIQAssistant resumeContext={resumeContext} />
    </div>
  );
}

export default function SeekerLayout() {
  return <LayoutWithAssistant />;
}
