/**
 * resumePublicAPI.js
 *
 * Public resume loading — first tries localStorage (no backend needed),
 * then falls back to Django backend if available.
 */

import { getBackendUrl } from '../utils/apiConfig';

const STORAGE_PREFIX = 'talentiq_resume_';

// ── Save Resume to localStorage (called after generation) ──────────────────────
export function saveResumeLocally(resumeId, resumeData) {
  try {
    const payload = {
      resume_id: resumeId,
      resume_data: resumeData,
      saved_at: new Date().toISOString(),
    };
    localStorage.setItem(`${STORAGE_PREFIX}${resumeId}`, JSON.stringify(payload));
  } catch (e) {
    console.warn('Could not save resume to localStorage:', e);
  }
}

// ── Get Public Resume ──────────────────────────────────────────────────────────
export async function getPublicResume(resumeId) {
  // 1. Try localStorage first (works offline, no backend needed)
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${resumeId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        resume_id: parsed.resume_id,
        resume_data: parsed.resume_data,
        view_count: 0,
        source: 'local',
      };
    }
  } catch (e) {
    // localStorage unavailable or corrupted — fall through to backend
  }

  // 2. Try Django backend with retry (Render may be waking up)
  try {
    const API_BASE = await getBackendUrl();
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await fetch(`${API_BASE}/api/resume/public/${resumeId}/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) return response.json();
        if (response.status === 404) break; // Resume doesn't exist — no point retrying
      } catch {
        if (attempt < 2) await new Promise(r => setTimeout(r, 3000)); // wait 3s
      }
    }
  } catch {
    // Backend unavailable
  }


  throw new Error('Resume not found. The link may be expired or the resume was created on a different device.');
}

// ── Track Analytics Event ──────────────────────────────────────────────────────
export async function trackEvent(resumeId, eventType, via = 'direct') {
  if (!resumeId) return;
  try {
    const API_BASE = await getBackendUrl();
    await fetch(`${API_BASE}/api/resume/track/${resumeId}/?via=${via}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: eventType }),
    });
  } catch {
    // Analytics never blocks UX
  }
}

export default { getPublicResume, trackEvent, saveResumeLocally };
