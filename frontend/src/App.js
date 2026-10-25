/**
 * ==============================================================================
 * FILE: frontend/src/App.js
 * WHAT IT DOES: Root application component for the Klip. web experience.
 *               1. Detects direct short-code path visits on the frontend domain
 *                  (e.g., `https://frontend-host/SKstZ_`), rendering a branded
 *                  "Redirecting..." screen and instantly forwarding the browser
 *                  to the backend redirect handler `${API_URL}/${path}`.
 *               2. If on the root homepage, renders the persistent layout container,
 *                  incorporating `<Header />` and `<Main />`.
 * WHERE IT IS CALLED FROM: Mounted into the root DOM element in frontend/src/index.js.
 * WHOM IT CALLS: Header (./components/Header), Main (./components/Main),
 *                API_URL (./config), window.location.replace().
 * WHERE THAT CALL IS GOING: Renders application shell or forwards user browser to backend.
 * ==============================================================================
 */

import React, { useEffect, useState } from 'react'
import Header from './components/Header'
import Main from './components/Main'
import { API_URL } from './config'
import logoIcon from './images/logo-icon.png'

/**
 * COMPONENT: App()
 * WHAT IT DOES: Top-level component coordinating client redirection and view assembly.
 * WHERE IT IS CALLED FROM: Invoked by ReactDOM in frontend/src/index.js.
 * WHOM IT CALLS: useEffect, window.location.replace, <Header />, <Main />.
 * WHERE THAT CALL IS GOING: Browser DOM.
 */
function App() {
  const [redirecting, setRedirecting] = useState(false)

  /**
   * SECTION: Edge Short-Code Interception Hook
   * WHAT IT DOES: Inspects the current URL pathname on page load. If the path represents
   *               a short code (not a file extension or root), it triggers an immediate
   *               browser redirect to the backend redirect resolver `${API_URL}/${path}`.
   * WHERE IT IS CALLED FROM: Runs on component initial mount.
   * WHOM IT CALLS: window.location.replace().
   * WHERE THAT CALL IS GOING: Sends browser HTTP GET request to backend `GET /:code`.
   */
  useEffect(() => {
    const path = window.location.pathname.replace(/^\/+/, '')
    // If the path is a short code (non-empty, not a static file)
    if (path && !path.includes('.')) {
      setRedirecting(true)
      // FUNCTION CALL: window.location.replace()
      // - WHAT IT DOES: Replaces current browser history entry with the backend redirect URL.
      // - WHERE THAT CALL IS GOING: Backend router `GET /:code` for 302 hop to destination.
      window.location.replace(`${API_URL}/${path}`)
    }
  }, [])

  // If redirecting, display aesthetic branded intermediate screen
  if (redirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center p-6 bg-canvas text-ink">
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white shadow-md ring-1 ring-black/5 flex items-center justify-center animate-pulse">
          <img src={logoIcon} alt="Klip" className="w-full h-full object-cover" />
        </div>
        <div className="space-y-1">
          <h2 className="font-serif text-3xl text-ink">Redirecting...</h2>
          <p className="font-mono text-xs text-muted">Forwarding you to your destination link.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans antialiased selection:bg-accent-tint selection:text-accent">
      {/* Top Navbar */}
      <Header />
      {/* Main Interactive Workflow & Content */}
      <Main />
    </div>
  )
}

export default App
