const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')
const urlController = require('../controllers/url')

// Rate limiting for the creation endpoint: 60 requests per 15 minutes per IP
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many link creation requests from this IP. Please try again after 15 minutes.' },
})

// Welcome / API Status endpoint
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

// Health endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  })
})

// API routes
router.post('/api/shorten', createLimiter, urlController.createShortUrl)
router.post('/api/urls', createLimiter, urlController.createShortUrl)
router.delete('/api/urls', urlController.deleteUrl)
router.get('/api/urls/:code', urlController.getUrlStats)

// Backward-compatible root API endpoints
router.post('/', createLimiter, urlController.createShortUrl)
router.delete('/', urlController.deleteUrl)

// Short link redirection: GET /:code
// Handled after specific endpoints to avoid route collisions
router.get('/:code', urlController.redirectToOriginalUrl)

module.exports = router