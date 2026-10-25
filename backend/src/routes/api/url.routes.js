/**
 * ==============================================================================
 * FILE: backend/src/routes/api/url.routes.js
 * WHAT IT DOES: Routes for URL shortening, stats retrieval, and link deletion.
 * WHERE IT IS CALLED FROM: Mounted in src/routes/index.js.
 * WHOM IT CALLS: createLinkLimiter, urlController methods.
 * WHERE THAT CALL IS GOING: Delegates requests to controllers/url.controller.js.
 * ==============================================================================
 */

const express = require('express')
const router = express.Router()
const urlController = require('../../controllers/url.controller')
const { createLinkLimiter } = require('../../middlewares/rateLimiter.middleware')

// Link creation endpoints
router.post('/api/shorten', createLinkLimiter, urlController.createShortUrl)
router.post('/api/urls', createLinkLimiter, urlController.createShortUrl)

// Stats and deletion endpoints
router.get('/api/urls/:code', urlController.getUrlStats)
router.delete('/api/urls', urlController.deleteUrl)

// Backward-compatible root endpoints
router.post('/', createLinkLimiter, urlController.createShortUrl)
router.delete('/', urlController.deleteUrl)

module.exports = router
