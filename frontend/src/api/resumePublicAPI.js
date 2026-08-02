/**
 * resumePublicAPI.js
 *
 * Public resume loading — first tries localStorage (no backend needed),
 * then falls back to Django backend if available.
 */

import { getBackendUrl } from '../utils/apiConfig';
import { loadFromCloudStore, isCloudId } from './resumeCloudStore';

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

/**
 * Compact URL-safe Base64 encoder for embedding resume payload in QR codes.
 * Ensures instant loading on ANY device, offline or online, without backend.
 */
export function encodeResumeToHash(resumeData) {
  if (!resumeData) return '';
  try {
    // Create a copy without massive base64 images to keep QR code size small & scannable
    const compactData = { ...resumeData };
    if (compactData.certifications && typeof compactData.certifications === 'string') {
      // Keep cert text, trim giant image strings if needed
      compactData.certifications = compactData.certifications.replace(/data:image\/[^;\s]+;base64,[A-Za-z0-9+/=]{500,}/g, '[Embedded Certificate]');
    }
    const jsonStr = JSON.stringify(compactData);
    // UTF-8 friendly Base64 encoding
    const base64 = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (match, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    ));
    return base64;
  } catch (e) {
    console.warn('Could not encode resume to URL hash:', e);
    return '';
  }
}

/**
 * Decodes URL-safe Base64 payload back to resume object.
 */
export function decodeResumeFromHash(hashStr) {
  if (!hashStr) return null;
  try {
    // Strip leading # or ?d= or d= if present
    const cleanHash = hashStr.replace(/^#/, '').replace(/^\?d=/, '').replace(/^d=/, '');
    if (!cleanHash) return null;
    const jsonStr = decodeURIComponent(
      atob(cleanHash)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonStr);
  } catch (e) {
    console.warn('Could not decode resume from URL hash:', e);
    return null;
  }
}


// ── Get Public Resume ──────────────────────────────────────────────────────────
export async function getPublicResume(resumeId) {
  // -1. Level 1 Failsafe: Check if embedded resume payload exists in URL hash or query params
  try {
    const hash = window.location.hash || window.location.search;
    const hashDataMatch = hash.match(/[#?&]d=([A-Za-z0-9%+/=]+)/);
    if (hashDataMatch && hashDataMatch[1]) {
      const decoded = decodeResumeFromHash(hashDataMatch[1]);
      if (decoded) {
        return {
          resume_id: resumeId,
          resume_data: decoded,
          view_count: 0,
          source: 'url_embedded',
        };
      }
    }
  } catch (e) {
    console.warn('Error reading URL hash payload:', e);
  }

  // 0. Level 2 Failsafe: If ID is a Cloud Store ID, load directly from Cloud Store (always online, any device)
  if (isCloudId(resumeId)) {
    try {
      const record = await loadFromCloudStore(resumeId);
      return {
        resume_id: record.resume_id || resumeId,
        resume_data: record.resume_data,
        view_count: 0,
        source: 'cloud',
      };
    } catch (e) {
      console.warn('Failed to load from Cloud Store:', e);
    }
  }


  // 1. Try localStorage next (works offline on same device)
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
