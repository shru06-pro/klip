import React from 'react'

export default function Hero() {
  return (
    <section className="relative pt-8 sm:pt-12 pb-6 px-4 max-w-4xl mx-auto text-center">
      {/* Decorative Sparkles */}
      <div
        aria-hidden="true"
        className="absolute top-6 left-6 sm:left-12 text-accent-soft animate-twinkle-1 hidden sm:block pointer-events-none"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z"></path>
        </svg>
      </div>

      <div
        aria-hidden="true"
        className="absolute top-12 right-8 sm:right-16 text-accent animate-float-1 hidden sm:block pointer-events-none"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0L13.8 8.2L22 10.5L14.5 13.5L12 22L9.5 13.5L2 10.5L10.2 8.2L12 0Z"></path>
        </svg>
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-2 left-1/4 text-accent-soft/80 animate-twinkle-2 hidden md:block pointer-events-none"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z"></path>
        </svg>
      </div>

      {/* Huge Serif Signature Headline */}
      <h1 className="font-serif text-[clamp(2.75rem,7vw,5.25rem)] leading-[0.96] tracking-[-0.025em] text-ink font-normal mb-5 max-w-3xl mx-auto">
        Make long links <span className="italic text-accent">tiny</span> and shareable
        <span className="text-accent">.</span>
      </h1>

      <p className="font-sans text-base sm:text-lg text-muted max-w-xl mx-auto leading-relaxed">
        The neo-minimalist link shortener crafted for independent creators, studios, and editorial curators. Clean, edge-routed, zero noise.
      </p>
    </section>
  )
}