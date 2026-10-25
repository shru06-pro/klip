/**
 * ==============================================================================
 * FILE: frontend/src/components/Header.jsx
 * WHAT IT DOES: Renders the sticky top navigation header for the web application.
 *               1. Brand monogram lockup with clean paperclip-K icon.
 *               2. Desktop navigation pill bar featuring an animated sliding indicator
 *                  that tracks active sections based on user clicks and window scroll position.
 *               3. Mobile responsive navigation drawer with full touch support.
 *               4. Smooth scroll routing to `#shorten`, `#engine`, and `#recent` page anchors.
 * WHERE IT IS CALLED FROM: Rendered at the top of `<App />` (frontend/src/App.js).
 * WHOM IT CALLS: window.scrollTo(), window.addEventListener(), updatePill(), handleNavClick().
 * WHERE THAT CALL IS GOING: Manipulates browser window scroll position and visual pill styles.
 * ==============================================================================
 */

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import logoIcon from '../images/logo-icon.png'

const navItems = [
  { id: 'shorten', label: 'Shorten' },
  { id: 'engine', label: 'Engine' },
  { id: 'recent', label: 'Recent Links' },
]

/**
 * COMPONENT: Header()
 * WHAT IT DOES: Main header component with scroll spy, dynamic sliding pill, and mobile drawer.
 * WHERE IT IS CALLED FROM: Rendered in frontend/src/App.js.
 * WHOM IT CALLS: useCallback, useLayoutEffect, useEffect, window.addEventListener, window.scrollTo.
 * WHERE THAT CALL IS GOING: Sticky navigation overlay pinned at the top of the viewport.
 */
export default function Header() {
  const [activeNav, setActiveNav] = useState('shorten')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [pillStyle, setPillStyle] = useState({ left: 4, width: 78, opacity: 1 })
  const navRefs = useRef({})
  const containerRef = useRef(null)
  const isManualClick = useRef(false)
  const clickTimeout = useRef(null)

  /**
   * SECTION: Mobile Outside Click Handler
   * WHAT IT DOES: Closes the mobile dropdown drawer if the user taps outside the `<header>` element.
   * WHERE IT IS CALLED FROM: Window 'click' event listener.
   * WHOM IT CALLS: setMobileMenuOpen(false).
   * WHERE THAT CALL IS GOING: Updates local state to close mobile drawer.
   */
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

  /**
   * FUNCTION: updatePill(navId)
   * WHAT IT DOES: Measures the DOM dimensions (`offsetLeft` and `offsetWidth`) of the
   *               currently active navigation button and updates `pillStyle` state to
   *               smoothly animate the white pill capsule behind the active label.
   * WHERE IT IS CALLED FROM: Called on mount, layout changes, activeNav updates, and window resize.
   * WHOM IT CALLS: navRefs.current[navId].offsetLeft/offsetWidth, setPillStyle().
   * WHERE THAT CALL IS GOING: Updates CSS transform/geometry of sliding span indicator.
   */
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

  /**
   * SECTION: Window Resize & Font Readiness Listener
   * WHAT IT DOES: Re-calculates pill bounds whenever the window is resized or custom
   *               web fonts finish loading, avoiding visual misalignment.
   * WHERE IT IS CALLED FROM: Mount effect.
   * WHOM IT CALLS: window.addEventListener('resize'), document.fonts.ready.then(), updatePill().
   * WHERE THAT CALL IS GOING: Re-aligns pill indicator on screen geometry changes.
   */
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

  /**
   * SECTION: Scroll Spy Hook
   * WHAT IT DOES: Listens to window scroll events to detect which section (#shorten,
   *               #engine, #recent) is currently active in the viewport, shifting the
   *               navigation pill indicator automatically as the user scrolls.
   * WHERE IT IS CALLED FROM: Mount effect.
   * WHOM IT CALLS: window.addEventListener('scroll'), document.getElementById(), setActiveNav().
   * WHERE THAT CALL IS GOING: Synchronizes active navigation state with document scroll offset.
   */
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash && navItems.some((n) => n.id === hash)) {
      setActiveNav(hash)
    }

    const handleScroll = () => {
      // Do not override user selection while smooth-scrolling from an explicit click
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

  /**
   * FUNCTION: handleNavClick(id)
   * WHAT IT DOES: Handles user click on a navigation item:
   *               1. Updates active navigation state and animates the indicator pill.
   *               2. Flags manual click to temporarily suspend the scroll spy.
   *               3. Performs smooth window scrolling to the targeted element offset.
   *               4. Focuses the long URL input if 'shorten' is clicked.
   * WHERE IT IS CALLED FROM: Click event on desktop nav buttons or mobile menu items.
   * WHOM IT CALLS: setActiveNav(), updatePill(), window.scrollTo(), window.history.pushState().
   * WHERE THAT CALL IS GOING: Scrolls window to anchor element and updates URL hash.
   */
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

      // FUNCTION CALL: window.scrollTo()
      // - WHAT IT DOES: Smoothly scrolls viewport to designated section.
      // - WHERE THAT CALL IS GOING: Browser window viewport.
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

  /**
   * FUNCTION: scrollToShorten()
   * WHAT IT DOES: Convenience wrapper that scrolls directly to the shortener form.
   * WHERE IT IS CALLED FROM: Brand logo click or "New Link +" button click.
   * WHOM IT CALLS: handleNavClick('shorten').
   * WHERE THAT CALL IS GOING: Triggers handleNavClick with id='shorten'.
   */
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
              className="w-full h-full object-contain p-0.5"
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
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent-tint text-accent hover:bg-accent hover:text-white transition-all text-xs font-mono font-medium border border-accent/20 cursor-pointer"
            type="button"
          >
            <span>New Link</span>
            <span className="text-xs">+</span>
          </button>

          <div className="hidden md:flex w-8 h-8 rounded-full overflow-hidden border border-border ring-2 ring-white bg-accent-tint items-center justify-center shrink-0">
            <span className="font-serif text-sm font-semibold text-accent">S</span>
          </div>

          {/* Mobile menu toggle button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-full bg-canvas/80 border border-border flex items-center justify-center text-ink hover:bg-accent-tint hover:text-accent transition-colors cursor-pointer shrink-0"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-lg">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden max-w-5xl mx-auto mt-2 p-2.5 bg-white/95 backdrop-blur-md rounded-2xl border border-border shadow-[0_14px_35px_rgba(39,39,42,0.12)] flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
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
          <div className="pt-2 border-t border-border/60">
            <button
              type="button"
              onClick={() => {
                scrollToShorten()
                setMobileMenuOpen(false)
              }}
              className="w-full text-center px-4 py-2.5 rounded-xl bg-ink text-white font-medium text-xs font-mono flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Create New Link</span>
              <span className="text-accent-soft">+</span>
            </button>
          </div>
        </div>
      )}
    </header>
  )
}