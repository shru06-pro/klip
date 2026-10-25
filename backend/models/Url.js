/**
 * ==============================================================================
 * FILE: backend/models/Url.js
 * WHAT IT DOES: Defines an legacy MongoDB schema mapping for URL records.
 *               (The application's active persistence model runs on PostgreSQL via
 *               `backend/db.js` and `backend/schema.sql`).
 * WHERE IT IS CALLED FROM: Referenced by backend/utils/generateUniqueId.js.
 * WHOM IT CALLS: mongoose.Schema(), mongoose.model().
 * WHERE THAT CALL IS GOING: Exports Mongoose Model for MongoDB document operations.
 * ==============================================================================
 */

const mongoose = require('mongoose')

const UrlSchema = new mongoose.Schema({
  shortUrlId: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  clicks: {
    type: Number,
    required: true,
    default: 0,
  },
  date: {
    type: Date,
    required: true,
  },
})

module.exports = mongoose.model('Url', UrlSchema)