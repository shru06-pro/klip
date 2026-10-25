/**
 * ==============================================================================
 * FILE: backend/src/routes/api/health.routes.js
 * WHAT IT DOES: Exposes GET /health probe route for uptime monitors and orchestrators.
 * WHERE IT IS CALLED FROM: Mounted in src/routes/index.js.
 * WHOM IT CALLS: healthController.getHealth.
 * WHERE THAT CALL IS GOING: Returns server and database health status JSON.
 * ==============================================================================
 */

const express = require('express')
const router = express.Router()
const healthController = require('../../controllers/health.controller')

router.get('/health', healthController.getHealth)

module.exports = router
