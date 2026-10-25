/**
 * ==============================================================================
 * FILE: frontend/src/components/ActiveResultCard.jsx
 * WHAT IT DOES: Renders the active link result card for the most recently created or selected short link:
 *               1. Displays the generated short URL with a 1-click clipboard copy button.
 *               2. Generates dynamic, high-resolution QR codes in both PNG (raster) and
 *                  SVG (vector) formats using the `qrcode` library.
 *               3. Calculates remaining expiration time countdown (e.g., "29d 23h left").
 *               4. Provides direct download actions for vector SVG and 4K PNG QR codes.
 *               5. Displays live click count and SSL protection status.
 * WHERE IT IS CALLED FROM: Rendered inside `<Main />` (frontend/src/components/Main.jsx)
 *                          whenever `activeItem` is non-null.
 * WHOM IT CALLS: QRCode.toDataURL(), QRCode.toString(), navigator.clipboard.writeText(),
 *                URL.createObjectURL(), downloadPng(), downloadSvg().
 * WHERE THAT CALL IS GOING: Injects QR images into DOM and triggers file downloads in browser.
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react'
import QRCode from 'qrcode'

/**
 * COMPONENT: ActiveResultCard({ item })
 * WHAT IT DOES: Renders the primary result card with real-time QR generation and copy actions.
 * WHERE IT IS CALLED FROM: Rendered in frontend/src/components/Main.jsx.
 * WHOM IT CALLS: handleCopy, downloadSvg, downloadPng, getTimeLeft, QRCode utilities.
 * WHERE THAT CALL IS GOING: Renders active link details and QR card into the DOM.
 */
