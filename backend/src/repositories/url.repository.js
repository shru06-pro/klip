/**
 * ==============================================================================
 * FILE: backend/src/repositories/url.repository.js
 * WHAT IT DOES: Enterprise Repository layer encapsulating all direct PostgreSQL
 *               queries for URL entities. Isolates persistence logic from business services.
 * WHERE IT IS CALLED FROM: services/url.service.js.
 * WHOM IT CALLS: getDB().query() (from ../database/connection.js).
 * WHERE THAT CALL IS GOING: Executes SELECT, INSERT, UPDATE, and DELETE SQL queries on PostgreSQL.
 * ==============================================================================
 */

const { getDB } = require('../database/connection')

class UrlRepository {
  /**
   * FUNCTION: findByShortCode(shortCode)
   * WHAT IT DOES: Queries the database for a URL record matching short_code.
   * WHERE THAT CALL IS GOING: PostgreSQL `urls` table.
   */
  async findByShortCode(shortCode) {
    const db = getDB()
    const result = await db.query('SELECT * FROM urls WHERE short_code = $1', [shortCode])
    return result.rows.length > 0 ? result.rows[0] : null
  }

  /**
   * FUNCTION: findActiveByOriginalUrl(originalUrl)
   * WHAT IT DOES: Finds active (non-expired) URL record matching the given original URL for deduplication.
   * WHERE THAT CALL IS GOING: PostgreSQL `urls` table.
   */
  async findActiveByOriginalUrl(originalUrl) {
    const db = getDB()
    const result = await db.query(
      'SELECT * FROM urls WHERE original_url = $1 AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY id DESC LIMIT 1',
      [originalUrl]
    )
    return result.rows.length > 0 ? result.rows[0] : null
  }

  /**
   * FUNCTION: create({ shortCode, originalUrl, expiresAt })
   * WHAT IT DOES: Inserts a newly generated short URL record into PostgreSQL.
   * WHERE THAT CALL IS GOING: PostgreSQL `urls` table INSERT query.
   */
  async create({ shortCode, originalUrl, expiresAt }) {
    const db = getDB()
    const result = await db.query(
      `INSERT INTO urls (short_code, original_url, clicks, expires_at, created_at)
       VALUES ($1, $2, 0, $3, NOW())
       RETURNING short_code, original_url, clicks, expires_at, created_at`,
      [shortCode, originalUrl, expiresAt]
    )
    return result.rows[0]
  }

  /**
   * FUNCTION: incrementClicks(id)
   * WHAT IT DOES: Atomically increments the click counter for a link record.
   * WHERE THAT CALL IS GOING: PostgreSQL `urls` table UPDATE query.
   */
  async incrementClicks(id) {
    const db = getDB()
    return db.query('UPDATE urls SET clicks = clicks + 1 WHERE id = $1', [id])
  }

  /**
   * FUNCTION: deleteByTarget(target)
   * WHAT IT DOES: Deletes a link matching either original_url or short_code.
   * WHERE THAT CALL IS GOING: PostgreSQL `urls` table DELETE query.
   */
  async deleteByTarget(target) {
    const db = getDB()
    const result = await db.query(
      'DELETE FROM urls WHERE original_url = $1 OR short_code = $1',
      [target]
    )
    return result.rowCount > 0
  }
}

module.exports = new UrlRepository()
