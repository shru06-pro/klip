/**
 * ==============================================================================
 * FILE: backend/src/config/constants.js
 * WHAT IT DOES: Defines system-wide constants, reserved keywords, and rate limit rules.
 * WHERE IT IS CALLED FROM: Imported by validators/url.validator.js and middlewares/rateLimiter.middleware.js.
 * WHOM IT CALLS: Set data structure.
 * WHERE THAT CALL IS GOING: In-memory immutable constants.
 * ==============================================================================
 */

const RESERVED_WORDS = new Set([
  'api',
  'health',
  'admin',
  'dashboard',
  'login',
  'register',
  'favicon.ico',
  'robots.txt',
  'static',
  'test',
])

const RATE_LIMITS = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 60, // 60 requests per window
}

const URL_CONSTRAINTS = {
  MAX_LENGTH: 2048,
  MIN_SLUG_LENGTH: 3,
  MAX_SLUG_LENGTH: 50,
  DEFAULT_SLUG_LENGTH: 6,
  DEFAULT_EXPIRY_DAYS: 30,
}

module.exports = {
  RESERVED_WORDS,
  RATE_LIMITS,
  URL_CONSTRAINTS,
}
