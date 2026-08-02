import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'
import './styles/components.css'
import './styles/charts.css'

// ── Wake up Render backend silently on app load ───────────────────────────────
// Render free tier sleeps after 15 min. Ping it NOW so by the time the user
// finishes the resume form (~5 min), Render is awake and the save will succeed.
// This makes QR codes work from ANY device — the resume is stored on Render's DB.
const RENDER_BACKEND = 'https://talentiq-backend-fu05.onrender.com';
(async () => {
  try {
    await fetch(`${RENDER_BACKEND}/api/resume/health/`, { method: 'GET' });
  } catch {
    // Silent — never blocks the UI
  }
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
