/**
 * ==============================================================================
 * FILE: backend/src/middlewares/error.middleware.js
 * WHAT IT DOES: Centralized enterprise error handling middleware.
 *               Catches thrown errors, formats HTTP status codes, maps CORS errors,
 *               and returns consistent JSON error payloads.
 * WHERE IT IS CALLED FROM: Mounted at the end of the Express middleware pipeline in src/app.js.
 * WHOM IT CALLS: res.status().json().
 * WHERE THAT CALL IS GOING: Serializes error response to client.
 * ==============================================================================
 */

const envConfig = require('../config/env.config')

function errorHandler(err, req, res, next) {
  // CORS rejection
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      status: 'error',
      statusCode: 403,
      message: err.message,
    })
  }

  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal server error'

  if (statusCode === 500) {
    console.error('[Error] Unhandled Exception:', err)
  }

  return res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(envConfig.NODE_ENV !== 'production' && { stack: err.stack }),
  })
}

module.exports = errorHandler
