/**
 * ==============================================================================
 * FILE: backend/src/config/env.config.js
 * WHAT IT DOES: Centralized environment configuration module for the backend.
 *               Resolves, sanitizes, and exports all environment settings with safe
 *               enterprise defaults for PORT, BASE_URL, DATABASE_URL, and CORS origins.
 * WHERE IT IS CALLED FROM: Imported by server.js, app.js, database/connection.js,
 *                          and services/url.service.js.
 * WHOM IT CALLS: dotenv.config(), process.env, parseInt(), String.prototype.replace().
 * WHERE THAT CALL IS GOING: In-memory configuration object accessible throughout the backend.
 * ==============================================================================
 */

require('dotenv').config()

const PORT = parseInt(process.env.PORT, 10) || 5000
const BASE_URL = (process.env.BASE_URL || `http://localhost:${PORT}`).trim().replace(/\/+$/, '')
const CLIENT_ORIGIN = (process.env.FRONTEND_ORIGIN || process.env.CLIENT_ORIGIN || process.env.BASE_URL || '*').trim()
const allowedOrigins = CLIENT_ORIGIN.split(',').map((o) => o.trim().replace(/\/+$/, ''))
const DATABASE_URL = process.env.DATABASE_URL || ''
const NODE_ENV = process.env.NODE_ENV || 'development'

if (!process.env.BASE_URL && NODE_ENV === 'production') {
  console.warn(`[Config] WARNING: BASE_URL is not set. Short links will default to http://localhost:${PORT}`)
}
if (!DATABASE_URL) {
  console.log('[Config] NOTICE: DATABASE_URL not set. Running with embedded persistent PostgreSQL engine.')
}

module.exports = {
  PORT,
  BASE_URL,
  CLIENT_ORIGIN,
  allowedOrigins,
  DATABASE_URL,
  NODE_ENV,
  isProduction: NODE_ENV === 'production',
}
