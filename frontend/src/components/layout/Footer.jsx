/**
 * ==============================================================================
 * FILE: frontend/src/components/layout/Footer.jsx
 * WHAT IT DOES: Enterprise Layout Footer Component:
 *               1. Monogram paperclip-K badge and "Klip." typography mark.
 *               2. Version release badge (v2.5.0 Enterprise).
 *               3. Dynamic copyright year and positioning statement.
 * WHERE IT IS CALLED FROM: components/layout/Main.jsx.
 * ==============================================================================
 */

import React from 'react'
import logoIcon from '../../images/logo-icon.png'

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
          <span className="font-mono text-xs text-muted ml-2">v2.5.0 Enterprise</span>
        </div>

        {/* Copyright notice */}
        <p className="font-sans text-xs text-muted">
          © {new Date().getFullYear()} Klip. Engineered for creative technologists. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
