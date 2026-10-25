// Central configuration resolving API URL from environment variables
// Supports Create React App (REACT_APP_API_URL) and Vite (VITE_API_URL)
const envApiUrl =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.VITE_API_URL) ||
  ''

export const API_URL = envApiUrl.replace(/\/+$/, '')

if (!API_URL && process.env.NODE_ENV !== 'production') {
  console.warn(
    'Warning: REACT_APP_API_URL or VITE_API_URL is not defined in your frontend environment.'
  )
}
