import React, { useState, useEffect } from 'react'
import Hero from './Hero'
import Shortener from './Shortener'
import ActiveResultCard from './ActiveResultCard'
import BentoFeatures from './BentoFeatures'
import UrlList from './UrlList'
import QrModal from './QrModal'
import Footer from './Footer'

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000'

const getLocalStorage = () => {
  try {
    const raw = localStorage.getItem('links')
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return parsed.map((item) => {
      const shortUrl = item.shortUrl
        ? item.shortUrl.replace('http://localhost:5000', window.location.origin)
        : item.shortUrl
      return { ...item, shortUrl }
    })
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

  const addLink = (newItem) => {
    setActiveItem(newItem)
    // Filter out duplicates if present, then prepend
    const filtered = links.filter((l) => l.url !== newItem.url)
    setLinks([newItem, ...filtered])
  }

  const deleteLink = async (url) => {
    try {
      await fetch(`${apiUrl}/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
    } catch (err) {
      console.error('Error deleting from server:', err)
    }

    const updated = links.filter((l) => l.url !== url)
    setLinks(updated)
    if (activeItem?.url === url) {
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

      {/* 3. ACTIVE / GENERATED RESULT CARD WITH QR CODE */}
      {activeItem && <ActiveResultCard item={activeItem} />}

      {/* 4. EDITORIAL BENTO / FEATURES SUITE */}
      <BentoFeatures />

      {/* 5. RECENT KLIPS ARCHIVE TABLE / LEDGER */}
      <UrlList
        urlList={links}
        onDelete={deleteLink}
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
