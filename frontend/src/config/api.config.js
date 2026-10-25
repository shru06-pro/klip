/**
 * ==============================================================================
 * FILE: frontend/src/config/api.config.js
 * WHAT IT DOES: Centralized API configuration module.
 *               Resolves backend API URL from CRA/Vite environment variables,
 *               strips trailing slashes, and exposes service endpoint constants.
 * WHERE IT IS CALLED FROM: services/api.service.js, App.js, and config.js proxy.
 * ==============================================================================
 */

const envApiUrl =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.VITE_API_URL) ||
  ''

export const API_URL = envApiUrl.replace(/\/+$/, '')

if (!API_URL && process.env.NODE_ENV !== 'production') {
  console.warn(
    '[Config] Warning: REACT_APP_API_URL is not defined in your frontend environment.'
  )
}

export const API_ENDPOINTS = {
  SHORTEN: `${API_URL}/api/shorten`,
  URLS: `${API_URL}/api/urls`,
  HEALTH: `${API_URL}/health`,
}
