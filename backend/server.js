require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const { initDB } = require('./db')
const indexRouter = require('./routes/index')

// 1. Resolve environment variables with intelligent production defaults
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

const app = express()

// 2. Helmet Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow inline styles/scripts for friendly HTML 404 pages
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
)

// 3. Robust CORS supporting multiple origins and wildcard subdomains
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
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

app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: false }))

// Mount application routes
app.use('/', indexRouter)

// Global error handler
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ message: err.message })
  }
  console.error('Unhandled server error:', err)
  res.status(500).json({ message: 'Internal server error' })
})

async function startServer() {
  try {
    console.log(`Starting URL Shortener server...`)
    console.log(`BASE_URL: ${BASE_URL}`)
    console.log(`ALLOWED CLIENT ORIGIN: ${CLIENT_ORIGIN}`)

    // Initialize PostgreSQL database & schema
    await initDB()

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`)
      console.log(`Health check ready at http://localhost:${PORT}/health`)
    })
  } catch (err) {
    console.error('Failed to initialize server:', err)
    process.exit(1)
  }
}

startServer()