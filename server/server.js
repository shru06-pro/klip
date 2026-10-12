require('dotenv').config()
const mongoose = require('mongoose')
const cors = require('cors')
const express = require('express')
const app = express()

const indexRouter = require('./routes/index')

const PORT = process.env.PORT || 5000

app.get('/test', (req, res) => {
    res.send('test route')
})

// Enable CORS for all origins
app.use(cors())
app.use(express.json())
app.use('/', indexRouter)

async function startServer() {
    const dbUrl = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/url-shortener'
    try {
        console.log('Attempting to connect to MongoDB...')
        await mongoose.connect(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 2000
        })
        console.log('Database connection successfull')
    } catch (err) {
        console.log('External MongoDB not reachable, starting embedded MongoDB fallback...')
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server')
            const mongod = await MongoMemoryServer.create()
            const uri = mongod.getUri()
            await mongoose.connect(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            })
            console.log(`Database connection successfull (embedded MongoDB at ${uri})`)
        } catch (embeddedErr) {
            console.error('Failed to connect to embedded database:', embeddedErr)
        }
    }

    app.listen(PORT, () => {
        console.log(`Server running on ${PORT}`)
    })
}

startServer()