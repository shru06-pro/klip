/**
 * ==============================================================================
 * FILE: frontend/src/hooks/useScrollSpy.js
 * WHAT IT DOES: Custom React hook tracking scroll position and synchronizing the
 *               active section anchor with navigation indicators.
 * WHERE IT IS CALLED FROM: components/layout/Header.jsx.
 * WHOM IT CALLS: window.addEventListener('scroll'), window.scrollTo().
 * ==============================================================================
 */

import { useState, useEffect, useRef } from 'react'

export function useScrollSpy(navItems, defaultSection = 'shorten', headerOffset = 90) {
  const [activeNav, setActiveNav] = useState(defaultSection)
  const isManualClick = useRef(false)
  const clickTimeout = useRef(null)

  useEffect(() => {
    // Initial hash check
    const hash = window.location.hash.replace('#', '')
    if (hash && navItems.some((n) => n.id === hash)) {
      setActiveNav(hash)
    }

    const handleScroll = () => {
      if (isManualClick.current) return

      const scrollY = window.scrollY
      const scrollPosition = scrollY + 180

      const isAtBottom =
        window.innerHeight + scrollY >= document.documentElement.scrollHeight - 70

      if (isAtBottom) {
        setActiveNav(navItems[navItems.length - 1].id)
        return
      }

      const sections = navItems
        .map((item) => {
          const el = document.getElementById(item.id)
          if (!el) return null
          return {
            id: item.id,
            docTop: el.getBoundingClientRect().top + scrollY,
          }
        })
        .filter(Boolean)

      sections.sort((a, b) => a.docTop - b.docTop)

      let currentSection = defaultSection
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
  }, [navItems, defaultSection])

  const scrollToSection = (id) => {
    setActiveNav(id)
    isManualClick.current = true

    if (clickTimeout.current) clearTimeout(clickTimeout.current)
    clickTimeout.current = setTimeout(() => {
      isManualClick.current = false
    }, 1200)

    const el = document.getElementById(id)
    if (el) {
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

  return {
    activeNav,
    setActiveNav,
    scrollToSection,
  }
}
