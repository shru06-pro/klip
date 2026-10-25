/**
 * ==============================================================================
 * FILE: backend/src/middlewares/rateLimiter.middleware.js
 * WHAT IT DOES: Configures request throttling for sensitive mutation endpoints.
 * WHERE IT IS CALLED FROM: Injected into routes/api/url.routes.js for link creation.
 * WHOM IT CALLS: express-rate-limit.
 * WHERE THAT CALL IS GOING: Halts excessive requests with HTTP 429 Too Many Requests.
 * ==============================================================================
 */

const rateLimit = require('express-rate-limit')
const { RATE_LIMITS } = require('../config/constants')

const createLinkLimiter = rateLimit({
  windowMs: RATE_LIMITS.WINDOW_MS,
  max: RATE_LIMITS.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many link creation requests from this IP. Please try again after 15 minutes.',
  },
})

module.exports = {
  createLinkLimiter,
}
