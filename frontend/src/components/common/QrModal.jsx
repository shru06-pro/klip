/**
 * ==============================================================================
 * FILE: frontend/src/components/common/QrModal.jsx
 * WHAT IT DOES: Reusable modal overlay displaying large QR matrix with vector/raster downloads.
 * WHERE IT IS CALLED FROM: components/layout/Main.jsx.
 * WHOM IT CALLS: qrService.
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react'
import qrService from '../../services/qr.service'

export default function QrModal({ item, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [qrSvgString, setQrSvgString] = useState('')

  useEffect(() => {
    if (!item?.shortUrl) return

    qrService.generateDataUrl(item.shortUrl)
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('[QrModal] QR generation error:', err))

    qrService.generateSvgString(item.shortUrl)
      .then((svg) => setQrSvgString(svg))
      .catch((err) => console.error('[QrModal] QR SVG generation error:', err))
  }, [item?.shortUrl])

  if (!item) return null

  const downloadSvg = () => {
    const filename = `klip-qr-${item.shortUrl.split('/').pop() || 'code'}.svg`
    qrService.downloadSvg(qrSvgString, filename)
  }

  const downloadPng = () => {
    const filename = `klip-qr-${item.shortUrl.split('/').pop() || 'code'}.png`
    qrService.downloadPng(qrDataUrl, filename)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-border shadow-[0_20px_50px_rgba(39,39,42,0.15)] flex flex-col items-center gap-4 relative animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-canvas hover:bg-border text-muted hover:text-ink flex items-center justify-center transition-colors cursor-pointer"
          title="Close modal"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <span className="font-mono text-xs uppercase tracking-wider text-muted">
            QR CODE PASSPORT
          </span>
          <h3 className="font-serif text-2xl text-ink font-normal">
            Scan to Visit
          </h3>
          <p className="font-mono text-xs text-accent truncate max-w-xs">
            {item.shortUrl}
          </p>
        </div>

        {/* QR Code Graphic Frame */}
        <div className="relative w-52 h-52 bg-white rounded-2xl p-3 border border-border shadow-inner flex items-center justify-center overflow-hidden">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain rounded-lg" />
          ) : (
            <div className="text-muted font-mono text-xs">Generating QR...</div>
          )}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center font-serif text-xs font-bold border-2 border-white shadow-xs">
              K
            </div>
          </div>
        </div>

        {/* Export Download Actions */}
        <div className="flex items-center gap-2 w-full pt-1">
          <button
            type="button"
            onClick={downloadSvg}
            className="flex-1 py-2 px-3 rounded-full bg-canvas hover:bg-accent-tint text-ink hover:text-accent font-mono text-xs border border-border transition-colors text-center cursor-pointer shadow-xs"
          >
            SVG Vector
          </button>
          <button
            type="button"
            onClick={downloadPng}
            className="flex-1 py-2 px-3 rounded-full bg-accent hover:bg-accent-soft text-white font-mono text-xs transition-colors text-center cursor-pointer shadow-xs"
          >
            PNG 4K
          </button>
        </div>
      </div>
    </div>
  )
}
