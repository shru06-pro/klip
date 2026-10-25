import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'

const navItems = [
  { id: 'shorten', label: 'Shorten' },
  { id: 'recent', label: 'Recent Links' },
  { id: 'engine', label: 'Engine' },
  { id: 'analytics', label: 'Analytics' },
]

export default function Header() {
  const [activeNav, setActiveNav] = useState('shorten')
  const [pillStyle, setPillStyle] = useState({ left: 4, width: 78, opacity: 1 })
  const navRefs = useRef({})
  const containerRef = useRef(null)
  const isManualClick = useRef(false)
  const clickTimeout = useRef(null)

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
      const sections = ['shorten', 'engine', 'analytics', 'recent']
        .map((id) => {
          const el = document.getElementById(id)
          if (!el) return null
          const rect = el.getBoundingClientRect()
          return {
            id,
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
    <header className="sticky top-0 z-50 pt-5 px-4 sm:px-6">
      <nav className="max-w-5xl mx-auto rounded-full px-5 sm:px-6 py-3 bg-white/85 backdrop-blur-md border border-border shadow-[0_10px_35px_-10px_rgba(39,39,42,0.08)] flex items-center justify-between gap-4 transition-all">
        {/* Brand Monogram Lockup */}
        <a
          className="flex items-center gap-3 group cursor-pointer transition-opacity hover:opacity-85"
          href="#shorten"
          onClick={(e) => {
            e.preventDefault()
            scrollToShorten()
          }}
        >
          <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-black/5 flex items-center justify-center transition-transform group-hover:scale-105">
            <img
              src="/logo-icon.png"
              alt="Klip"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-serif text-2xl tracking-tight text-ink font-semibold">
            Klip<span className="text-accent">.</span>
          </span>
        </a>

        {/* Middle Navigation with dynamic sliding circle pill */}
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
        <div className="flex items-center gap-2.5">
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