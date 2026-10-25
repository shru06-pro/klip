/**
 * ==============================================================================
 * FILE: frontend/src/config.js
 * WHAT IT DOES: Central environment configuration module for the frontend application.
 *               Resolves and sanitizes the backend API endpoint URL across various build
 *               tools (Create React App `REACT_APP_API_URL` and Vite `VITE_API_URL`),
 *               stripping trailing slashes and providing developer warnings.
 * WHERE IT IS CALLED FROM: Imported by App.js, Main.jsx, and Shortener.jsx.
 * WHOM IT CALLS: process.env, String.prototype.replace(), console.warn().
 * WHERE THAT CALL IS GOING: Exports `API_URL` string used for all frontend HTTP requests
 *                           directed to the Express backend.
 * ==============================================================================
 */

// Resolves API URL from Create React App or Vite environment variables
const envApiUrl =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.VITE_API_URL) ||
  ''

/**
 * EXPORT: API_URL
 * Sanitized base URL string pointing to backend (e.g., 'http://localhost:5000' or 'https://api.yourdomain.com').
 */
export const API_URL = envApiUrl.replace(/\/+$/, '')

if (!API_URL && process.env.NODE_ENV !== 'production') {
  console.warn(
    'Warning: REACT_APP_API_URL or VITE_API_URL is not defined in your frontend environment.'
  )
}
