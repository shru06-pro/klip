/**
 * ==============================================================================
 * FILE: backend/src/controllers/health.controller.js
 * WHAT IT DOES: Enterprise Controller for health checks, uptime probes, and system metadata.
 * WHERE IT IS CALLED FROM: Express routes in routes/api/health.routes.js and routes/index.js.
 * WHOM IT CALLS: process.uptime(), new Date(), getDB().
 * WHERE THAT CALL IS GOING: Returns JSON telemetry to monitoring tools and load balancers.
 * ==============================================================================
 */

const { getDB } = require('../database/connection')

class HealthController {
  /**
   * API HANDLER: getIndex(req, res)
   * Handles GET / - Returns API directory.
   */
  getIndex(req, res) {
    return res.status(200).json({
      name: 'Klip. URL Shortener Backend API',
      status: 'online',
      version: '2.5.0',
      architecture: 'enterprise-layered-service-repository',
      health: '/health',
      endpoints: {
        health: 'GET /health',
        shorten: 'POST /api/shorten',
        stats: 'GET /api/urls/:code',
        delete: 'DELETE /api/urls',
      },
    })
  }

  /**
   * API HANDLER: getHealth(req, res)
   * Handles GET /health - Reports server health and database status.
   */
  async getHealth(req, res) {
    let dbStatus = 'ok'
    try {
      const db = getDB()
      await db.query('SELECT 1')
    } catch {
      dbStatus = 'degraded'
    }

    return res.status(dbStatus === 'ok' ? 200 : 503).json({
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      database: dbStatus,
    })
  }
}

module.exports = new HealthController()
