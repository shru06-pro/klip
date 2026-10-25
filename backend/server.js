require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const { initDB } = require('./db')
const indexRouter = require('./routes/index')

// 1. Fail fast on missing required environment variables
const requiredEnvVars = ['BASE_URL', 'DATABASE_URL', 'PORT']
const missingEnv = requiredEnvVars.filter((name) => !process.env[name] || !process.env[name].trim())
if (missingEnv.length > 0) {
  console.error(`\n======================================================`)
  console.error(`FATAL: Missing required environment variable(s): ${missingEnv.join(', ')}`)
  console.error(`Please define them in your server .env file or environment.`)
  console.error(`======================================================\n`)
  process.exit(1)
}

const PORT = parseInt(process.env.PORT, 10)
const BASE_URL = process.env.BASE_URL.trim()
const CLIENT_ORIGIN = (process.env.FRONTEND_ORIGIN || process.env.CLIENT_ORIGIN || process.env.BASE_URL).trim()

const app = express()

// 2. Helmet Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow inline styles/scripts for friendly HTML 404 pages
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
)

// 3. Strict CORS configured to allowed client origin
const allowedOrigins = CLIENT_ORIGIN.split(',').map((o) => o.trim())
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
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