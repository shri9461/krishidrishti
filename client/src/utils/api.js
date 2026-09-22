// Central API base resolution.
// - Dev (vite proxy): VITE_API_URL is unset -> relative URLs -> localhost:5000 proxy.
// - Render (single service): unset -> relative URLs -> same-origin Express server.
// - Vercel (separate frontend): set VITE_API_URL to the Render backend URL,
//   e.g. VITE_API_URL=https://krishidrishti.onrender.com
const RAW_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

/** Prefix a path like '/api/dashboard' with the backend origin. */
export const apiUrl = (path) => `${RAW_BASE}${path}`;

/** Backend origin (no trailing slash), or '' when same-origin. */
export const API_BASE = RAW_BASE;

/** Socket.io server URL: explicit backend in prod, vite proxy target in dev. */
export const SOCKET_URL =
  RAW_BASE || (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin);
