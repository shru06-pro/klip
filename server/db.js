const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

let dbClient = null

async function initDB() {
  const databaseUrl = process.env.DATABASE_URL
  const schemaPath = path.join(__dirname, 'schema.sql')
  const schemaSql = fs.readFileSync(schemaPath, 'utf8')

  // If DATABASE_URL is a PostgreSQL URL, try connecting via pg.Pool
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

      // Test query
      await pool.query('SELECT 1')
      console.log('Connected to PostgreSQL database successfully.')
      await pool.query(schemaSql)
      console.log('PostgreSQL schema applied.')

      dbClient = {
        query: (text, params) => pool.query(text, params),
        close: () => pool.end(),
        type: 'postgres-pool'
      }
      return dbClient
    } catch (err) {
      console.warn('Could not connect to external PostgreSQL, falling back to embedded persistent PostgreSQL engine:', err.message)
    }
  }

  // Fallback to embedded persistent PostgreSQL engine (PGlite)
  const { PGlite } = require('@electric-sql/pglite')
  const dataDir = path.join(__dirname, '.data', 'postgres')
  fs.mkdirSync(dataDir, { recursive: true })

  console.log(`Initializing embedded persistent PostgreSQL database at ${dataDir}...`)
  const pglite = new PGlite(dataDir)
  await pglite.exec(schemaSql)
  console.log('Embedded PostgreSQL initialized and schema applied.')

  dbClient = {
    query: async (text, params) => {
      const res = await pglite.query(text, params)
      return {
        rows: res.rows || [],
        rowCount: res.affectedRows !== undefined ? res.affectedRows : (res.rows ? res.rows.length : 0)
      }
    },
    close: async () => {
      if (pglite.close) await pglite.close()
    },
    type: 'pglite-embedded'
  }
  return dbClient
}

function getDB() {
  if (!dbClient) {
    throw new Error('Database not initialized. Call initDB() first.')
  }
  return dbClient
}

module.exports = {
  initDB,
  getDB
}
