import React, { useState, useEffect } from 'react'
import QRCode from 'qrcode'

export default function ActiveResultCard({ item }) {
  const [copied, setCopied] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [qrSvgString, setQrSvgString] = useState('')

  useEffect(() => {
    if (!item?.shortUrl) return

    // Generate high-resolution PNG Data URL
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

    // Generate SVG string for vector download
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

  const handleCopy = () => {
    navigator.clipboard.writeText(item.shortUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2400)
    })
  }

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

  // Calculate honest remaining expiration time
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

          {/* Honest Micro Badges */}
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
