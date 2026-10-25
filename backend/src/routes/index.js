/**
 * ==============================================================================
 * FILE: backend/src/routes/index.js
 * WHAT IT DOES: Central route aggregator combining health, API endpoints, and redirect routes.
 * WHERE IT IS CALLED FROM: Mounted into Express app in src/app.js via app.use('/', router).
 * WHOM IT CALLS: healthRoutes, urlRoutes, urlController.redirectToOriginalUrl, healthController.getIndex.
 * WHERE THAT CALL IS GOING: Dispatches matching client requests to appropriate sub-routers.
 * ==============================================================================
 */

const express = require('express')
const router = express.Router()

const healthRoutes = require('./api/health.routes')
const urlRoutes = require('./api/url.routes')
const healthController = require('../controllers/health.controller')
const urlController = require('../controllers/url.controller')

// API index / welcome route
router.get('/', healthController.getIndex)

// Health routes (/health)
router.use('/', healthRoutes)

// API URL shortener routes (/api/shorten, /api/urls, /api/urls/:code)
router.use('/', urlRoutes)

// Short link redirection: GET /:code (Mounted last to avoid route collisions)
router.get('/:code', urlController.redirectToOriginalUrl)

module.exports = router
