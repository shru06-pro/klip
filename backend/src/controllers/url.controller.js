/**
 * ==============================================================================
 * FILE: backend/src/controllers/url.controller.js
 * WHAT IT DOES: Enterprise Controller layer for shortener HTTP requests.
 *               Parses HTTP request parameters/body, delegates to url.service.js,
 *               and serializes standardized HTTP responses (200, 201, 302, 400, 404, 409, 410, 500).
 * WHERE IT IS CALLED FROM: Express route handlers in routes/api/url.routes.js and routes/index.js.
 * WHOM IT CALLS: urlService methods (shortenUrl, resolveDestination, getStats, removeUrl).
 * WHERE THAT CALL IS GOING: Returns JSON payloads, HTML error documents, or 302 redirects to client.
 * ==============================================================================
 */

const urlService = require('../services/url.service')

class UrlController {
  /**
   * API HANDLER: createShortUrl(req, res, next)
   * Handles POST /api/shorten and POST /api/urls.
   */
  async createShortUrl(req, res, next) {
    try {
      const { url, slug, autoExpire } = req.body
      const result = await urlService.shortenUrl({ url, slug, autoExpire })
      const statusCode = result.isExisting ? 200 : 201
      return res.status(statusCode).json({
        shortUrl: result.shortUrl,
        shortCode: result.shortCode,
        clicks: result.clicks,
        expires_at: result.expires_at,
        created_at: result.created_at,
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * API HANDLER: redirectToOriginalUrl(req, res, next)
   * Handles GET /:code.
   */
  async redirectToOriginalUrl(req, res, next) {
    try {
      const code = req.params.code || req.params.shortUrlId
      const result = await urlService.resolveDestination(code)

      if (result.status === 'NOT_FOUND') {
        return res.status(404).send(UrlController.getNotFoundHtml())
      }

      if (result.status === 'EXPIRED') {
        return res.status(410).send(UrlController.getExpiredHtml(result.shortCode))
      }

      return res.redirect(302, result.originalUrl)
    } catch (err) {
      next(err)
    }
  }

  /**
   * API HANDLER: getUrlStats(req, res, next)
   * Handles GET /api/urls/:code.
   */
  async getUrlStats(req, res, next) {
    try {
      const code = req.params.code
      const stats = await urlService.getStats(code)
      return res.status(200).json(stats)
    } catch (err) {
      next(err)
    }
  }

  /**
   * API HANDLER: deleteUrl(req, res, next)
   * Handles DELETE /api/urls.
   */
  async deleteUrl(req, res, next) {
    try {
      const { url, shortCode } = req.body
      const target = url || shortCode
      await urlService.removeUrl(target)
      return res.status(200).json({ message: 'URL deleted successfully' })
    } catch (err) {
      next(err)
    }
  }

  static getNotFoundHtml() {
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

  static getExpiredHtml(code) {
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
}

module.exports = new UrlController()
