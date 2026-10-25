/**
 * ==============================================================================
 * FILE: frontend/src/components/Main.jsx
 * WHAT IT DOES: Central state manager and presentation coordinator for the application.
 *               1. Loads and persists link history in localStorage.
 *               2. Synchronizes real-time click counts and expiration dates with the
 *                  PostgreSQL backend on mount via GET /api/urls/:code.
 *               3. Coordinates workflow between Shortener, ActiveResultCard, UrlList,
 *                  BentoFeatures, QrModal, and Footer components.
 *               4. Issues DELETE requests to the backend when links are removed.
 * WHERE IT IS CALLED FROM: Rendered inside `<App />` (frontend/src/App.js).
 * WHOM IT CALLS: Hero, Shortener, ActiveResultCard, BentoFeatures, UrlList, QrModal, Footer,
 *                fetch(`${API_URL}/api/urls/...`), localStorage.
 * WHERE THAT CALL IS GOING: Coordinates client component lifecycle and communicates with backend API.
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react'
import Hero from './Hero'
import Shortener from './Shortener'
import ActiveResultCard from './ActiveResultCard'
import BentoFeatures from './BentoFeatures'
import UrlList from './UrlList'
import QrModal from './QrModal'
import Footer from './Footer'
import { API_URL } from '../config'

/**
 * FUNCTION: getLocalStorage()
 * WHAT IT DOES: Safely parses and retrieves the saved links array from browser localStorage.
 *               Provides fallback to an empty array in case of corruption or SSR.
 * WHERE IT IS CALLED FROM: Initial state initializer in Main().
 * WHOM IT CALLS: localStorage.getItem('links'), JSON.parse().
 * WHERE THAT CALL IS GOING: In-memory array return of previously saved link objects.
 */
