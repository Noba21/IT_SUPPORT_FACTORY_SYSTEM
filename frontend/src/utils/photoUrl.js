/**
 * Build URL for user uploads (profile photos, screenshots).
 * Uses same origin in dev (Vite proxy) or VITE_API_URL base when set to full URL.
 */
export function getUploadUrl(path) {
  if (!path || typeof path !== 'string') return null;
  const clean = path.replace(/^\/+/, '').replace(/\\/g, '/');
  const base = import.meta.env.VITE_API_URL?.startsWith('http')
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
    : '';
  return `${base}/uploads/${clean}`;
}
