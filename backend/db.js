/**
 * ==============================================================================
 * FILE: backend/db.js
 * WHAT IT DOES: Central database management module for the Klip. backend.
 *               1. Detects whether an external PostgreSQL server connection is available
 *                  via process.env.DATABASE_URL.
 *               2. Automatically falls back to an embedded persistent PostgreSQL engine
 *                  (@electric-sql/pglite) stored locally in `backend/.data/postgres`
 *                  if no external database is configured or reachable.
 *               3. Reads and applies `backend/schema.sql` on startup to ensure tables exist.
 *               4. Exports `initDB()` for initialization and `getDB()` for query execution.
 * WHERE IT IS CALLED FROM: Initialized in backend/server.js startServer(),
 *                          and queried by backend/controllers/url.js methods.
 * WHOM IT CALLS: pg.Pool (external PostgreSQL driver), @electric-sql/pglite (embedded),
 *                fs.readFileSync(), path.join().
 * WHERE THAT CALL IS GOING: Connects via TCP to external PostgreSQL instance or writes
 *                           to local persistent disk directory `backend/.data/postgres`.
 * ==============================================================================
 */

const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

let dbClient = null

/**
 * FUNCTION: initDB()
 * WHAT IT DOES: Bootstraps the database connection:
 *               1. Reads `backend/schema.sql` from disk.
 *               2. If DATABASE_URL starts with 'postgres://' or 'postgresql://', creates a
 *                  connection pool with pg.Pool, verifies with 'SELECT 1', and applies schema.
 *               3. If external connection fails or is absent, initializes embedded PGlite
 *                  at `backend/.data/postgres` and applies schema.
 *               4. Normalizes query return format so callers always receive { rows, rowCount }.
 * WHERE IT IS CALLED FROM: Called by startServer() in backend/server.js during startup.
 * WHOM IT CALLS: fs.readFileSync(), new Pool(), pool.query(), PGlite(), pglite.exec().
 * WHERE THAT CALL IS GOING: Executes DDL schema setup in PostgreSQL / PGlite database.
 */
async function initDB() {
  const databaseUrl = process.env.DATABASE_URL
  const schemaPath = path.join(__dirname, 'schema.sql')

  // FUNCTION CALL: fs.readFileSync()
  // - WHAT IT DOES: Loads the SQL table definitions from schema.sql.
  // - WHERE THAT CALL IS GOING: Reads local file `backend/schema.sql`.
  const schemaSql = fs.readFileSync(schemaPath, 'utf8')

  // 1. If DATABASE_URL is a PostgreSQL URL, try connecting via pg.Pool
  if (databaseUrl && (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://'))) {
    try {
      console.log('Connecting to PostgreSQL database...')
      const pool = new Pool({
        connectionString: databaseUrl,
        ssl: process.env.NODE_ENV === 'production' && !databaseUrl.includes('localhost') && !databaseUrl.includes('127.0.0.1')
          ? { rejectUnauthorized: false }
          : false,
        connectionTimeoutMillis: 3000,
      })

      // Test database connectivity
      await pool.query('SELECT 1')
      console.log('Connected to PostgreSQL database successfully.')

      // Apply table schema (CREATE TABLE IF NOT EXISTS urls...)
      await pool.query(schemaSql)
      console.log('PostgreSQL schema applied.')

      dbClient = {
        query: (text, params) => pool.query(text, params),
        close: () => pool.end(),
        type: 'postgres-pool',
      }
      return dbClient
    } catch (err) {
      console.warn('Could not connect to external PostgreSQL, falling back to embedded persistent PostgreSQL engine:', err.message)
    }
  }

  // 2. Fallback to embedded persistent PostgreSQL engine (PGlite)
  const { PGlite } = require('@electric-sql/pglite')
  const dataDir = path.join(__dirname, '.data', 'postgres')
  fs.mkdirSync(dataDir, { recursive: true })

  console.log(`Initializing embedded persistent PostgreSQL database at ${dataDir}...`)
  const pglite = new PGlite(dataDir)

  // Apply table schema into embedded PGlite instance
  await pglite.exec(schemaSql)
  console.log('Embedded PostgreSQL initialized and schema applied.')

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
 * WHAT IT DOES: Returns the active singleton database client wrapper.
 *               Throws a descriptive error if called before initDB() has resolved.
 * WHERE IT IS CALLED FROM: Called by backend/controllers/url.js whenever an API route
 *                          needs to perform database SELECT, INSERT, UPDATE, or DELETE operations.
 * WHOM IT CALLS: Returns internal `dbClient` reference.
 * WHERE THAT CALL IS GOING: In-memory reference returned to caller.
 */
function getDB() {
  if (!dbClient) {
    throw new Error('Database not initialized. Call initDB() first.')
  }
  return dbClient
}

module.exports = {
  initDB,
  getDB,
}
