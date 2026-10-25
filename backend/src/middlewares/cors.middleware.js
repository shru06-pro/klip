/**
 * ==============================================================================
 * FILE: backend/src/middlewares/cors.middleware.js
 * WHAT IT DOES: Dynamic CORS middleware verifying origins against whitelisted domains and subdomains.
 * WHERE IT IS CALLED FROM: Mounted into Express app in src/app.js.
 * WHOM IT CALLS: cors(), envConfig.allowedOrigins.
 * WHERE THAT CALL IS GOING: Approves or blocks cross-origin requests.
 * ==============================================================================
 */

const cors = require('cors')
const envConfig = require('../config/env.config')

const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, curl, postman)
    if (!origin) return callback(null, true)

    const cleanOrigin = origin.replace(/\/+$/, '')
    const isAllowed = envConfig.allowedOrigins.some((allowed) => {
      if (allowed === '*' || allowed === cleanOrigin) return true
      if (allowed.startsWith('*.') && cleanOrigin.endsWith(allowed.slice(1))) return true
      return false
    })

    if (isAllowed) {
      return callback(null, true)
    }

    return callback(new Error(`CORS policy does not allow access from origin ${origin}`), false)
  },
  credentials: true,
})

module.exports = corsMiddleware
