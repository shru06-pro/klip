const { nanoid } = require('nanoid')
const { getDB } = require('../db')

const RESERVED_WORDS = new Set([
  'api',
  'health',
  'admin',
  'dashboard',
  'login',
  'register',
  'favicon.ico',
  'robots.txt',
  'static',
  'test',
])

function validateUrl(value, baseUrl) {
  if (!value || typeof value !== 'string') {
    return { valid: false, error: 'URL must be a non-empty string' }
  }

  if (value.length > 2048) {
    return { valid: false, error: 'URL exceeds maximum length of 2048 characters' }
  }

  let parsed
  try {
    parsed = new URL(value)
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only http and https protocols are supported' }
  }

  try {
    const baseHost = new URL(baseUrl).host
    if (parsed.host.toLowerCase() === baseHost.toLowerCase()) {
      return { valid: false, error: 'Cannot shorten links pointing to this shortener domain' }
    }
  } catch {
    // If baseUrl cannot be parsed, ignore host comparison
  }

  return { valid: true }
}

function validateSlug(slug) {
  if (!slug || typeof slug !== 'string') {
    return { valid: false, error: 'Custom slug must be a string' }
  }

  const trimmed = slug.trim()
  if (trimmed.length < 3 || trimmed.length > 50) {
    return { valid: false, error: 'Custom slug must be between 3 and 50 characters' }
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { valid: false, error: 'Custom slug may only contain letters, numbers, hyphens, and underscores' }
  }

  if (RESERVED_WORDS.has(trimmed.toLowerCase())) {
    return { valid: false, error: `The slug '${trimmed}' is a reserved system keyword` }
  }

  return { valid: true, slug: trimmed }
}

async function createShortUrl(req, res) {
  const { url, slug, autoExpire } = req.body
  const baseUrl = process.env.BASE_URL
  const db = getDB()

  // 1. URL Validation
  const urlCheck = validateUrl(url, baseUrl)
  if (!urlCheck.valid) {
    return res.status(400).json({ message: urlCheck.error })
  }

  try {
    let shortCode

    if (slug && slug.trim()) {
      // 2. Custom Slug Validation
      const slugCheck = validateSlug(slug)
      if (!slugCheck.valid) {
        return res.status(400).json({ message: slugCheck.error })
      }
      shortCode = slugCheck.slug

      // Check if custom slug already exists
      const existing = await db.query('SELECT id FROM urls WHERE short_code = $1', [shortCode])
      if (existing.rows.length > 0) {
        return res.status(409).json({ message: `Custom slug '${shortCode}' is already in use` })
      }
    } else {
      // 3. Deduplication for automatic slugs if identical URL already exists and is not expired
      const existingUrl = await db.query(
        'SELECT * FROM urls WHERE original_url = $1 AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY id DESC LIMIT 1',
        [url.trim()]
      )
      if (existingUrl.rows.length > 0) {
        const row = existingUrl.rows[0]
        const shortUrl = `${baseUrl}/${row.short_code}`
        return res.status(200).json({
          shortUrl,
          shortCode: row.short_code,
          clicks: row.clicks,
          expires_at: row.expires_at,
          created_at: row.created_at,
        })
      }

      // Generate unique random 6-character code
      while (true) {
        const candidate = nanoid(6)
        if (RESERVED_WORDS.has(candidate.toLowerCase())) continue
        const check = await db.query('SELECT id FROM urls WHERE short_code = $1', [candidate])
        if (check.rows.length === 0) {
          shortCode = candidate
          break
        }
      }
    }

    // 4. Expiration handling (Auto-30d support)
    let expiresAt = null
    if (autoExpire === true || autoExpire === 'true' || autoExpire === 30) {
      expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }

    // 5. Insert into PostgreSQL database
    const insertRes = await db.query(
      `INSERT INTO urls (short_code, original_url, clicks, expires_at, created_at)
       VALUES ($1, $2, 0, $3, NOW())
       RETURNING short_code, original_url, clicks, expires_at, created_at`,
      [shortCode, url.trim(), expiresAt]
    )

    const row = insertRes.rows[0]
    const shortUrl = `${baseUrl}/${row.short_code}`

    return res.status(201).json({
      shortUrl,
      shortCode: row.short_code,
      clicks: row.clicks,
      expires_at: row.expires_at,
      created_at: row.created_at,
    })
  } catch (err) {
    console.error('Error in createShortUrl:', err)
    return res.status(500).json({ message: 'Internal server error while shortening URL' })
  }
}

