/**
 * ==============================================================================
 * FILE: frontend/src/services/storage.service.js
 * WHAT IT DOES: Enterprise Storage Service isolating browser localStorage operations.
 *               Provides safe JSON parsing with fallbacks and error handling.
 * WHERE IT IS CALLED FROM: hooks/useLinks.js.
 * WHOM IT CALLS: window.localStorage.
 * WHERE THAT CALL IS GOING: Browser local storage.
 * ==============================================================================
 */

const STORAGE_KEYS = {
  LINKS: 'links',
}

class StorageService {
  /**
   * Retrieves saved links array from localStorage.
   */
  getLinks() {
    try {
      if (typeof window === 'undefined') return []
      const raw = localStorage.getItem(STORAGE_KEYS.LINKS)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  /**
   * Persists links array to localStorage.
   */
  saveLinks(links) {
    try {
      if (typeof window === 'undefined') return
      localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links))
    } catch (err) {
      console.error('[StorageService] Error saving links:', err)
    }
  }

  /**
   * Clears saved links.
   */
  clearLinks() {
    try {
      if (typeof window === 'undefined') return
      localStorage.removeItem(STORAGE_KEYS.LINKS)
    } catch (err) {
      console.error('[StorageService] Error clearing links:', err)
    }
  }
}

const storageService = new StorageService()
export default storageService
