import React, { useState } from 'react'
import PulseLoader from 'react-spinners/PulseLoader'
import { API_URL } from '../config'

export default function Shortener({ onUrlCreated }) {
  const [input, setInput] = useState('')
  const [slug, setSlug] = useState('')
  const [autoExpire, setAutoExpire] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Read-only real host prefix
  const hostPrefix = typeof window !== 'undefined' ? `${window.location.host}/` : '/'

  const handleInputChange = (e) => {
    setInput(e.target.value)
    if (errorMessage) setErrorMessage('')
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setInput(text)
        if (errorMessage) setErrorMessage('')
      }
    } catch {
      const el = document.getElementById('longUrlInput')
      if (el) el.focus()
    }
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!input.trim()) {
      setErrorMessage('Please enter a valid link')
      return
    }

    setLoading(true)
    setErrorMessage('')

    try {
      const response = await fetch(`${API_URL}/api/shorten`, {
        method: 'POST',
        body: JSON.stringify({
          url: input.trim(),
          slug: slug.trim() || undefined,
          autoExpire: autoExpire,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.message || 'Error creating short link')
        setLoading(false)
        return
      }

      const newItem = {
        url: input.trim(),
        shortUrl: data.shortUrl,
        shortCode: data.shortCode,
        clicks: data.clicks || 0,
        expires_at: data.expires_at,
        created_at: data.created_at || new Date().toISOString(),
      }

      if (onUrlCreated) {
        onUrlCreated(newItem)
      }

      setInput('')
      setSlug('')
      setLoading(false)
    } catch {
      setErrorMessage('Server connection error. Please verify the backend is running.')
      setLoading(false)
    }
  }

  return (
    <section className="max-w-3xl mx-auto px-4 my-4 sm:my-6" id="shorten">
      <form onSubmit={handleSubmit}>
        {/* Unified Continuous Pill Capsule */}
        <div className="bg-white rounded-full border border-border shadow-[0_10px_35px_-10px_rgba(39,39,42,0.08)] p-1.5 sm:p-2 pl-3.5 sm:pl-6 flex items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-accent/30 focus-within:border-accent">
          <span className="material-symbols-outlined text-muted text-lg sm:text-xl shrink-0">link</span>
          <input
            id="longUrlInput"
            className="w-full bg-transparent border-0 focus:ring-0 text-ink text-sm sm:text-base placeholder-muted/60 p-0 font-normal truncate outline-none min-w-0"
            placeholder="Paste raw URL here..."
            type="url"
            value={input}
            onChange={handleInputChange}
            required
          />

          {/* Quick paste trigger */}
          {!input && (
            <button
              id="pasteBtn"
              type="button"
              onClick={handlePaste}
              className="hidden xs:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-mono text-muted hover:text-ink hover:bg-canvas transition-colors cursor-pointer shrink-0"
              title="Paste from clipboard"
            >
              <span className="material-symbols-outlined text-sm">content_paste</span>
              <span className="hidden sm:inline">Paste</span>
            </button>
          )}

          {/* Submit Button */}
          <button
            id="klipActionBtn"
            type="submit"
            disabled={loading}
            className="bg-ink text-white hover:bg-[#3F3F46] rounded-full px-4 sm:px-6 py-2.5 sm:py-3 font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition hover:-translate-y-0.5 active:translate-y-0 shadow-sm shrink-0 cursor-pointer disabled:opacity-70 whitespace-nowrap"
          >
            {loading ? (
              <PulseLoader color="white" size={5} aria-label="Loading" />
            ) : (
              <>
                <span>Klip It</span>
                <span className="material-symbols-outlined text-sm sm:text-base text-accent-soft">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </div>

        {/* Error message indicator */}
        {errorMessage && (
          <div className="mt-3 text-center">
            <p className="text-danger text-xs font-mono bg-danger/10 px-4 py-1.5 rounded-full inline-block border border-danger/20">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Domain & Custom Slug Sub-bar */}
        <div className="mt-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 px-1 sm:px-2">
          {/* Unified Link Prefix + Slug Input */}
          <div className="flex items-center gap-1.5 bg-white border border-border/80 rounded-full px-3 py-1.5 shadow-2xs text-xs font-mono">
            <span className="text-muted text-[11px] font-sans font-medium shrink-0">Link:</span>
            <span className="text-accent font-medium shrink-0 truncate max-w-[130px] sm:max-w-none">{hostPrefix}</span>
            <input
              id="aliasInput"
              type="text"
              placeholder="custom-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="bg-transparent border-0 p-0 text-ink text-xs font-mono focus:ring-0 flex-1 sm:w-28 outline-none placeholder:text-muted/40"
            />
            {slug.trim() && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>}
          </div>

          {/* Option Toggles */}
          <div className="flex items-center justify-between sm:justify-end gap-3 text-muted text-[11px] font-mono px-2 sm:px-0">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-ink select-none" title="Link expires automatically after 30 days">
              <input
                type="checkbox"
                checked={autoExpire}
                onChange={(e) => setAutoExpire(e.target.checked)}
                className="rounded text-accent focus:ring-accent/20 border-border"
              />
              <span>Auto-30d</span>
            </label>
            <div className="flex items-center gap-1 text-muted" title="QR Code is generated dynamically for every shortened link">
              <span className="material-symbols-outlined text-xs text-accent">qr_code</span>
              <span>QR Ready</span>
            </div>
          </div>
        </div>
      </form>
    </section>
  )
}