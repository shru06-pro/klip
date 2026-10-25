import React, { useState, useEffect, useRef } from 'react'

const navItems = [
  { id: 'shorten', label: 'Shorten' },
  { id: 'recent', label: 'Recent Links' },
  { id: 'engine', label: 'Engine' },
  { id: 'analytics', label: 'Analytics' },
]

export default function Header() {
  const [activeNav, setActiveNav] = useState('shorten')
  const isManualClick = useRef(false)
  const clickTimeout = useRef(null)

  useEffect(() => {
    // Check initial hash on load
    const hash = window.location.hash.replace('#', '')
    if (hash && navItems.some((n) => n.id === hash)) {
      setActiveNav(hash)
    }

    const handleScroll = () => {
      // Do not override user selection while smooth-scrolling from a click
      if (isManualClick.current) return

      const scrollPosition = window.scrollY + 160

      // If user is scrolled to the very bottom, activate the lowest section
      const isAtBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 70

      if (isAtBottom) {
        setActiveNav('recent')
        return
      }

      // Track sections in order of their page position
      const sections = [
        { id: 'shorten', el: document.getElementById('shorten') },
        { id: 'engine', el: document.getElementById('engine') },
        { id: 'analytics', el: document.getElementById('analytics') },
        { id: 'recent', el: document.getElementById('recent') },
      ].filter((s) => s.el !== null)

      let currentSection = 'shorten'
      for (const section of sections) {
        if (scrollPosition >= section.el.offsetTop) {
          currentSection = section.id
        }
      }

      setActiveNav(currentSection)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (clickTimeout.current) clearTimeout(clickTimeout.current)
    }
  }, [])

  const handleNavClick = (id) => {
    setActiveNav(id)
    isManualClick.current = true

    if (clickTimeout.current) clearTimeout(clickTimeout.current)
    clickTimeout.current = setTimeout(() => {
      isManualClick.current = false
    }, 1200)

    const el = document.getElementById(id)
    if (el) {
      const headerOffset = 90
      const elementPosition = el.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth',
      })

      window.history.pushState(null, '', `#${id}`)
      if (id === 'shorten') {
        const input = document.getElementById('longUrlInput')
        if (input) setTimeout(() => input.focus(), 300)
      }
    }
  }

  const scrollToShorten = () => {
    handleNavClick('shorten')
  }

  return (
    <header className="sticky top-0 z-50 pt-5 px-4 sm:px-6">
      <nav className="max-w-5xl mx-auto rounded-full px-5 sm:px-6 py-3 bg-white/85 backdrop-blur-md border border-border shadow-[0_10px_35px_-10px_rgba(39,39,42,0.08)] flex items-center justify-between gap-4 transition-all">
        {/* Logo mark + handwritten brand */}
        <a
          className="flex items-center gap-2.5 group cursor-pointer"
          href="#shorten"
          onClick={(e) => {
            e.preventDefault()
            scrollToShorten()
          }}
        >
          <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-serif text-lg font-bold shadow-sm transition-transform group-hover:scale-105">
            K
          </div>
          <span className="font-script text-2xl font-bold text-ink tracking-tight -rotate-2 group-hover:rotate-0 transition-transform">
            Klip<span className="text-accent">.</span>
          </span>
        </a>

        {/* Middle Navigation with dynamic active pill */}
        <div className="hidden md:flex items-center gap-1.5 p-1 bg-canvas/70 rounded-full border border-border/70 text-sm">
          {navItems.map((item) => {
            const isActive = activeNav === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`px-4 py-1.5 rounded-full font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white text-ink shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {item.label}
              </button>
            )
          })}
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