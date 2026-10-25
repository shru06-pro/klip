/**
 * ==============================================================================
 * FILE: frontend/src/hooks/useLinks.js
 * WHAT IT DOES: Enterprise custom hook managing links domain state:
 *               1. Loads initial links from persistent browser storage.
 *               2. Automatically syncs click metrics against PostgreSQL on mount.
 *               3. Adds newly shortened links to state and persistent storage.
 *               4. Issues DELETE requests to backend API and updates state.
 * WHERE IT IS CALLED FROM: components/layout/Main.jsx.
 * WHOM IT CALLS: storageService, apiService, useState, useEffect.
 * ==============================================================================
 */

import { useState, useEffect } from 'react'
import storageService from '../services/storage.service'
import apiService from '../services/api.service'
import { API_URL } from '../config/api.config'

export function useLinks() {
  const [links, setLinks] = useState(() => storageService.getLinks())
  const [activeItem, setActiveItem] = useState(() => {
    const stored = storageService.getLinks()
    return stored.length > 0 ? stored[0] : null
  })

  // Synchronize state with persistent storage on updates
  useEffect(() => {
    storageService.saveLinks(links)
  }, [links])

  // Synchronize live click counts with database on mount
  useEffect(() => {
    if (!API_URL || links.length === 0) return

    async function syncClicks() {
      try {
        const updated = await Promise.all(
          links.map(async (item) => {
            const code = item.shortCode || item.shortUrl?.split('/').pop()
            if (!code) return item
            try {
              const data = await apiService.fetchUrlStats(code)
              return {
                ...item,
                clicks: data.clicks !== undefined ? data.clicks : item.clicks,
                expires_at: data.expires_at !== undefined ? data.expires_at : item.expires_at,
              }
            } catch {
              return item
            }
          })
        )
        setLinks(updated)
        if (activeItem) {
          const matching = updated.find((u) => u.shortUrl === activeItem.shortUrl)
          if (matching) setActiveItem(matching)
        }
      } catch (err) {
        console.error('[useLinks] Error synchronizing click metrics:', err)
      }
    }

    syncClicks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addLink = (newItem) => {
    setActiveItem(newItem)
    setLinks((prev) => {
      const filtered = prev.filter((l) => l.url !== newItem.url && l.shortUrl !== newItem.shortUrl)
      return [newItem, ...filtered]
    })
  }

  const deleteLink = async (url, shortCode) => {
    try {
      if (API_URL) {
        await apiService.deleteUrl({ url, shortCode })
      }
    } catch (err) {
      console.error('[useLinks] Error deleting link from backend:', err)
    }

    setLinks((prev) => {
      const updated = prev.filter((l) => l.url !== url && l.shortCode !== shortCode)
      if (activeItem?.url === url || activeItem?.shortCode === shortCode) {
        setActiveItem(updated.length > 0 ? updated[0] : null)
      }
      return updated
    })
  }

  const clearAllLinks = () => {
    storageService.clearLinks()
    setLinks([])
    setActiveItem(null)
  }

  return {
    links,
    activeItem,
    setActiveItem,
    addLink,
    deleteLink,
    clearAllLinks,
  }
}
