import React, { useState, useEffect } from 'react'
import Hero from './Hero'
import Shortener from './Shortener'
import ActiveResultCard from './ActiveResultCard'
import BentoFeatures from './BentoFeatures'
import UrlList from './UrlList'
import QrModal from './QrModal'
import Footer from './Footer'
import { API_URL } from '../config'

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

export default function Main() {
  const [links, setLinks] = useState(getLocalStorage)
  const [activeItem, setActiveItem] = useState(() => {
    const stored = getLocalStorage()
    return stored.length > 0 ? stored[0] : null
  })
  const [qrModalItem, setQrModalItem] = useState(null)

  useEffect(() => {
    localStorage.setItem('links', JSON.stringify(links))
  }, [links])

  // Refresh clicks from the database for links in the ledger
  useEffect(() => {
    if (!API_URL || links.length === 0) return

    async function syncClicks() {
      try {
        const updated = await Promise.all(
          links.map(async (item) => {
            const code = item.shortCode || item.shortUrl?.split('/').pop()
            if (!code) return item
            try {
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

    syncClicks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Runs once on mount to synchronize click counts with PostgreSQL

  const addLink = (newItem) => {
    setActiveItem(newItem)
    const filtered = links.filter((l) => l.url !== newItem.url && l.shortUrl !== newItem.shortUrl)
    setLinks([newItem, ...filtered])
  }

  const deleteLink = async (url, shortCode) => {
    try {
      if (API_URL) {
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

  const hideLinks = () => {
    setLinks([])
    setActiveItem(null)
  }

  return (
    <main className="relative w-full overflow-hidden bg-canvas min-h-screen">
      {/* Ambient Lavender Glow Blobs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[720px] h-[440px] bg-accent-soft/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-96 left-1/4 w-80 h-80 bg-accent-tint/60 rounded-full blur-2xl pointer-events-none -z-10"></div>

      {/* 1. HERO SECTION */}
      <Hero />

      {/* 2. THE SHORTEN FORM (MAIN CTA) */}
      <Shortener onUrlCreated={addLink} />

      {/* 3. ACTIVE / GENERATED RESULT CARD WITH REAL QR CODE */}
      {activeItem && <ActiveResultCard item={activeItem} />}

      {/* 4. EDITORIAL BENTO / FEATURES SUITE */}
      <BentoFeatures />

      {/* 5. RECENT KLIPS ARCHIVE TABLE / LEDGER */}
      <UrlList
        urlList={links}
        onDelete={(url, shortCode) => deleteLink(url, shortCode)}
        onSelectQr={(item) => setQrModalItem(item)}
        onClearAll={hideLinks}
      />

      {/* QR Code Modal for viewing & downloading any link's QR */}
      {qrModalItem && (
        <QrModal item={qrModalItem} onClose={() => setQrModalItem(null)} />
      )}

      {/* Minimal Muted Footer */}
      <Footer />
    </main>
  )
}
