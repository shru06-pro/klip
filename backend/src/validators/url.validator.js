/**
 * ==============================================================================
 * FILE: backend/src/validators/url.validator.js
 * WHAT IT DOES: Encapsulates validation logic for target URLs and custom short slugs:
 *               1. URL syntax, protocol compliance, length checks, and loop prevention.
 *               2. Custom slug character whitelist, boundary checks, and reserved keyword filtering.
 * WHERE IT IS CALLED FROM: services/url.service.js.
 * WHOM IT CALLS: new URL(), RegExp.test(), RESERVED_WORDS.has().
 * WHERE THAT CALL IS GOING: In-memory validation results returned to service layer.
 * ==============================================================================
 */

const { RESERVED_WORDS, URL_CONSTRAINTS } = require('../config/constants')

/**
 * FUNCTION: validateUrl(value, baseUrl)
 * WHAT IT DOES: Validates that the input string is a valid non-empty HTTP/HTTPS URL
 *               not exceeding maximum length and not pointing back to the shortener.
 * WHERE IT IS CALLED FROM: services/url.service.js createShortUrl().
 * WHOM IT CALLS: URL constructor.
 * WHERE THAT CALL IS GOING: Returns { valid: boolean, error?: string }.
 */
function validateUrl(value, baseUrl) {
  if (!value || typeof value !== 'string') {
    return { valid: false, error: 'URL must be a non-empty string' }
  }

  const trimmed = value.trim()
  if (trimmed.length > URL_CONSTRAINTS.MAX_LENGTH) {
    return { valid: false, error: `URL exceeds maximum length of ${URL_CONSTRAINTS.MAX_LENGTH} characters` }
  }

  let parsed
  try {
    parsed = new URL(trimmed)
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only http and https protocols are supported' }
  }

  try {
    if (baseUrl) {
      const baseHost = new URL(baseUrl).host
      if (parsed.host.toLowerCase() === baseHost.toLowerCase()) {
        return { valid: false, error: 'Cannot shorten links pointing to this shortener domain' }
      }
    }
  } catch {
    // Ignore host parsing failure if baseUrl is unparseable
  }

  return { valid: true, url: trimmed }
}

/**
 * FUNCTION: validateSlug(slug)
 * WHAT IT DOES: Validates user-provided custom slugs for length, character whitelist,
 *               and non-collision with system reserved words.
 * WHERE IT IS CALLED FROM: services/url.service.js createShortUrl().
 * WHOM IT CALLS: RegExp.test(), RESERVED_WORDS.has().
 * WHERE THAT CALL IS GOING: Returns { valid: boolean, slug?: string, error?: string }.
 */
function validateSlug(slug) {
  if (!slug || typeof slug !== 'string') {
    return { valid: false, error: 'Custom slug must be a string' }
  }

  const trimmed = slug.trim()
  if (trimmed.length < URL_CONSTRAINTS.MIN_SLUG_LENGTH || trimmed.length > URL_CONSTRAINTS.MAX_SLUG_LENGTH) {
    return {
      valid: false,
      error: `Custom slug must be between ${URL_CONSTRAINTS.MIN_SLUG_LENGTH} and ${URL_CONSTRAINTS.MAX_SLUG_LENGTH} characters`,
    }
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { valid: false, error: 'Custom slug may only contain letters, numbers, hyphens, and underscores' }
  }

  if (RESERVED_WORDS.has(trimmed.toLowerCase())) {
    return { valid: false, error: `The slug '${trimmed}' is a reserved system keyword` }
  }

  return { valid: true, slug: trimmed }
}

module.exports = {
  validateUrl,
  validateSlug,
}
