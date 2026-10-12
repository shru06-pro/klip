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
    <section className="max-w-3xl mx-auto px-4 my-6" id="shorten">
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-full border border-border shadow-[0_12px_40px_-10px_rgba(39,39,42,0.1)] p-2 pl-4 sm:pl-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 transition-all focus-within:ring-2 focus-within:ring-accent/30 focus-within:border-accent">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <span className="material-symbols-outlined text-muted text-xl shrink-0">link</span>
            <input
              id="longUrlInput"
              className="w-full bg-transparent border-0 focus:ring-0 text-ink text-sm sm:text-base placeholder-muted/60 p-0 font-normal truncate outline-none"
              placeholder="Paste raw URL here... (e.g. https://...)"
              type="url"
              value={input}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            {/* Quick paste trigger */}
            <button
              id="pasteBtn"
              type="button"
              onClick={handlePaste}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-mono text-muted hover:text-ink hover:bg-canvas transition-colors cursor-pointer"
              title="Paste from clipboard"
            >
              <span className="material-symbols-outlined text-sm">content_paste</span>
              <span>⌘V</span>
            </button>

            {/* Submit Button */}
            <button
              id="klipActionBtn"
              type="submit"
              disabled={loading}
              className="bg-ink text-white hover:bg-[#3F3F46] rounded-full px-6 py-3 font-medium text-sm flex items-center justify-center gap-2 transition hover:-translate-y-0.5 active:translate-y-0 shadow-sm shrink-0 cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <PulseLoader color="white" size={6} aria-label="Loading" />
              ) : (
                <>
                  <span>Klip It</span>
                  <span className="material-symbols-outlined text-base text-accent-soft">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </div>
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
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5 px-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs uppercase tracking-wider text-muted">Host:</span>
            {/* Read-only real host display */}
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-border text-xs font-mono text-ink shadow-xs">
              <span className="text-accent font-medium">{hostPrefix}</span>
            </div>

            <div className="inline-flex items-center bg-white border border-border rounded-full px-3 py-1 gap-1 text-xs font-mono">
              <span className="text-muted">custom slug:</span>
              <input
                id="aliasInput"
                type="text"
                placeholder="optional"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="bg-transparent border-0 p-0 text-ink text-xs font-mono focus:ring-0 w-24 outline-none"
              />
              {slug.trim() && <span className="w-1.5 h-1.5 rounded-full bg-accent ml-0.5"></span>}
            </div>
          </div>

          {/* Honest Toggles */}
          <div className="flex items-center gap-3 text-xs text-muted font-mono">
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