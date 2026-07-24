import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import SeekerLayout from './layouts/SeekerLayout';

// Seeker Pages
import ResumeProfile from './pages/seeker/ResumeProfile';
import PublicResumePage from './pages/PublicResumePage';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Redirect root directly to the AI Resume Builder */}
          <Route path="/" element={<Navigate to="/resume" replace />} />

          {/* Layout with only the AI Resume Builder */}
          <Route element={<SeekerLayout />}>
            <Route path="/resume" element={<ResumeProfile />} />
          </Route>

          {/* Public Resume View (No layout/auth) */}
          <Route path="/resume/:resumeId" element={<PublicResumePage />} />

          {/* Fallback to AI Resume Builder */}
          <Route path="*" element={<Navigate to="/resume" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}


