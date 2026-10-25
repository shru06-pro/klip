import React from 'react'

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-border py-8 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center font-serif text-xs font-bold">
            K
          </div>
          <span className="font-script text-xl font-bold text-ink">Klip.</span>
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
