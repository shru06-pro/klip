import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import logoIcon from '../images/logo-icon.png'

const navItems = [
  { id: 'shorten', label: 'Shorten' },
  { id: 'engine', label: 'Engine' },
  { id: 'recent', label: 'Recent Links' },
]

export default function Header() {
  const [activeNav, setActiveNav] = useState('shorten')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [pillStyle, setPillStyle] = useState({ left: 4, width: 78, opacity: 1 })
  const navRefs = useRef({})
  const containerRef = useRef(null)
  const isManualClick = useRef(false)
  const clickTimeout = useRef(null)

  useEffect(() => {
    if (!mobileMenuOpen) return
    const handleOutsideClick = (e) => {
      if (!e.target.closest('header')) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('click', handleOutsideClick)
    return () => window.removeEventListener('click', handleOutsideClick)
  }, [mobileMenuOpen])

  const updatePill = useCallback((navId = activeNav) => {
    const el = navRefs.current[navId]
    if (el) {
      setPillStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
        opacity: 1,
      })
    }
  }, [activeNav])

  useLayoutEffect(() => {
    updatePill(activeNav)
  }, [activeNav, updatePill])

  useEffect(() => {
    const handleResize = () => updatePill(activeNav)
    window.addEventListener('resize', handleResize)
    if (document.fonts) {
      document.fonts.ready.then(handleResize)
    }
    const timer = setTimeout(handleResize, 50)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timer)
    }
  }, [activeNav, updatePill])

  useEffect(() => {
    // Check initial hash on load
    const hash = window.location.hash.replace('#', '')
    if (hash && navItems.some((n) => n.id === hash)) {
      setActiveNav(hash)
    }

    const handleScroll = () => {
      // Do not override user selection while smooth-scrolling from a click
      if (isManualClick.current) return

      const scrollY = window.scrollY
      const scrollPosition = scrollY + 180

      // If user is scrolled to the very bottom, activate the lowest section
      const isAtBottom =
        window.innerHeight + scrollY >= document.documentElement.scrollHeight - 70

      if (isAtBottom) {
        setActiveNav('recent')
        return
      }

      // Track sections in order of their absolute document position
      const sections = navItems
        .map((item) => {
          const el = document.getElementById(item.id)
          if (!el) return null
          const rect = el.getBoundingClientRect()
          return {
            id: item.id,
            docTop: rect.top + scrollY,
          }
        })
        .filter(Boolean)

      sections.sort((a, b) => a.docTop - b.docTop)

      let currentSection = 'shorten'
      for (const section of sections) {
        if (scrollPosition >= section.docTop) {
          currentSection = section.id
        }
      }

      setActiveNav(currentSection)
    }

    const handlePopState = () => {
      const currentHash = window.location.hash.replace('#', '')
      if (currentHash && navItems.some((n) => n.id === currentHash)) {
        setActiveNav(currentHash)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('popstate', handlePopState)
      if (clickTimeout.current) clearTimeout(clickTimeout.current)
    }
  }, [])

  const handleNavClick = (id) => {
    setActiveNav(id)
    updatePill(id)
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
    <header className="sticky top-0 z-50 pt-3 sm:pt-5 px-3 sm:px-6">
      <nav className="max-w-5xl mx-auto rounded-full px-3.5 sm:px-6 py-2 sm:py-3 bg-white/85 backdrop-blur-md border border-border shadow-[0_10px_35px_-10px_rgba(39,39,42,0.08)] flex items-center justify-between gap-2 sm:gap-4 transition-all">
        {/* Brand Monogram Lockup */}
        <a
          className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer transition-opacity hover:opacity-85"
          href="#shorten"
          onClick={(e) => {
            e.preventDefault()
            scrollToShorten()
            setMobileMenuOpen(false)
          }}
        >
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-black/5 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
            <img
              src={logoIcon}
              alt="Klip"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-serif text-xl sm:text-2xl tracking-tight text-ink font-semibold">
            Klip<span className="text-accent">.</span>
          </span>
        </a>

        {/* Middle Navigation with dynamic sliding circle pill (Desktop) */}
        <div
          ref={containerRef}
          className="relative hidden md:flex items-center gap-1.5 p-1 bg-canvas/70 rounded-full border border-border/70 text-sm"
        >
          {/* Animated sliding pill indicator */}
          <span
            className="absolute top-1 bottom-1 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
            style={{
              left: `${pillStyle.left}px`,
              width: `${pillStyle.width}px`,
              opacity: pillStyle.opacity,
            }}
          />

          {navItems.map((item) => {
            const isActive = activeNav === item.id
            return (
              <button
                key={item.id}
                ref={(el) => (navRefs.current[item.id] = el)}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`relative z-10 px-4 py-1.5 rounded-full font-medium transition-colors duration-200 cursor-pointer select-none ${
                  isActive
                    ? 'text-ink font-semibold'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => {
              scrollToShorten()
              setMobileMenuOpen(false)
            }}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-accent-tint text-accent hover:bg-accent hover:text-white transition-all text-xs font-mono font-medium border border-accent/20 cursor-pointer"
            type="button"
          >
            <span>New Link</span>
            <span className="text-xs">+</span>
          </button>

          <div className="hidden xs:flex w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-border ring-2 ring-white bg-accent-tint items-center justify-center shrink-0">
            <span className="font-serif text-xs sm:text-sm font-semibold text-accent">S</span>
          </div>

          {/* Mobile menu toggle button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-8 h-8 rounded-full bg-canvas border border-border flex items-center justify-center text-ink hover:bg-accent-tint hover:text-accent transition-colors cursor-pointer shrink-0"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-base">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden max-w-5xl mx-auto mt-2 p-2 bg-white/95 backdrop-blur-md rounded-2xl border border-border shadow-[0_12px_30px_rgba(39,39,42,0.1)] flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
          {navItems.map((item) => {
            const isActive = activeNav === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  handleNavClick(item.id)
                  setMobileMenuOpen(false)
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer flex items-center justify-between ${
                  isActive
                    ? 'bg-accent-tint text-accent font-semibold'
                    : 'text-ink/80 hover:bg-canvas'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </header>
  )
}