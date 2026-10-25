/**
 * ==============================================================================
 * FILE: backend/src/database/connection.js
 * WHAT IT DOES: Enterprise database connection manager.
 *               1. Detects external PostgreSQL URI via envConfig.DATABASE_URL.
 *               2. Sets up pg.Pool with SSL and connection timeout handling.
 *               3. Falls back automatically to embedded persistent PGlite database
 *                  stored at `backend/.data/postgres`.
 *               4. Applies DDL schema on initialization.
 *               5. Provides `getDB()` singleton getter and `closeDB()` shutdown hook.
 * WHERE IT IS CALLED FROM: Initialized in server.js, queried by repositories/url.repository.js.
 * WHOM IT CALLS: pg.Pool, @electric-sql/pglite, fs.readFileSync(), path.join().
 * WHERE THAT CALL IS GOING: Connects to PostgreSQL server or local PGlite file storage.
 * ==============================================================================
 */

const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')
const envConfig = require('../config/env.config')

let dbClient = null

/**
 * FUNCTION: initDB()
 * WHAT IT DOES: Bootstraps the database connection and applies schema DDL statements.
 * WHERE IT IS CALLED FROM: server.js startServer().
 * WHOM IT CALLS: Pool.query(), PGlite.exec(), fs.readFileSync().
 * WHERE THAT CALL IS GOING: PostgreSQL database server or embedded file store.
 */
async function initDB() {
  const schemaPath = path.join(__dirname, 'schema.sql')
  const schemaSql = fs.readFileSync(schemaPath, 'utf8')

  // 1. If DATABASE_URL is provided and is a PostgreSQL protocol, connect via pg.Pool
  if (envConfig.DATABASE_URL && (envConfig.DATABASE_URL.startsWith('postgres://') || envConfig.DATABASE_URL.startsWith('postgresql://'))) {
    try {
      console.log('[Database] Connecting to external PostgreSQL database...')
      const pool = new Pool({
        connectionString: envConfig.DATABASE_URL,
        ssl: envConfig.isProduction && !envConfig.DATABASE_URL.includes('localhost') && !envConfig.DATABASE_URL.includes('127.0.0.1')
          ? { rejectUnauthorized: false }
          : false,
        connectionTimeoutMillis: 3000,
      })

      // Test connection
      await pool.query('SELECT 1')
      console.log('[Database] Connected to PostgreSQL database successfully.')

      // Apply schema
      await pool.query(schemaSql)
      console.log('[Database] PostgreSQL schema verified and applied.')

      dbClient = {
        query: (text, params) => pool.query(text, params),
        close: () => pool.end(),
        type: 'postgres-pool',
      }
      return dbClient
    } catch (err) {
      console.warn('[Database] Could not connect to external PostgreSQL, falling back to embedded PGlite:', err.message)
    }
  }

  // 2. Fallback to embedded persistent PostgreSQL engine (PGlite)
  const { PGlite } = require('@electric-sql/pglite')
  const dataDir = path.join(__dirname, '..', '..', '.data', 'postgres')
  fs.mkdirSync(dataDir, { recursive: true })

  console.log(`[Database] Initializing embedded persistent PostgreSQL at ${dataDir}...`)
  const pglite = new PGlite(dataDir)

  await pglite.exec(schemaSql)
  console.log('[Database] Embedded PostgreSQL initialized and schema applied.')

  dbClient = {
    query: async (text, params) => {
      const res = await pglite.query(text, params)
      return {
        rows: res.rows || [],
        rowCount: res.affectedRows !== undefined ? res.affectedRows : (res.rows ? res.rows.length : 0),
      }
    },
    close: async () => {
      if (pglite.close) await pglite.close()
    },
    type: 'pglite-embedded',
  }
  return dbClient
}

/**
 * FUNCTION: getDB()
 * WHAT IT DOES: Returns the active database client wrapper singleton.
 * WHERE IT IS CALLED FROM: Repositories and health controllers.
 * WHOM IT CALLS: In-memory dbClient reference.
 * WHERE THAT CALL IS GOING: Returns dbClient object.
 */
function getDB() {
  if (!dbClient) {
    throw new Error('Database not initialized. Call initDB() before issuing queries.')
  }
  return dbClient
}

/**
 * FUNCTION: closeDB()
 * WHAT IT DOES: Gracefully closes open database connections.
 * WHERE IT IS CALLED FROM: Process shutdown handlers (SIGTERM, SIGINT).
 * WHOM IT CALLS: dbClient.close().
 * WHERE THAT CALL IS GOING: Closes network sockets and flushes disk writes.
 */
async function closeDB() {
  if (dbClient && dbClient.close) {
    await dbClient.close()
    dbClient = null
    console.log('[Database] Database connection closed gracefully.')
  }
}

module.exports = {
  initDB,
  getDB,
  closeDB,
}
