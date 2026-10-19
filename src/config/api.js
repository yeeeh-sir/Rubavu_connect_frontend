// Central API configuration.
//
// The SPA (Vercel) and the API (Render) are deployed on different origins, so a
// relative "/api" base never reaches the backend in production. We therefore
// resolve the production backend explicitly and only fall back to the relative
// "/api" (Vite dev proxy) during local development.
//
// Precedence:
//   1. An explicit absolute HTTP(S) VITE_API_URL.
//   2. The deployed backend in production.
//   3. "/api" in development (handled by the Vite dev proxy).
const PRODUCTION_API_URL = 'https://rubavu-connect-backend.onrender.com/api';

function isAbsoluteHttpUrl(value) {
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

function resolveApiBaseUrl() {
  const configured = (import.meta.env.VITE_API_URL || '').trim();

  if (configured && (!import.meta.env.PROD || isAbsoluteHttpUrl(configured))) {
    return configured;
  }

  return import.meta.env.PROD ? PRODUCTION_API_URL : '/api';
}

export const API_BASE_URL = resolveApiBaseUrl();

export function getApiOrigin() {
  const fallbackOrigin =
    typeof window !== 'undefined' && window.location ? window.location.origin : 'http://localhost';
  return new URL(API_BASE_URL, fallbackOrigin).origin;
}
