/**
 * ==============================================================================
 * FILE: backend/server.js
 * WHAT IT DOES: Enterprise Server Bootstrap & Process Lifecycle Manager:
 *               1. Loads environment configuration.
 *               2. Bootstraps the database connection pool via initDB().
 *               3. Binds Express HTTP listener to the configured TCP PORT.
 *               4. Implements graceful shutdown traps for SIGTERM and SIGINT signals.
 * WHERE IT IS CALLED FROM: Executed by Node.js runtime ('npm start' or 'npm run dev').
 * WHOM IT CALLS: initDB(), closeDB() (from src/database/connection), app.listen().
 * WHERE THAT CALL IS GOING: Binds TCP socket on host network interface.
 * ==============================================================================
 */

const app = require('./src/app')
const { initDB, closeDB } = require('./src/database/connection')
const envConfig = require('./src/config/env.config')

let serverInstance = null

/**
 * FUNCTION: startServer()
 * WHAT IT DOES: Asynchronously initializes the database layer and starts the HTTP server.
 * WHERE IT IS CALLED FROM: Invoked immediately at process launch.
 * WHOM IT CALLS: initDB(), app.listen().
 * WHERE THAT CALL IS GOING: Binds network listener to PORT.
 */
async function startServer() {
  try {
    console.log(`[Bootstrap] Starting Klip. URL Shortener server...`)
    console.log(`[Bootstrap] BASE_URL: ${envConfig.BASE_URL}`)
    console.log(`[Bootstrap] ALLOWED ORIGINS: ${envConfig.CLIENT_ORIGIN}`)

    // 1. Initialize PostgreSQL database & verify schema
    await initDB()

    // 2. Start HTTP Listener
    serverInstance = app.listen(envConfig.PORT, () => {
      console.log(`[Bootstrap] Server running on port ${envConfig.PORT}`)
      console.log(`[Bootstrap] Health probe available at http://localhost:${envConfig.PORT}/health`)
    })
  } catch (err) {
    console.error('[Bootstrap] Failed to initialize server:', err)
    process.exit(1)
  }
}

/**
 * SECTION: Graceful Shutdown Traps
 * WHAT IT DOES: Intercepts process termination signals, closes HTTP listener,
 *               and releases database connection pool gracefully.
 */
async function handleShutdown(signal) {
  console.log(`[Shutdown] Received ${signal}. Starting graceful shutdown...`)
  if (serverInstance) {
    serverInstance.close(async () => {
      console.log('[Shutdown] HTTP server closed.')
      await closeDB()
      console.log('[Shutdown] Process exiting gracefully.')
      process.exit(0)
    })
  } else {
    await closeDB()
    process.exit(0)
  }
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'))
process.on('SIGINT', () => handleShutdown('SIGINT'))

// Bootstrap server
startServer()

module.exports = {
  app,
  startServer,
}