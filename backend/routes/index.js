/**
 * ==============================================================================
 * FILE: backend/routes/index.js
 * WHAT IT DOES: Defines all HTTP endpoints and request routing rules for the API.
 *               Configures IP rate limiting on link generation, exposes health/status
 *               endpoints, and forwards requests to urlController methods.
 * WHERE IT IS CALLED FROM: Mounted into backend/server.js via app.use('/', indexRouter).
 * WHOM IT CALLS: express.Router(), express-rate-limit, urlController methods:
 *                - createShortUrl
 *                - deleteUrl
 *                - getUrlStats
 *                - redirectToOriginalUrl
 * WHERE THAT CALL IS GOING: Dispatches matching client HTTP requests to database
 *                           controller logic in backend/controllers/url.js.
 * ==============================================================================
 */

const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')
const urlController = require('../controllers/url')

/**
 * SECTION: Rate Limiter Middleware
 * WHAT IT DOES: Mitigates denial-of-service and brute-force slug exhaustion by capping
 *               link creation requests to 60 operations per 15-minute window per IP.
 * WHERE IT IS CALLED FROM: Injected as route middleware for POST /api/shorten and POST /api/urls.
 * WHOM IT CALLS: express-rate-limit internal counter.
 * WHERE THAT CALL IS GOING: Halts excessive requests with HTTP 429 Too Many Requests before
 *                           reaching the controller or database.
 */
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 60, // Limit each IP to 60 requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { message: 'Too many link creation requests from this IP. Please try again after 15 minutes.' },
})

/**
 * API ROUTE: GET /
 * WHAT IT DOES: Returns an introductory status JSON summarizing available endpoints.
 * WHERE IT IS CALLED FROM: Browser or HTTP client visiting the backend root URL.
 * WHOM IT CALLS: res.status(200).json()
 * WHERE THAT CALL IS GOING: Returns server metadata and endpoint directory to caller.
 */
router.get('/', (req, res) => {
  res.status(200).json({
    name: 'Klip. URL Shortener Backend API',
    status: 'online',
    version: '2.4.0',
    health: '/health',
    endpoints: {
      health: 'GET /health',
      shorten: 'POST /api/shorten',
      stats: 'GET /api/urls/:code',
    },
  })
})

/**
 * API ROUTE: GET /health
 * WHAT IT DOES: Health check probe reporting server status, process uptime, and ISO timestamp.
 * WHERE IT IS CALLED FROM: Render/Kubernetes health-check monitors, uptime bots, or developers.
 * WHOM IT CALLS: process.uptime(), res.status(200).json()
 * WHERE THAT CALL IS GOING: Informs deployment orchestrators that the container is healthy.
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  })
})

/**
 * API ROUTE: POST /api/shorten & POST /api/urls
 * WHAT IT DOES: Validates destination URL, verifies or generates short code, and records link.
 * WHERE IT IS CALLED FROM: Frontend Shortener component (frontend/src/components/Shortener.jsx)
 *                          via fetch(`${API_URL}/api/shorten`).
 * WHOM IT CALLS: createLimiter middleware, then urlController.createShortUrl().
 * WHERE THAT CALL IS GOING: Inserts new record into PostgreSQL `urls` table and returns JSON.
 */
router.post('/api/shorten', createLimiter, urlController.createShortUrl)
router.post('/api/urls', createLimiter, urlController.createShortUrl)

/**
 * API ROUTE: DELETE /api/urls
 * WHAT IT DOES: Permanently removes a link by matching its original_url or short_code.
 * WHERE IT IS CALLED FROM: Frontend Main component (frontend/src/components/Main.jsx deleteLink).
 * WHOM IT CALLS: urlController.deleteUrl().
 * WHERE THAT CALL IS GOING: Executes DELETE query on PostgreSQL `urls` table.
 */
router.delete('/api/urls', urlController.deleteUrl)

/**
 * API ROUTE: GET /api/urls/:code
 * WHAT IT DOES: Fetches click metrics, creation date, and expiration timestamp for a short link.
 * WHERE IT IS CALLED FROM: Frontend Main component (frontend/src/components/Main.jsx syncClicks)
 *                          on page mount to update click statistics.
 * WHOM IT CALLS: urlController.getUrlStats().
 * WHERE THAT CALL IS GOING: Executes SELECT query on PostgreSQL `urls` table for the matching code.
 */
router.get('/api/urls/:code', urlController.getUrlStats)

/**
 * BACKWARD-COMPATIBLE ROOT ENDPOINTS
 * WHAT IT DOES: Provides fallback support for legacy API clients posting directly to root `/`.
 * WHERE IT IS CALLED FROM: Legacy third-party client integrations.
 * WHOM IT CALLS: urlController.createShortUrl(), urlController.deleteUrl().
 * WHERE THAT CALL IS GOING: Handled by PostgreSQL controller methods.
 */
router.post('/', createLimiter, urlController.createShortUrl)
router.delete('/', urlController.deleteUrl)

/**
 * API ROUTE: GET /:code
 * WHAT IT DOES: Resolves a short code, increments the click counter, and issues a 302 redirect.
 * WHERE IT IS CALLED FROM: User clicking or visiting any shortened URL (e.g., https://klip.it/xyz123).
 * WHOM IT CALLS: urlController.redirectToOriginalUrl().
 * WHERE THAT CALL IS GOING: Queries PostgreSQL `urls`, updates clicks, and redirects client
 *                           browser to the original target destination URL (or 404/410 page).
 */
router.get('/:code', urlController.redirectToOriginalUrl)

module.exports = router