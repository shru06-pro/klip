import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'

const navItems = [
  { id: 'shorten', label: 'Shorten' },
  { id: 'recent', label: 'Recent Links' },
  { id: 'engine', label: 'Engine' },
  { id: 'analytics', label: 'Analytics' },
]

export default function Header() {
  const [activeNav, setActiveNav] = useState('shorten')
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 })
  const navRefs = useRef({})
  const isClickScrolling = useRef(false)
  const scrollTimeoutRef = useRef(null)

  const updatePill = useCallback(() => {
    const el = navRefs.current[activeNav]
    if (el) {
      setPillStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
        opacity: 1,
      })
    }
  }, [activeNav])

  useLayoutEffect(() => {
    updatePill()
  }, [updatePill])

  useEffect(() => {
    const handleResize = () => updatePill()
    window.addEventListener('resize', handleResize)
    if (document.fonts) {
      document.fonts.ready.then(handleResize)
    }
    return () => window.removeEventListener('resize', handleResize)
  }, [updatePill])

  useEffect(() => {
    // Check initial hash on load
    const hash = window.location.hash.replace('#', '')
    if (hash && navItems.some((n) => n.id === hash)) {
      setActiveNav(hash)
    }

    const handleScroll = () => {
      if (isClickScrolling.current) return

      // Check if user is scrolled near the bottom of the page
      const isBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60

      const sectionData = navItems
        .map((item) => {
          const el = document.getElementById(item.id)
          if (!el) return null
          const rect = el.getBoundingClientRect()
          return {
            id: item.id,
            top: rect.top,
            absoluteTop: rect.top + window.scrollY,
          }
        })
        .filter(Boolean)

      if (sectionData.length === 0) return

      // Sort sections by actual document position from top to bottom
      sectionData.sort((a, b) => a.absoluteTop - b.absoluteTop)

      if (isBottom) {
        setActiveNav(sectionData[sectionData.length - 1].id)
        return
      }

      // Find section currently in view near the top (top <= 180)
      let currentId = sectionData[0].id
      for (let i = 0; i < sectionData.length; i++) {
        if (sectionData[i].top <= 180) {
          currentId = sectionData[i].id
        }
      }
      setActiveNav(currentId)
    }

    const handlePopState = () => {
      const currentHash = window.location.hash.replace('#', '')
      if (currentHash && navItems.some((n) => n.id === currentHash)) {
        setActiveNav(currentHash)
      }
    }

    const handleUserScroll = () => {
      isClickScrolling.current = false
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('wheel', handleUserScroll, { passive: true })
    window.addEventListener('touchmove', handleUserScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('wheel', handleUserScroll)
      window.removeEventListener('touchmove', handleUserScroll)
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    }
  }, [])

  const handleNavClick = (e, id) => {
    if (e) e.preventDefault()
    setActiveNav(id)

    const el = document.getElementById(id)
    if (el) {
      // Temporarily lock scroll listener from overriding during smooth scroll
      isClickScrolling.current = true
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)

      scrollTimeoutRef.current = setTimeout(() => {
        isClickScrolling.current = false
      }, 900)

      const navOffset = 90
      const elementPosition = el.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - navOffset

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth',
      })

      window.history.pushState(null, '', `#${id}`)
      if (id === 'shorten') {
        const input = document.getElementById('longUrlInput')
        if (input) setTimeout(() => input.focus(), 350)
      }
    }
  }

  const scrollToShorten = (e) => {
    handleNavClick(e, 'shorten')
  }

  return (
    <header className="sticky top-0 z-50 pt-5 px-4 sm:px-6">
      <nav className="max-w-5xl mx-auto rounded-full px-5 sm:px-6 py-3 bg-white/85 backdrop-blur-md border border-border shadow-[0_10px_35px_-10px_rgba(39,39,42,0.08)] flex items-center justify-between gap-4 transition-all">
        {/* Logo mark + handwritten brand */}
        <a
          className="flex items-center gap-2.5 group cursor-pointer"
          href="#shorten"
          onClick={(e) => handleNavClick(e, 'shorten')}
        >
          <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-serif text-lg font-bold shadow-sm transition-transform group-hover:scale-105">
            K
          </div>
          <span className="font-script text-2xl font-bold text-ink tracking-tight -rotate-2 group-hover:rotate-0 transition-transform">
            Klip<span className="text-accent">.</span>
          </span>
        </a>

        {/* Middle Navigation with dynamic active pill */}
        <div className="relative hidden md:flex items-center gap-1.5 p-1 bg-canvas/70 rounded-full border border-border/70 text-sm">
          {/* Animated sliding pill background */}
          <span
            className="absolute top-1 bottom-1 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-300 ease-out pointer-events-none"
            style={{
              left: `${pillStyle.left}px`,
              width: `${pillStyle.width}px`,
              opacity: pillStyle.opacity,
            }}
          />

          {navItems.map((item) => {
            const isActive = activeNav === item.id
            return (
              <a
                key={item.id}
                ref={(el) => (navRefs.current[item.id] = el)}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`relative z-10 px-4 py-1.5 rounded-full font-medium transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? `text-ink ${pillStyle.opacity === 0 ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]' : ''}`
                    : 'text-muted hover:text-ink'
                }`}
              >
                {item.label}
              </a>
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