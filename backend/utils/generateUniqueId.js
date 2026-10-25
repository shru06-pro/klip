/**
 * ==============================================================================
 * FILE: backend/utils/generateUniqueId.js
 * WHAT IT DOES: Utility module that generates a random 6-character identifier using NanoID
 *               and verifies its uniqueness against database records in a while loop.
 * WHERE IT IS CALLED FROM: Utility helper (also implemented directly in backend/controllers/url.js).
 * WHOM IT CALLS: nanoid(6), Url.findOne({ shortUrlId }).
 * WHERE THAT CALL IS GOING: Queries database to ensure no collision, returns unique string.
 * ==============================================================================
 */

const { nanoid } = require('nanoid')
const Url = require('../models/Url')

/**
 * FUNCTION: generateUniqueId()
 * WHAT IT DOES: Continuously generates candidate 6-character nanoids until an unused one is found.
 * WHERE IT IS CALLED FROM: Link creation procedures.
 * WHOM IT CALLS: nanoid(6), Url.findOne().
 * WHERE THAT CALL IS GOING: In-memory string return of a collision-free short identifier.
 */
module.exports = async () => {
  let urlId = nanoid(6)
  while (true) {
    const urlObject = await Url.findOne({ shortUrlId: urlId })
    if (!urlObject) break
    urlId = nanoid(6)
  }
  return urlId
}