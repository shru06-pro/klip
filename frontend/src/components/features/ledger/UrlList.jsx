/**
 * ==============================================================================
 * FILE: frontend/src/components/features/ledger/UrlList.jsx
 * WHAT IT DOES: Link ledger table with filters, sparkline charts, copy actions, and delete triggers.
 * WHERE IT IS CALLED FROM: components/layout/Main.jsx.
 * WHOM IT CALLS: useClipboard.
 * ==============================================================================
 */

import React, { useState } from 'react'
import { useClipboard } from '../../../hooks/useClipboard'

export default function UrlList({ urlList = [], onDelete, onSelectQr, onClearAll }) {
  const { isCopied, copy } = useClipboard(2000)
  const [filter, setFilter] = useState('all')

  const handleCopy = (shortUrl, index) => {
    copy(shortUrl, `row-${index}`)
  }

  const filteredList = urlList.filter((item) => {
    if (filter === 'active') {
      return !item.expires_at || new Date(item.expires_at) > new Date()
    }
    if (filter === 'expiring') {
      if (!item.expires_at) return false
      const remainingDays = (new Date(item.expires_at) - new Date()) / (1000 * 60 * 60 * 24)
      return remainingDays > 0 && remainingDays <= 7
    }
    return true
  })

  return (
    <section className="max-w-5xl mx-auto px-4 mb-24" id="recent">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-3">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            {'// LINK LEDGER'}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal tracking-tight mt-1">
            Recent Active Klips
          </h2>
        </div>

        {/* Filter Pills Bar */}
        <div className="inline-flex items-center gap-1 p-1 bg-white border border-border rounded-full text-xs font-mono shadow-sm self-start sm:self-auto max-w-full overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 sm:px-3.5 py-1 rounded-full transition-colors cursor-pointer shrink-0 ${
              filter === 'all'
                ? 'bg-accent-tint text-accent font-medium'
                : 'text-muted hover:text-ink'
            }`}
            type="button"
          >
            All ({urlList.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 sm:px-3.5 py-1 rounded-full transition-colors cursor-pointer shrink-0 ${
              filter === 'active'
                ? 'bg-accent-tint text-accent font-medium'
                : 'text-muted hover:text-ink'
            }`}
            type="button"
          >
            Active
          </button>
          <button
            onClick={() => setFilter('expiring')}
            className={`px-3 sm:px-3.5 py-1 rounded-full transition-colors cursor-pointer shrink-0 ${
              filter === 'expiring'
                ? 'bg-accent-tint text-accent font-medium'
                : 'text-muted hover:text-ink'
            }`}
            type="button"
          >
            Expiring Soon
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-border text-center shadow-xs">
          <p className="font-serif text-2xl text-ink mb-2">No links recorded yet</p>
          <p className="text-muted text-sm font-sans">
            Paste a URL above and click "Klip It" to generate your first tiny link and QR code.
          </p>
        </div>
      ) : (
        /* Links List */
        <div className="space-y-3">
          {filteredList.map((item, index) => {
            const rowCopied = isCopied(`row-${index}`)
            const displayShort = item.shortUrl.replace(/^https?:\/\//, '')
            const clicks = item.clicks || 0
            const isExpired = item.expires_at && new Date(item.expires_at) <= new Date()

            return (
              <div
                key={item.shortUrl + index}
                className="bg-white hover:-translate-y-0.5 p-3.5 sm:p-5 rounded-2xl border border-border transition-all shadow-[0_4px_20px_-4px_rgba(39,39,42,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4"
              >
                {/* Left: URLs & Status Badges */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                    <a
                      href={item.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm sm:text-base font-medium text-accent hover:underline break-all"
                    >
                      {displayShort}
                    </a>
                    {isExpired ? (
                      <span className="px-2 py-0.5 rounded-full bg-danger/10 text-danger text-[11px] font-mono border border-danger/20">
                        Expired
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[11px] font-mono border border-success/20">
                        Active
                      </span>
                    )}
                    {item.expires_at && (
                      <span className="px-2 py-0.5 rounded-full bg-canvas text-muted text-[11px] font-mono border border-border">
                        Auto-30d
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-muted font-sans break-all sm:truncate max-w-lg" title={item.url}>
                    {item.url}
                  </div>
                </div>

                {/* Right: Clicks Sparkline & Action Buttons */}
                <div className="flex items-center gap-4 sm:gap-6 shrink-0 flex-wrap justify-between md:justify-end w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-mono text-xs font-semibold text-ink">
                        {clicks.toLocaleString()}
                      </div>
                      <div className="font-mono text-[11px] text-muted">Clicks</div>
                    </div>
                    {/* Velocity Sparkline SVG */}
                    <svg className="w-16 h-6 text-accent" fill="none" viewBox="0 0 80 30">
                      <path
                        d="M0 24 L16 20 L32 26 L48 10 L64 16 L80 4"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      ></path>
                    </svg>
                  </div>

                  {/* Actions: Copy, QR modal, Delete */}
                  <div className="flex items-center gap-1.5">
                    {/* Copy Link Button */}
                    <button
                      type="button"
                      onClick={() => handleCopy(item.shortUrl, index)}
                      className={`w-8 h-8 rounded-full border border-border flex items-center justify-center transition-colors cursor-pointer ${
                        rowCopied
                          ? 'bg-success text-white border-success'
                          : 'bg-canvas hover:bg-accent-tint hover:text-accent text-muted'
                      }`}
                      title={rowCopied ? 'Copied to clipboard' : 'Copy link'}
                    >
                      <span className="material-symbols-outlined text-base">
                        {rowCopied ? 'check' : 'content_copy'}
                      </span>
                    </button>

                    {/* View QR Code Button */}
                    <button
                      type="button"
                      onClick={() => onSelectQr && onSelectQr(item)}
                      className="w-8 h-8 rounded-full border border-border bg-canvas hover:bg-accent-tint hover:text-accent flex items-center justify-center text-muted transition-colors cursor-pointer"
                      title="View & Download QR Code"
                    >
                      <span className="material-symbols-outlined text-base">qr_code</span>
                    </button>

                    {/* Delete Link Button */}
                    <button
                      type="button"
                      onClick={() => onDelete && onDelete(item.url, item.shortCode)}
                      className="w-8 h-8 rounded-full border border-border bg-canvas hover:bg-danger/10 hover:text-danger hover:border-danger/30 flex items-center justify-center text-muted transition-colors cursor-pointer"
                      title="Delete link"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Clear All Saved Links Button */}
      {urlList.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono text-muted hover:text-danger hover:bg-danger/10 transition-colors border border-border hover:border-danger/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">delete_sweep</span>
            <span>Clear all saved links</span>
          </button>
        </div>
      )}
    </section>
  )
}