export default function ActiveResultCard({ item }) {
  const [copied, setCopied] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [qrSvgString, setQrSvgString] = useState('')

  /**
   * SECTION: QR Code Generation Effect
   * WHAT IT DOES: Generates two representations of the QR code whenever `item.shortUrl` changes:
   *               1. PNG Data URL (480px width) for real-time display and 4K raster download.
   *               2. SVG XML vector string for scalable vector graphic export.
   * WHERE IT IS CALLED FROM: Triggered automatically when `item.shortUrl` updates.
   * WHOM IT CALLS: QRCode.toDataURL(), QRCode.toString(), setQrDataUrl(), setQrSvgString().
   * WHERE THAT CALL IS GOING: Asynchronously generates image strings in memory.
   */
  useEffect(() => {
    if (!item?.shortUrl) return

    // FUNCTION CALL: QRCode.toDataURL()
    // - WHAT IT DOES: Renders a QR code matrix into a base64 PNG data URL.
    // - WHERE THAT CALL IS GOING: Populates `qrDataUrl` state for `<img>` preview and download.
    QRCode.toDataURL(item.shortUrl, {
      width: 480,
      margin: 1.5,
      color: {
        dark: '#27272A',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR PNG generation error:', err))

    // FUNCTION CALL: QRCode.toString()
    // - WHAT IT DOES: Renders a QR code matrix into an SVG vector XML markup string.
    // - WHERE THAT CALL IS GOING: Populates `qrSvgString` state for vector SVG file download.
    QRCode.toString(item.shortUrl, {
      type: 'svg',
      margin: 1.5,
      color: {
        dark: '#27272A',
        light: '#FFFFFF',
      },
    })
      .then((svg) => setQrSvgString(svg))
      .catch((err) => console.error('QR SVG generation error:', err))
  }, [item?.shortUrl])

  if (!item) return null

  /**
   * FUNCTION: handleCopy()
   * WHAT IT DOES: Copies the shortened URL to the system clipboard and displays a
   *               temporary "Copied!" green badge confirmation for 2.4 seconds.
   * WHERE IT IS CALLED FROM: Click event on `<button id="copyResultBtn">`.
   * WHOM IT CALLS: navigator.clipboard.writeText(), setCopied().
   * WHERE THAT CALL IS GOING: Writes string to user operating system clipboard.
   */
  const handleCopy = () => {
    navigator.clipboard.writeText(item.shortUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2400)
    })
  }

  /**
   * FUNCTION: downloadSvg()
   * WHAT IT DOES: Packages the generated SVG vector string into an image/svg+xml Blob,
   *               constructs a transient object URL, and triggers an automatic browser file download.
   * WHERE IT IS CALLED FROM: Click event on "SVG Vector" button.
   * WHOM IT CALLS: Blob(), URL.createObjectURL(), document.createElement('a'), URL.revokeObjectURL().
   * WHERE THAT CALL IS GOING: Prompts browser file system download dialog.
   */
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

  /**
   * FUNCTION: downloadPng()
   * WHAT IT DOES: Triggers a high-resolution 4K PNG file download using the generated `qrDataUrl`.
   * WHERE IT IS CALLED FROM: Click event on "PNG 4K" button.
   * WHOM IT CALLS: document.createElement('a'), a.click().
   * WHERE THAT CALL IS GOING: Prompts browser file system download dialog for PNG image.
   */
  const downloadPng = () => {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `klip-qr-${item.shortUrl.split('/').pop() || 'code'}.png`
    a.click()
  }

  /**
   * FUNCTION: getTimeLeft(expiresAt)
   * WHAT IT DOES: Calculates the remaining days and hours until the link expires.
   * WHERE IT IS CALLED FROM: Component render body.
   * WHOM IT CALLS: Date arithmetic.
   * WHERE THAT CALL IS GOING: In-memory string return (e.g., '29d 23h left' or 'Expired').
   */
  const getTimeLeft = (expiresAt) => {
    if (!expiresAt) return null
    const diff = new Date(expiresAt) - new Date()
    if (diff <= 0) return 'Expired'
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    return `${days}d ${hours}h left`
  }

  const timeLeft = getTimeLeft(item.expires_at)
  const isHttps = item.shortUrl.startsWith('https://')
  const displayUrl = item.shortUrl.replace(/^https?:\/\//, '')

  return (
    <section className="max-w-3xl mx-auto px-4 mt-6 sm:mt-8 mb-12 sm:mb-16" id="resultCard">
      <div className="rounded-2xl sm:rounded-3xl bg-white border border-border shadow-[0_12px_36px_-10px_rgba(39,39,42,0.08)] p-4 sm:p-6 md:p-7 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 sm:gap-6 transition-transform">
        {/* Left Side: Result Details */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-accent-tint text-accent text-[11px] sm:text-xs font-mono font-medium tracking-wide">
              ACTIVE KLIP
            </span>
            <span className="text-[11px] sm:text-xs text-muted font-mono">
              {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Created just now'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="font-mono text-[11px] uppercase tracking-wider text-muted">
              Shortened URL
            </div>

            {/* Dedicated Link Pill Box: clean responsive flow */}
            <div className="bg-canvas/70 border border-border/80 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors focus-within:border-accent/40">
              <a
                id="activeShortLink"
                href={item.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-serif text-xl sm:text-2xl md:text-3xl text-ink font-normal hover:text-accent transition-colors tracking-tight break-all select-all leading-snug"
              >
                {displayUrl}
              </a>

              <button
                id="copyResultBtn"
                type="button"
                onClick={handleCopy}
                className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-xl text-xs font-mono font-medium transition-all active:scale-95 shadow-xs border cursor-pointer shrink-0 w-full sm:w-auto ${
                  copied
                    ? 'bg-success text-white border-success shadow-success/20'
                    : 'bg-ink text-white hover:bg-[#3F3F46] border-ink'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {copied ? 'check' : 'content_copy'}
                </span>
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            <p className="text-xs text-muted font-sans break-all sm:truncate max-w-md pt-1">
              Original: <span className="text-ink font-normal">{item.url}</span>
            </p>
          </div>

          {/* Micro Badges */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <div className="bg-canvas px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-mono text-muted border border-border/80 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-accent">mouse</span>
              <span>{item.clicks || 0} clicks</span>
            </div>

            <div className="bg-canvas px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-mono text-muted border border-border/80 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-muted">timer</span>
              <span>{timeLeft ? timeLeft : 'Permanent link'}</span>
            </div>

            {/* Show SSL Protected ONLY when BASE_URL is https */}
            {isHttps && (
              <div className="bg-canvas px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-mono text-muted border border-border/80 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-success">verified</span>
                <span>SSL Protected</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Generated Aesthetic QR Code Card */}
        <div className="bg-canvas rounded-2xl p-4 border border-border flex flex-col items-center gap-3 shrink-0 shadow-xs w-full md:w-auto">
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 bg-white rounded-xl p-2.5 border border-border flex items-center justify-center shadow-inner overflow-hidden">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code"
                className="w-full h-full object-contain rounded-md"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted font-mono text-xs">
                Generating QR...
              </div>
            )}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-accent/90 border-2 border-white shadow-xs"></div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full">
            <button
              onClick={downloadSvg}
              className="flex-1 py-1.5 px-3 rounded-full bg-white hover:bg-accent-tint text-ink hover:text-accent font-mono text-[11px] border border-border transition-colors text-center cursor-pointer shadow-xs active:scale-95"
              type="button"
              title="Download vector SVG QR code"
            >
              SVG Vector
            </button>
            <button
              onClick={downloadPng}
              className="flex-1 py-1.5 px-3 rounded-full bg-white hover:bg-accent-tint text-ink hover:text-accent font-mono text-[11px] border border-border transition-colors text-center cursor-pointer shadow-xs active:scale-95"
              type="button"
              title="Download high-resolution PNG QR code"
            >
              PNG 4K
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
