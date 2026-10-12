import React, { useState, useEffect } from 'react'
import QRCode from 'qrcode'

export default function QrModal({ item, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [qrSvgString, setQrSvgString] = useState('')

  useEffect(() => {
    if (!item?.shortUrl) return

    QRCode.toDataURL(item.shortUrl, {
      width: 480,
      margin: 2,
      color: {
        dark: '#27272A',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error:', err))

    QRCode.toString(item.shortUrl, {
      type: 'svg',
      margin: 2,
      color: {
        dark: '#27272A',
        light: '#FFFFFF',
      },
    })
      .then((svg) => setQrSvgString(svg))
      .catch((err) => console.error('QR SVG error:', err))
  }, [item?.shortUrl])

  if (!item) return null

  const downloadSvg = () => {
    if (!qrSvgString) return
    const blob = new Blob([qrSvgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `klip-qr-${item.shortUrl.split('/').pop() || 'code'}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPng = () => {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `klip-qr-${item.shortUrl.split('/').pop() || 'code'}.png`
    a.click()
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
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-canvas hover:bg-border text-muted hover:text-ink flex items-center justify-center transition-colors cursor-pointer"
          title="Close modal"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

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
