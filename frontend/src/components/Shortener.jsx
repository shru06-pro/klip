/**
 * ==============================================================================
 * FILE: frontend/src/components/Shortener.jsx
 * WHAT IT DOES: Interactive form component allowing users to shorten URLs:
 *               1. Captures destination URL and optional custom slug alias.
 *               2. Provides quick clipboard paste button via navigator.clipboard.
 *               3. Configures 30-day link auto-expiration toggle.
 *               4. Issues asynchronous HTTP POST requests to `${API_URL}/api/shorten`.
 *               5. Dispatches newly created link objects to parent `onUrlCreated` callback.
 * WHERE IT IS CALLED FROM: Rendered inside `<Main />` (frontend/src/components/Main.jsx).
 * WHOM IT CALLS: fetch(`${API_URL}/api/shorten`), navigator.clipboard.readText(),
 *                props.onUrlCreated(), PulseLoader spinner.
 * WHERE THAT CALL IS GOING: Posts JSON payload to backend POST /api/shorten and notifies parent.
 * ==============================================================================
 */

import React, { useState } from 'react'
import PulseLoader from 'react-spinners/PulseLoader'
import { API_URL } from '../config'

/**
 * COMPONENT: Shortener({ onUrlCreated })
 * WHAT IT DOES: Form component managing link input, custom slug, API request lifecycle, and error handling.
 * WHERE IT IS CALLED FROM: Rendered in frontend/src/components/Main.jsx.
 * WHOM IT CALLS: handleInputChange, handlePaste, handleSubmit, onUrlCreated.
 * WHERE THAT CALL IS GOING: Interacts with backend API and updates parent component state.
 */
export default function Shortener({ onUrlCreated }) {
  const [input, setInput] = useState('')
  const [slug, setSlug] = useState('')
  const [autoExpire, setAutoExpire] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Read-only real host prefix shown in the custom slug input
  const hostPrefix = typeof window !== 'undefined' ? `${window.location.host}/` : '/'

  /**
   * FUNCTION: handleInputChange(e)
   * WHAT IT DOES: Synchronizes the long URL input field with component state and clears active errors.
   * WHERE IT IS CALLED FROM: onChange event on `<input id="longUrlInput">`.
   * WHOM IT CALLS: setInput(), setErrorMessage('').
   * WHERE THAT CALL IS GOING: Updates local React state.
   */
  const handleInputChange = (e) => {
    setInput(e.target.value)
    if (errorMessage) setErrorMessage('')
  }

  /**
   * FUNCTION: handlePaste()
   * WHAT IT DOES: Asynchronously reads textual data from the operating system clipboard
   *               and populates the URL input field directly.
   * WHERE IT IS CALLED FROM: Click event on `<button id="pasteBtn">`.
   * WHOM IT CALLS: navigator.clipboard.readText(), setInput().
   * WHERE THAT CALL IS GOING: Reads system clipboard into input state.
   */
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

  /**
   * FUNCTION: handleSubmit(e)
   * WHAT IT DOES: Submits the link creation form:
   *               1. Performs client-side emptiness check.
   *               2. Sets loading indicator state.
   *               3. Sends HTTP POST request to `${API_URL}/api/shorten` with { url, slug, autoExpire }.
   *               4. Formats response payload and invokes parent `onUrlCreated(newItem)` callback.
   *               5. Resets input fields and clears loading spinner.
   * WHERE IT IS CALLED FROM: onSubmit event on `<form>` or click on `<button id="klipActionBtn">`.
   * WHOM IT CALLS: fetch(`${API_URL}/api/shorten`), onUrlCreated(), setInput(), setLoading().
   * WHERE THAT CALL IS GOING: Backend link creation endpoint (backend/routes/index.js).
   */
  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!input.trim()) {
      setErrorMessage('Please enter a valid link')
      return
    }

    setLoading(true)
    setErrorMessage('')

    try {
      // FUNCTION CALL: fetch(`${API_URL}/api/shorten`)
      // - WHAT IT DOES: Dispatches JSON payload to backend API.
      // - WHERE THAT CALL IS GOING: Backend POST /api/shorten.
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

      // FUNCTION CALL: onUrlCreated(newItem)
      // - WHAT IT DOES: Passes newly generated link object to parent Main component.
      // - WHERE THAT CALL IS GOING: Invokes addLink() in frontend/src/components/Main.jsx.
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

          {/* Quick clipboard paste button */}
          {!input && (
            <button
              id="pasteBtn"
              type="button"
              onClick={handlePaste}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-mono text-muted hover:text-ink hover:bg-canvas transition-colors cursor-pointer shrink-0"
              title="Paste from clipboard"
            >
              <span className="material-symbols-outlined text-sm">content_paste</span>
              <span>Paste</span>
            </button>
          )}

          {/* Submit Action Button */}
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

        {/* Dynamic Error Feedback Badge */}
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

          {/* Option Toggles: Auto-30d and QR Ready */}
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