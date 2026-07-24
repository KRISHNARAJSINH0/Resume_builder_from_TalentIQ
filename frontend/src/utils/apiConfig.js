let cachedApiBase = null;

/**
 * Dynamically resolves the active Django backend URL.
 * It checks the VITE_API_BASE_URL first, then probes common Django ports
 * (8010, 8009, 8008, 8000) to find the active running port.
 */
export async function getBackendUrl() {
  if (cachedApiBase) return cachedApiBase;

  const hostname = window.location.hostname;
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  // Skip port probing in production or when not on localhost
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
  if (!isLocalhost) {
    cachedApiBase = envUrl || '';
    return cachedApiBase;
  }

  // Try VITE_API_BASE_URL first
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

  // Probe other ports in parallel
  const probes = ports.map(async (port) => {
    const url = `http://${hostname}:${port}`;
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 150);
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
    // Default fallback
    cachedApiBase = envUrl || `http://${hostname}:8000`;
    return cachedApiBase;
  }
}
