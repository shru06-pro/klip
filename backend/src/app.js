/**
 * ==============================================================================
 * FILE: backend/src/app.js
 * WHAT IT DOES: Configures and exports the core Express application instance.
 *               Mounts security headers, CORS policies, JSON parsers, route trees,
 *               and centralized error-handling middleware.
 * WHERE IT IS CALLED FROM: Imported by backend/server.js (and test suites).
 * WHOM IT CALLS: express(), helmet(), corsMiddleware, router, errorHandler.
 * WHERE THAT CALL IS GOING: Returns configured Express app instance.
 * ==============================================================================
 */

const express = require('express')
const helmet = require('helmet')
const corsMiddleware = require('./middlewares/cors.middleware')
const errorHandler = require('./middlewares/error.middleware')
const routes = require('./routes')

const app = express()

// 1. Helmet Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
)

// 2. CORS Middleware
app.use(corsMiddleware)

// 3. Body Parsers
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: false }))

// 4. Mount Application Routes
app.use('/', routes)

// 5. Global Error Handling Middleware
app.use(errorHandler)

module.exports = app
