/**
 * ==============================================================================
 * FILE: frontend/src/services/api.service.js
 * WHAT IT DOES: Enterprise HTTP API Service abstraction for frontend network calls.
 *               Encapsulates fetch calls, request headers, error parsing, and JSON decoding.
 * WHERE IT IS CALLED FROM: components/features/shortener/Shortener.jsx, hooks/useLinks.js.
 * WHOM IT CALLS: window.fetch(), API_ENDPOINTS.
 * WHERE THAT CALL IS GOING: Dispatches HTTP requests to backend REST API.
 * ==============================================================================
 */

import { API_ENDPOINTS } from '../config/api.config'

class ApiService {
  /**
   * POST /api/shorten
   * Creates or resolves a short URL.
   */
  async shortenUrl({ url, slug, autoExpire }) {
    const response = await fetch(API_ENDPOINTS.SHORTEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url.trim(),
        slug: slug ? slug.trim() : undefined,
        autoExpire,
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Error creating short link')
    }

    return data
  }

  /**
   * GET /api/urls/:code
   * Retrieves click metrics and details for a shortcode.
   */
  async fetchUrlStats(code) {
    const response = await fetch(`${API_ENDPOINTS.URLS}/${code}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch stats for code ${code}`)
    }
    return response.json()
  }

  /**
   * DELETE /api/urls
   * Deletes a short link from the database.
   */
  async deleteUrl({ url, shortCode }) {
    const response = await fetch(API_ENDPOINTS.URLS, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, shortCode }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Error deleting short link')
    }

    return data
  }
}

const apiService = new ApiService()
export default apiService
