import React from 'react'
import logoIcon from '../images/logo-icon.png'

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-border py-8 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg overflow-hidden bg-white shadow-xs ring-1 ring-black/5 flex items-center justify-center">
            <img src={logoIcon} alt="Klip" className="w-full h-full object-cover" />
          </div>
          <span className="font-serif text-xl tracking-tight text-ink font-semibold">
            Klip<span className="text-accent">.</span>
          </span>
          <span className="font-mono text-xs text-muted ml-2">v2.4.0 Engine</span>
        </div>

        <p className="font-sans text-xs text-muted">
          © {new Date().getFullYear()} Klip. Engineered for creative technologists. All rights reserved.
        </p>

        <div className="font-mono text-xs text-muted flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success"></span>
          <span>SYS.STATUS // NOMINAL</span>
        </div>
      </div>
    </footer>
  )
}
