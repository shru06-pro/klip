/**
 * ==============================================================================
 * FILE: backend/server.js
 * WHAT IT DOES: Core application server file for the Klip. URL Shortener backend.
 *               Loads environment variables, configures security headers (Helmet),
 *               manages Cross-Origin Resource Sharing (CORS), sets up JSON body
 *               parsers, connects to the database via initDB(), mounts API routes,
 *               and starts listening on the configured HTTP port.
 * WHERE IT IS CALLED FROM: Started by Node.js runtime via 'npm start' or 'npm run dev'
 * WHOM IT CALLS: dotenv.config(), express(), helmet(), cors(), express.json(),
 *                express.urlencoded(), initDB() (from ./db), app.listen()
 * WHERE THAT CALL IS GOING: Binds to local network interface (PORT 5000 / process.env.PORT)
 * ==============================================================================
 */

// FUNCTION CALL: dotenv.config()
// - WHAT IT DOES: Loads environment variables from the local .env file into process.env.
// - WHERE IT IS CALLED FROM: Executed immediately at server startup.
// - WHOM IT CALLS: dotenv internal filesystem parser.
// - WHERE THAT CALL IS GOING: Reads from `backend/.env` (or root `.env`) into process memory.
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const { initDB } = require('./db')
const indexRouter = require('./routes/index')

/**
 * SECTION: Environment Resolution & Intelligent Production Defaults
 * WHAT IT DOES: Parses network port, resolves public base URL for shortened links,
 *               and extracts allowed frontend origin domains for CORS validation.
 */
const PORT = parseInt(process.env.PORT, 10) || 5000
const BASE_URL = (process.env.BASE_URL || `http://localhost:${PORT}`).trim().replace(/\/+$/, '')
const CLIENT_ORIGIN = (process.env.FRONTEND_ORIGIN || process.env.CLIENT_ORIGIN || process.env.BASE_URL || '*').trim()
const allowedOrigins = CLIENT_ORIGIN.split(',').map((o) => o.trim().replace(/\/+$/, ''))

if (!process.env.BASE_URL && process.env.NODE_ENV === 'production') {
  console.warn('WARNING: BASE_URL is not set. Short links will default to http://localhost:' + PORT)
}
if (!process.env.DATABASE_URL) {
  console.log('NOTICE: DATABASE_URL not set. Running with embedded persistent PostgreSQL engine.')
}

// FUNCTION CALL: express()
// - WHAT IT DOES: Initializes the top-level Express application instance.
// - WHERE IT IS CALLED FROM: Server initialization block.
// - WHOM IT CALLS: Express application factory.
// - WHERE THAT CALL IS GOING: Allocates the app HTTP request pipeline.
const app = express()

/**
 * SECTION: Security Headers (Helmet)
 * WHAT IT DOES: Secures the HTTP response headers against clickjacking, sniffing,
 *               and sets cross-origin resource policy.
 * WHERE IT IS CALLED FROM: Mounted into Express middleware pipeline.
 * WHOM IT CALLS: helmet() middleware.
 * WHERE THAT CALL IS GOING: Attached to every incoming HTTP response header.
 */
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows inline styles/scripts for friendly HTML 404/410 pages
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
)

/**
 * SECTION: Cross-Origin Resource Sharing (CORS) Middleware
 * WHAT IT DOES: Dynamically evaluates whether incoming request origin headers
 *               match allowed whitelist origins or subdomains.
 * WHERE IT IS CALLED FROM: Express middleware stack for every incoming HTTP request.
 * WHOM IT CALLS: Origin verification callback(err, boolean).
 * WHERE THAT CALL IS GOING: Approves or blocks cross-origin requests from frontend clients.
 */
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true)
      const cleanOrigin = origin.replace(/\/+$/, '')
      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed === '*' || allowed === cleanOrigin) return true
        if (allowed.startsWith('*.') && cleanOrigin.endsWith(allowed.slice(1))) return true
        return false
      })
      if (isAllowed) {
        return callback(null, true)
      }
      return callback(new Error(`CORS policy does not allow access from origin ${origin}`), false)
    },
    credentials: true,
  })
)

// FUNCTION CALL: app.use(express.json()) & express.urlencoded()
// - WHAT IT DOES: Parses incoming request bodies containing JSON or URL-encoded payloads.
// - WHERE IT IS CALLED FROM: Incoming request middleware pipeline.
// - WHOM IT CALLS: Express body-parser subsystem.
// - WHERE THAT CALL IS GOING: Populates `req.body` on all router endpoints.
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: false }))

/**
 * SECTION: Application Routing Middleware
 * WHAT IT DOES: Mounts the main API routes from `./routes/index.js` at the root path.
 * WHERE IT IS CALLED FROM: Root middleware chain.
 * WHOM IT CALLS: indexRouter (from ./routes/index.js)
 * WHERE THAT CALL IS GOING: Dispatches matching HTTP requests to specific controller handlers.
 */
app.use('/', indexRouter)

/**
 * SECTION: Global Error Handling Middleware
 * WHAT IT DOES: Catches unhandled exceptions and CORS rejection errors.
 * WHERE IT IS CALLED FROM: Triggered automatically by Express next(err) calls.
 * WHOM IT CALLS: res.status().json()
 * WHERE THAT CALL IS GOING: Sends HTTP 403 (CORS) or HTTP 500 (Server Error) JSON to caller.
 */
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ message: err.message })
  }
  console.error('Unhandled server error:', err)
  res.status(500).json({ message: 'Internal server error' })
})

/**
 * FUNCTION: startServer()
 * WHAT IT DOES: Asynchronously initializes the database layer (PostgreSQL / PGlite)
 *               and starts the HTTP listener on the configured PORT.
 * WHERE IT IS CALLED FROM: Direct execution at the bottom of server.js during startup.
 * WHOM IT CALLS: initDB() in ./db.js, app.listen()
 * WHERE THAT CALL IS GOING: Calls PostgreSQL to apply schema, then opens TCP port on host.
 */
async function startServer() {
  try {
    console.log(`Starting URL Shortener server...`)
    console.log(`BASE_URL: ${BASE_URL}`)
    console.log(`ALLOWED CLIENT ORIGIN: ${CLIENT_ORIGIN}`)

    // FUNCTION CALL: initDB()
    // - WHAT IT DOES: Establishes database connection and applies schema.sql tables.
    // - WHERE IT IS CALLED FROM: startServer()
    // - WHOM IT CALLS: initDB() exported by ./db.js
    // - WHERE THAT CALL IS GOING: PostgreSQL database server or embedded PGlite file storage.
    await initDB()

    // FUNCTION CALL: app.listen(PORT)
    // - WHAT IT DOES: Binds Express HTTP listener to the designated TCP port.
    // - WHERE IT IS CALLED FROM: startServer()
    // - WHOM IT CALLS: Node.js http.Server.listen()
    // - WHERE THAT CALL IS GOING: Listens for incoming HTTP network connections on 0.0.0.0:PORT
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`)
      console.log(`Health check ready at http://localhost:${PORT}/health`)
    })
  } catch (err) {
    console.error('Failed to initialize server:', err)
    process.exit(1)
  }
}

// FUNCTION CALL: startServer()
// Initiates the server bootstrapping lifecycle.
startServer()