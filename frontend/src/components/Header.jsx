import React from 'react'

export default function Header() {
  const scrollToShorten = () => {
    const el = document.getElementById('shorten')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      const input = document.getElementById('longUrlInput')
      if (input) input.focus()
    }
  }

  return (
    <header className="sticky top-0 z-50 pt-5 px-4 sm:px-6">
      <nav className="max-w-5xl mx-auto rounded-full px-5 sm:px-6 py-3 bg-white/85 backdrop-blur-md border border-border shadow-[0_10px_35px_-10px_rgba(39,39,42,0.08)] flex items-center justify-between gap-4 transition-all">
        {/* Logo mark + handwritten brand */}
        <a className="flex items-center gap-2.5 group" href="/">
          <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-serif text-lg font-bold shadow-sm transition-transform group-hover:scale-105">
            K
          </div>
          <span className="font-script text-2xl font-bold text-ink tracking-tight -rotate-2 group-hover:rotate-0 transition-transform">
            Klip<span className="text-accent">.</span>
          </span>
        </a>

        {/* Middle Navigation */}
        <div className="hidden md:flex items-center gap-1.5 p-1 bg-canvas/70 rounded-full border border-border/70 text-sm">
          <a
            className="px-4 py-1.5 rounded-full font-medium bg-white text-ink shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            href="#shorten"
          >
            Shorten
          </a>
          <a
            className="px-4 py-1.5 rounded-full font-medium text-muted hover:text-ink transition-colors"
            href="#recent"
          >
            Recent Links
          </a>
          <a
            className="px-4 py-1.5 rounded-full font-medium text-muted hover:text-ink transition-colors"
            href="#engine"
          >
            Engine
          </a>
          <a
            className="px-4 py-1.5 rounded-full font-medium text-muted hover:text-ink transition-colors"
            href="#analytics"
          >
            Analytics
          </a>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-canvas border border-border text-xs font-mono text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
            <span>API: 99.98% Fast</span>
          </div>

          <button
            onClick={scrollToShorten}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent-tint text-accent hover:bg-accent hover:text-white transition-all text-xs font-mono font-medium border border-accent/20 cursor-pointer"
            type="button"
          >
            <span>New Link</span>
            <span className="text-xs">+</span>
          </button>

          <div className="w-8 h-8 rounded-full overflow-hidden border border-border ring-2 ring-white bg-accent-tint flex items-center justify-center">
            <span className="font-serif text-sm font-semibold text-accent">S</span>
          </div>
        </div>
      </nav>
    </header>
  )
}