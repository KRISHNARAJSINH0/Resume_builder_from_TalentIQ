import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'
import './styles/components.css'
import './styles/charts.css'

// ── Keep Render backend alive throughout the session ─────────────────────────
// Render free tier sleeps after 15 min of inactivity.
// We ping at load AND every 10 min so the save ALWAYS succeeds → QR works on ANY device.
const RENDER_BACKEND = 'https://talentiq-backend-fu05.onrender.com';
const pingRender = () => fetch(`${RENDER_BACKEND}/api/resume/health/`, { method: 'GET' }).catch(() => {});
pingRender(); // immediate on load
setInterval(pingRender, 10 * 60 * 1000); // every 10 minutes

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