const getLocalStorage = () => {
  try {
    const raw = localStorage.getItem('links')
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * COMPONENT: Main()
 * WHAT IT DOES: Core container orchestrating link creation, active preview, metrics sync, and modal displays.
 * WHERE IT IS CALLED FROM: Rendered in frontend/src/App.js.
 * WHOM IT CALLS: useState, useEffect, fetch(), localStorage.setItem(), child components.
 * WHERE THAT CALL IS GOING: DOM tree rendering and backend synchronization.
 */
export default function Main() {
  const [links, setLinks] = useState(getLocalStorage)
  const [activeItem, setActiveItem] = useState(() => {
    const stored = getLocalStorage()
    return stored.length > 0 ? stored[0] : null
  })
  const [qrModalItem, setQrModalItem] = useState(null)

  /**
   * SECTION: LocalStorage Persistence Effect
   * WHAT IT DOES: Serializes the `links` state array to localStorage whenever it changes.
   * WHERE IT IS CALLED FROM: Automatically executed when `links` dependency updates.
   * WHOM IT CALLS: localStorage.setItem('links', JSON.stringify(links)).
   * WHERE THAT CALL IS GOING: Browser persistent storage.
   */
  useEffect(() => {
    localStorage.setItem('links', JSON.stringify(links))
  }, [links])

  /**
   * SECTION: Database Click Metrics Sync Hook
   * WHAT IT DOES: Asynchronously iterates over all saved links on mount, querying the
   *               backend GET /api/urls/:code to synchronize click counts and expiration
   *               status against the authoritative PostgreSQL database.
   * WHERE IT IS CALLED FROM: Runs once on component mount.
   * WHOM IT CALLS: fetch(`${API_URL}/api/urls/${code}`), setLinks(), setActiveItem().
   * WHERE THAT CALL IS GOING: HTTP GET requests to backend router (backend/routes/index.js).
   */
  useEffect(() => {
    if (!API_URL || links.length === 0) return

    async function syncClicks() {
      try {
        const updated = await Promise.all(
          links.map(async (item) => {
            const code = item.shortCode || item.shortUrl?.split('/').pop()
            if (!code) return item
            try {
              // FUNCTION CALL: fetch(`${API_URL}/api/urls/${code}`)
              // - WHAT IT DOES: Retrieves click analytics for a specific shortcode.
              // - WHERE THAT CALL IS GOING: Backend GET /api/urls/:code.
              const res = await fetch(`${API_URL}/api/urls/${code}`)
              if (res.ok) {
                const data = await res.json()
                return {
                  ...item,
                  clicks: data.clicks !== undefined ? data.clicks : item.clicks,
                  expires_at: data.expires_at !== undefined ? data.expires_at : item.expires_at,
                }
              }
            } catch {
              // Ignore single fetch errors
            }
            return item
          })
        )
        setLinks(updated)
        if (activeItem) {
          const matching = updated.find((u) => u.shortUrl === activeItem.shortUrl)
          if (matching) setActiveItem(matching)
        }
      } catch {
        // Ignore general sync errors
      }
    }

    // FUNCTION CALL: syncClicks()
    // Initiates parallel synchronization of click metrics.
    syncClicks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * FUNCTION: addLink(newItem)
   * WHAT IT DOES: Adds a newly generated short link to the top of the history list,
   *               deduplicates existing entries, and designates it as activeItem.
   * WHERE IT IS CALLED FROM: Passed as `onUrlCreated` callback to <Shortener />.
   * WHOM IT CALLS: setActiveItem(newItem), setLinks([newItem, ...filtered]).
   * WHERE THAT CALL IS GOING: Updates React component state, triggering re-render and localStorage save.
   */
  const addLink = (newItem) => {
    setActiveItem(newItem)
    const filtered = links.filter((l) => l.url !== newItem.url && l.shortUrl !== newItem.shortUrl)
    setLinks([newItem, ...filtered])
  }

  /**
   * FUNCTION: deleteLink(url, shortCode)
   * WHAT IT DOES: Issues an asynchronous HTTP DELETE request to the backend to remove
   *               the link record from PostgreSQL, then filters it out of local state.
   * WHERE IT IS CALLED FROM: Passed as `onDelete` callback to <UrlList />.
   * WHOM IT CALLS: fetch(`${API_URL}/api/urls`, { method: 'DELETE' }), setLinks(), setActiveItem().
   * WHERE THAT CALL IS GOING: Backend DELETE /api/urls endpoint and local React state.
   */
  const deleteLink = async (url, shortCode) => {
    try {
      if (API_URL) {
        // FUNCTION CALL: fetch()
        // - WHAT IT DOES: Sends DELETE payload with URL or shortCode.
        // - WHERE THAT CALL IS GOING: Backend DELETE /api/urls.
        await fetch(`${API_URL}/api/urls`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, shortCode }),
        })
      }
    } catch (err) {
      console.error('Error deleting from server:', err)
    }

    const updated = links.filter((l) => l.url !== url && l.shortCode !== shortCode)
    setLinks(updated)
    if (activeItem?.url === url || activeItem?.shortCode === shortCode) {
      setActiveItem(updated.length > 0 ? updated[0] : null)
    }
  }

  /**
   * FUNCTION: hideLinks()
   * WHAT IT DOES: Clears all link entries from local state and resets active link preview.
   * WHERE IT IS CALLED FROM: Passed as `onClearAll` callback to <UrlList />.
   * WHOM IT CALLS: setLinks([]), setActiveItem(null).
   * WHERE THAT CALL IS GOING: Resets component state and empties localStorage.
   */
  const hideLinks = () => {
    setLinks([])
    setActiveItem(null)
  }

  return (
    <main className="relative w-full overflow-hidden bg-canvas min-h-screen">
      {/* Ambient Lavender Glow Background */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[720px] h-[440px] bg-accent-soft/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-96 left-1/4 w-80 h-80 bg-accent-tint/60 rounded-full blur-2xl pointer-events-none -z-10"></div>

      {/* SECTION 1: HERO */}
      <Hero />

      {/* SECTION 2: URL SHORTENER FORM (onUrlCreated calls addLink) */}
      <Shortener onUrlCreated={addLink} />

      {/* SECTION 3: ACTIVE LINK RESULT CARD WITH REAL-TIME QR */}
      {activeItem && <ActiveResultCard item={activeItem} />}

      {/* SECTION 4: ENGINE SUITE FEATURES GRID */}
      <BentoFeatures />

      {/* SECTION 5: RECENT LINKS LEDGER */}
      <UrlList
        urlList={links}
        onDelete={(url, shortCode) => deleteLink(url, shortCode)}
        onSelectQr={(item) => setQrModalItem(item)}
        onClearAll={hideLinks}
      />

      {/* POPUP MODAL: High-Resolution QR Inspector */}
      {qrModalItem && (
        <QrModal item={qrModalItem} onClose={() => setQrModalItem(null)} />
      )}

      {/* FOOTER */}
      <Footer />
    </main>
  )
}
