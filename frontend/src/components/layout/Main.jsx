/**
 * ==============================================================================
 * FILE: frontend/src/components/layout/Main.jsx
 * WHAT IT DOES: Enterprise Page Layout & Feature Coordinator:
 *               1. Consumes `useLinks()` domain hook for persistence, state, and click sync.
 *               2. Coordinates interactive workflow across hero, shortener, result,
 *                  bento features, ledger list, and QR inspection modal.
 * WHERE IT IS CALLED FROM: frontend/src/App.js.
 * WHOM IT CALLS: useLinks, Hero, Shortener, ActiveResultCard, BentoFeatures, UrlList, QrModal, Footer.
 * ==============================================================================
 */

import React, { useState } from 'react'
import Hero from '../features/hero/Hero'
import Shortener from '../features/shortener/Shortener'
import ActiveResultCard from '../features/result/ActiveResultCard'
import BentoFeatures from '../features/bento/BentoFeatures'
import UrlList from '../features/ledger/UrlList'
import QrModal from '../common/QrModal'
import Footer from './Footer'
import { useLinks } from '../../hooks/useLinks'

export default function Main() {
  const { links, activeItem, addLink, deleteLink, clearAllLinks } = useLinks()
  const [qrModalItem, setQrModalItem] = useState(null)

  return (
    <main className="relative w-full overflow-hidden bg-canvas min-h-screen">
      {/* Ambient Lavender Glow Background */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[720px] h-[440px] bg-accent-soft/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-96 left-1/4 w-80 h-80 bg-accent-tint/60 rounded-full blur-2xl pointer-events-none -z-10"></div>

      {/* SECTION 1: HERO */}
      <Hero />

      {/* SECTION 2: URL SHORTENER FORM */}
      <Shortener onUrlCreated={addLink} />

      {/* SECTION 3: ACTIVE LINK RESULT CARD WITH REAL-TIME QR */}
      {activeItem && <ActiveResultCard item={activeItem} />}

      {/* SECTION 4: ENGINE SUITE FEATURES GRID */}
      <BentoFeatures />

      {/* SECTION 5: RECENT LINKS LEDGER */}
      <UrlList
        urlList={links}
        onDelete={deleteLink}
        onSelectQr={(item) => setQrModalItem(item)}
        onClearAll={clearAllLinks}
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
