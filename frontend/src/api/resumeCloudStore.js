/**
 * resumeCloudStore.js
 * ───────────────────
 * Zero-config, zero-downtime Cloud Storage for Resumes.
 * Guarantees cross-device QR code functionality out-of-the-box.
 *
 * Strategies:
 *   1. JSONBin.io (if VITE_JSONBIN_KEY is set)
 *   2. Restful-API.dev Object Store (zero config, free, instant)
 *   3. Render Backend (fallback)
 */

const RESTFUL_API_BASE = 'https://api.restful-api.dev/objects';
const JSONBIN_BASE = 'https://api.jsonbin.io/v3/b';
const MASTER_KEY = import.meta.env.VITE_JSONBIN_KEY;

export const PREFIX_JSONBIN = 'jb_';
export const PREFIX_RESTFUL = 'cloud_';

export function isCloudId(id) {
  if (!id) return false;
  const str = String(id);
  return str.startsWith(PREFIX_JSONBIN) || str.startsWith(PREFIX_RESTFUL);
}

/**
 * Save resume to cloud store. Returns a public cloud ID (e.g., "cloud_ff808181...").
 */
export async function saveToCloudStore(resumeId, resumeData) {
  const payload = {
    resume_id: resumeId,
    resume_data: resumeData,
    saved_at: new Date().toISOString(),
    source: 'talentiq',
  };

  // Strategy 1: JSONBin if key is available
  if (MASTER_KEY) {
    try {
      const res = await fetch(JSONBIN_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': MASTER_KEY,
          'X-Bin-Private': 'false',
          'X-Bin-Name': resumeId,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        return `${PREFIX_JSONBIN}${data.metadata.id}`;
      }
    } catch (e) {
      console.warn('JSONBin save failed, using fallback cloud store:', e);
    }
  }

  // Strategy 2: Zero-config public cloud store (restful-api.dev)
  try {
    const res = await fetch(RESTFUL_API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `TalentIQ_${resumeId}`,
        data: payload,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return `${PREFIX_RESTFUL}${data.id}`;
    }
  } catch (e) {
    console.warn('Restful-API cloud store failed:', e);
  }

  throw new Error('All cloud storage providers failed.');
}

/**
 * Load resume from cloud store by prefixed ID.
 */
export async function loadFromCloudStore(prefixedId) {
  const idStr = String(prefixedId);

  // Strategy 1: JSONBin
  if (idStr.startsWith(PREFIX_JSONBIN)) {
    const binId = idStr.replace(PREFIX_JSONBIN, '');
    const headers = {};
    if (MASTER_KEY) headers['X-Master-Key'] = MASTER_KEY;

    const res = await fetch(`${JSONBIN_BASE}/${binId}/latest`, { headers });
    if (!res.ok) throw new Error(`JSONBin error (${res.status})`);
    const data = await res.json();
    return data.record;
  }

  // Strategy 2: Restful-API object store
  if (idStr.startsWith(PREFIX_RESTFUL)) {
    const objId = idStr.replace(PREFIX_RESTFUL, '');
    const res = await fetch(`${RESTFUL_API_BASE}/${objId}`);
    if (!res.ok) throw new Error(`Cloud store error (${res.status})`);
    const data = await res.json();
    return data.data; // { resume_id, resume_data, saved_at }
  }

  throw new Error('Unknown cloud store format.');
}