async function redirectToOriginalUrl(req, res) {
  const code = req.params.code || req.params.shortUrlId
  if (!code) {
    return res.status(404).send(getNotFoundHtml())
  }

  if (RESERVED_WORDS.has(code.toLowerCase())) {
    return res.status(404).send(getNotFoundHtml())
  }

  const db = getDB()
  try {
    const result = await db.query('SELECT * FROM urls WHERE short_code = $1', [code])
    if (result.rows.length === 0) {
      return res.status(404).send(getNotFoundHtml())
    }

    const row = result.rows[0]

    // Check expiration
    if (row.expires_at && new Date() > new Date(row.expires_at)) {
      return res.status(410).send(getExpiredHtml(row.short_code))
    }

    // Increment click count asynchronously in PostgreSQL
    await db.query('UPDATE urls SET clicks = clicks + 1 WHERE id = $1', [row.id])

    // Respond with 302 redirect
    return res.redirect(302, row.original_url)
  } catch (err) {
    console.error('Error in redirectToOriginalUrl:', err)
    return res.status(500).send('Server Error')
  }
}

async function deleteUrl(req, res) {
  const { url, shortCode } = req.body
  const target = url || shortCode
  if (!target) {
    return res.status(400).json({ message: 'Provide either url or shortCode to delete' })
  }

  const db = getDB()
  try {
    const deleted = await db.query(
      'DELETE FROM urls WHERE original_url = $1 OR short_code = $1',
      [target.trim()]
    )

    if (deleted.rowCount === 0) {
      return res.status(404).json({ message: 'No such URL found' })
    }

    return res.status(200).json({ message: `URL deleted successfully` })
  } catch (err) {
    console.error('Error in deleteUrl:', err)
    return res.status(500).json({ message: 'Server error while deleting URL' })
  }
}

async function getUrlStats(req, res) {
  const code = req.params.code
  const db = getDB()
  try {
    const result = await db.query('SELECT * FROM urls WHERE short_code = $1', [code])
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Short URL not found' })
    }
    const row = result.rows[0]
    return res.status(200).json({
      shortCode: row.short_code,
      originalUrl: row.original_url,
      clicks: row.clicks,
      expires_at: row.expires_at,
      created_at: row.created_at,
    })
  } catch (err) {
    console.error('Error in getUrlStats:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

function getNotFoundHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>404 - Link Not Found | Klip.</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F8F6F2; color: #27272A; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
    .card { background: white; border: 1px solid #E7E4DE; border-radius: 24px; padding: 40px; max-width: 440px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.04); }
    h1 { font-size: 28px; margin: 0 0 12px; }
    p { color: #6B6B73; font-size: 15px; line-height: 1.5; margin: 0 0 24px; }
    a { display: inline-block; background: #27272A; color: white; text-decoration: none; padding: 10px 24px; border-radius: 9999px; font-weight: 500; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Link Not Found</h1>
    <p>The shortened link you are trying to visit does not exist or may have been removed.</p>
    <a href="/">Return to Homepage</a>
  </div>
</body>
</html>`
}

function getExpiredHtml(code) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>410 - Link Expired | Klip.</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F8F6F2; color: #27272A; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
    .card { background: white; border: 1px solid #E7E4DE; border-radius: 24px; padding: 40px; max-width: 440px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.04); }
    h1 { font-size: 28px; margin: 0 0 12px; }
    p { color: #6B6B73; font-size: 15px; line-height: 1.5; margin: 0 0 24px; }
    a { display: inline-block; background: #27272A; color: white; text-decoration: none; padding: 10px 24px; border-radius: 9999px; font-weight: 500; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Link Expired</h1>
    <p>This shortened link (${code}) has expired per its retention policy and can no longer be accessed.</p>
    <a href="/">Create New Link</a>
  </div>
</body>
</html>`
}

module.exports = {
  createShortUrl,
  redirectToOriginalUrl,
  deleteUrl,
  getUrlStats,
  RESERVED_WORDS,
}