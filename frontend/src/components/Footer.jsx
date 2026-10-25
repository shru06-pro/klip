/**
 * ==============================================================================
 * FILE: frontend/src/components/Footer.jsx
 * WHAT IT DOES: Renders the site-wide footer:
 *               1. Monogram paperclip-K badge and "Klip." typography mark.
 *               2. Version release badge (v2.4.0 Engine).
 *               3. Dynamic copyright year and positioning statement.
 * WHERE IT IS CALLED FROM: Rendered at the bottom of `<Main />` (frontend/src/components/Main.jsx).
 * WHOM IT CALLS: Pure JSX presentation component.
 * WHERE THAT CALL IS GOING: Injects the footer container into the bottom of the DOM tree.
 * ==============================================================================
 */

import React from 'react'
import logoIcon from '../images/logo-icon.png'

/**
 * COMPONENT: Footer()
 * WHAT IT DOES: Displays branding, engine release version, and copyright year.
 * WHERE IT IS CALLED FROM: Rendered in frontend/src/components/Main.jsx.
 * WHOM IT CALLS: JSX elements, new Date().getFullYear().
 * WHERE THAT CALL IS GOING: Browser DOM.
 */
export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-border py-8 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        {/* Brand Lockup */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg overflow-hidden bg-white shadow-xs ring-1 ring-black/5 flex items-center justify-center">
            <img src={logoIcon} alt="Klip" className="w-full h-full object-contain p-0.5" />
          </div>
          <span className="font-serif text-xl tracking-tight text-ink font-semibold">
            Klip<span className="text-accent">.</span>
          </span>
          <span className="font-mono text-xs text-muted ml-2">v2.4.0 Engine</span>
        </div>

        {/* Copyright notice */}
        <p className="font-sans text-xs text-muted">
          © {new Date().getFullYear()} Klip. Engineered for creative technologists. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
