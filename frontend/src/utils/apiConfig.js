let cachedApiBase = null;

const DEFAULT_RENDER_BACKEND = 'https://talentiq-backend-fu05.onrender.com';

/**
 * Dynamically resolves the active Django backend URL.
 * Checks VITE_API_BASE_URL first, then falls back to default Render backend in production.
 */
export async function getBackendUrl() {
  if (cachedApiBase) return cachedApiBase;

  const hostname = window.location.hostname;
  let envUrl = import.meta.env.VITE_API_BASE_URL;

  // Clean trailing slash AND trailing /api if the env var was set with /api suffix
  // (prevents the /api/api/resume/... double-prefix bug)
  if (envUrl) {
    envUrl = envUrl.replace(/\/+$/, '');    // strip trailing slashes
    envUrl = envUrl.replace(/\/api$/, ''); // strip trailing /api
  }


  // Skip port probing in production (on Vercel / non-localhost)
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
  if (!isLocalhost) {
    cachedApiBase = envUrl || DEFAULT_RENDER_BACKEND;
    return cachedApiBase;
  }

  // Try VITE_API_BASE_URL first on localhost
  if (envUrl) {
    try {
      const response = await fetch(`${envUrl}/api/resume/`);
      if (response.ok || response.status === 401 || response.status === 403) {
        cachedApiBase = envUrl;
        return envUrl;
      }
    } catch (e) {
      // Ignore and proceed to probe ports
    }
  }

  const ports = [8010, 8009, 8008, 8000, 8011, 8001];

  // Probe other ports in parallel on localhost
  const probes = ports.map(async (port) => {
    const url = `http://${hostname}:${port}`;
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 200);
      const response = await fetch(`${url}/api/resume/`, { signal: controller.signal });
      clearTimeout(id);
      if (response.ok || response.status === 401 || response.status === 403) {
        return url;
      }
    } catch (e) {
      // Ignore
    }
    throw new Error('Not responding');
  });

  try {
    const activeUrl = await Promise.any(probes);
    cachedApiBase = activeUrl;
    return activeUrl;
  } catch (e) {
    // Default fallback for local dev
    cachedApiBase = envUrl || `http://${hostname}:8000`;
    return cachedApiBase;
  }
}
