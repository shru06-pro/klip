import React, { useEffect, useState } from 'react'
import Header from './components/Header'
import Main from './components/Main'
import { API_URL } from './config'

function App() {
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    const path = window.location.pathname.replace(/^\/+/, '')
    // If the path is a short code (non-empty, not a static file)
    if (path && !path.includes('.')) {
      setRedirecting(true)
      window.location.replace(`${API_URL}/${path}`)
    }
  }, [])

  if (redirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center p-6 bg-canvas text-ink">
        <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-serif text-2xl font-bold animate-pulse">
          K
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
