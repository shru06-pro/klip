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
 * WHOM IT CALLS: Header (./components/layout/Header), Main (./components/layout/Main),
 *                API_URL (./config/api.config), window.location.replace().
 * WHERE THAT CALL IS GOING: Renders application shell or forwards user browser to backend.
 * ==============================================================================
 */

import React, { useEffect, useState } from 'react'
import Header from './components/layout/Header'
import Main from './components/layout/Main'
import { API_URL } from './config/api.config'
import logoIcon from './images/logo-icon.png'

function App() {
  const [redirecting, setRedirecting] = useState(false)

  // Edge shortcode interception
  useEffect(() => {
    const path = window.location.pathname.replace(/^\/+/, '')
    if (path && !path.includes('.')) {
      setRedirecting(true)
      window.location.replace(`${API_URL}/${path}`)
    }
  }, [])

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
      <Header />
      <Main />
    </div>
  )
}

export default App
