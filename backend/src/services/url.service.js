/**
 * ==============================================================================
 * FILE: backend/src/services/url.service.js
 * WHAT IT DOES: Enterprise Business Service layer for the URL Shortener domain:
 *               1. Coordinates URL format validation and custom slug validation.
 *               2. Generates collision-free random NanoID slugs or verifies custom aliases.
 *               3. Calculates expiration dates (Auto-30d support).
 *               4. Orchestrates deduplication and database persistence via UrlRepository.
 *               5. Resolves shortcodes to target URLs and tracks click metrics.
 * WHERE IT IS CALLED FROM: controllers/url.controller.js.
 * WHOM IT CALLS: urlRepository, urlValidator, nanoid, envConfig.
 * WHERE THAT CALL IS GOING: Returns domain data objects to the controller layer.
 * ==============================================================================
 */

const { nanoid } = require('nanoid')
const urlRepository = require('../repositories/url.repository')
const { validateUrl, validateSlug } = require('../validators/url.validator')
const { RESERVED_WORDS, URL_CONSTRAINTS } = require('../config/constants')
const envConfig = require('../config/env.config')

class UrlService {
  /**
   * FUNCTION: shortenUrl({ url, slug, autoExpire })
   * WHAT IT DOES: Business logic workflow to create or retrieve a short URL record.
   * WHERE IT IS CALLED FROM: controllers/url.controller.js createShortUrl().
   * WHOM IT CALLS: validateUrl(), validateSlug(), urlRepository.findActiveByOriginalUrl(),
   *                urlRepository.findByShortCode(), urlRepository.create(), nanoid().
   * WHERE THAT CALL IS GOING: Returns formatted link object or throws domain error.
   */
  async shortenUrl({ url, slug, autoExpire }) {
    // 1. URL validation
    const urlCheck = validateUrl(url, envConfig.BASE_URL)
    if (!urlCheck.valid) {
      const err = new Error(urlCheck.error)
      err.statusCode = 400
      throw err
    }
    const cleanUrl = urlCheck.url

    let shortCode

    if (slug && slug.trim()) {
      // 2. Custom slug validation & uniqueness check
      const slugCheck = validateSlug(slug)
      if (!slugCheck.valid) {
        const err = new Error(slugCheck.error)
        err.statusCode = 400
        throw err
      }
      shortCode = slugCheck.slug

      const existingSlug = await urlRepository.findByShortCode(shortCode)
      if (existingSlug) {
        const err = new Error(`Custom slug '${shortCode}' is already in use`)
        err.statusCode = 409
        throw err
      }
    } else {
      // 3. Deduplication for automatic slugs if identical link already exists and is active
      const existing = await urlRepository.findActiveByOriginalUrl(cleanUrl)
      if (existing) {
        return {
          shortUrl: `${envConfig.BASE_URL}/${existing.short_code}`,
          shortCode: existing.short_code,
          clicks: existing.clicks,
          expires_at: existing.expires_at,
          created_at: existing.created_at,
          isExisting: true,
        }
      }

      // Generate unique random 6-character code
      while (true) {
        const candidate = nanoid(URL_CONSTRAINTS.DEFAULT_SLUG_LENGTH)
        if (RESERVED_WORDS.has(candidate.toLowerCase())) continue
        const check = await urlRepository.findByShortCode(candidate)
        if (!check) {
          shortCode = candidate
          break
        }
      }
    }

    // 4. Calculate expiration date if autoExpire is set
    let expiresAt = null
    if (autoExpire === true || autoExpire === 'true' || autoExpire === 30) {
      expiresAt = new Date(Date.now() + URL_CONSTRAINTS.DEFAULT_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
    }

    // 5. Persist via repository
    const record = await urlRepository.create({
      shortCode,
      originalUrl: cleanUrl,
      expiresAt,
    })

    return {
      shortUrl: `${envConfig.BASE_URL}/${record.short_code}`,
      shortCode: record.short_code,
      clicks: record.clicks,
      expires_at: record.expires_at,
      created_at: record.created_at,
      isExisting: false,
    }
  }

  /**
   * FUNCTION: resolveDestination(code)
   * WHAT IT DOES: Resolves a shortcode to its original destination URL and increments clicks.
   * WHERE IT IS CALLED FROM: controllers/url.controller.js redirectToOriginalUrl().
   * WHOM IT CALLS: urlRepository.findByShortCode(), urlRepository.incrementClicks().
   * WHERE THAT CALL IS GOING: Returns { originalUrl, isExpired, isNotFound }.
   */
  async resolveDestination(code) {
    if (!code || RESERVED_WORDS.has(code.toLowerCase())) {
      return { status: 'NOT_FOUND' }
    }

    const record = await urlRepository.findByShortCode(code)
    if (!record) {
      return { status: 'NOT_FOUND' }
    }

    if (record.expires_at && new Date() > new Date(record.expires_at)) {
      return { status: 'EXPIRED', shortCode: record.short_code }
    }

    // Increment clicks asynchronously
    await urlRepository.incrementClicks(record.id)

    return {
      status: 'SUCCESS',
      originalUrl: record.original_url,
    }
  }

  /**
   * FUNCTION: getStats(code)
   * WHAT IT DOES: Retrieves click analytics and metadata for a shortcode.
   * WHERE IT IS CALLED FROM: controllers/url.controller.js getUrlStats().
   * WHOM IT CALLS: urlRepository.findByShortCode().
   * WHERE THAT CALL IS GOING: Returns link metrics record.
   */
  async getStats(code) {
    const record = await urlRepository.findByShortCode(code)
    if (!record) {
      const err = new Error('Short URL not found')
      err.statusCode = 404
      throw err
    }

    return {
      shortCode: record.short_code,
      originalUrl: record.original_url,
      clicks: record.clicks,
      expires_at: record.expires_at,
      created_at: record.created_at,
    }
  }

  /**
   * FUNCTION: removeUrl(target)
   * WHAT IT DOES: Deletes a link matching original URL or shortcode.
   * WHERE IT IS CALLED FROM: controllers/url.controller.js deleteUrl().
   * WHOM IT CALLS: urlRepository.deleteByTarget().
   * WHERE THAT CALL IS GOING: Deletes record from PostgreSQL.
   */
  async removeUrl(target) {
    if (!target) {
      const err = new Error('Provide either url or shortCode to delete')
      err.statusCode = 400
      throw err
    }

    const deleted = await urlRepository.deleteByTarget(target.trim())
    if (!deleted) {
      const err = new Error('No such URL found')
      err.statusCode = 404
      throw err
    }

    return true
  }
}

module.exports = new UrlService()
