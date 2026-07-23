/**
 * resumePublicAPI.js
 *
 * Frontend client for the Django resume public API.
 * Used by PublicResumePage to load and track public resumes.
 */

import { getBackendUrl } from '../utils/apiConfig';

// ── Get Public Resume ──────────────────────────────────────────────────────────
/**
 * Fetches a public resume by its ID.
 * Called from PublicResumePage.
 */
export async function getPublicResume(resumeId) {
  const API_BASE = await getBackendUrl();

  const response = await fetch(`${API_BASE}/api/resume/public/${resumeId}/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Resume not found. The link may be expired or invalid.');
    }
    throw new Error(`Failed to load resume (HTTP ${response.status})`);
  }

  return response.json();
}

// ── Track Analytics Event ──────────────────────────────────────────────────────
/**
 * Increments an analytics counter. Fails silently.
 * Valid events: 'view', 'pdf_download'
 */
export async function trackEvent(resumeId, eventType) {
  if (!resumeId) return;
  const API_BASE = await getBackendUrl();
  try {
    await fetch(`${API_BASE}/api/resume/track/${resumeId}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: eventType }),
    });
  } catch {
    // Analytics never blocks UX
  }
}

export default { getPublicResume, trackEvent };
