/**
 * ==============================================================================
 * FILE: frontend/src/components/features/hero/Hero.jsx
 * WHAT IT DOES: Renders the editorial hero section of the Klip. web application.
 *               Features fluid Instrument Serif typography, decorative twinkling SVGs,
 *               and introductory subtitle describing the product value proposition.
 * WHERE IT IS CALLED FROM: components/layout/Main.jsx.
 * ==============================================================================
 */

import React from 'react'

export default function Hero() {
  return (
    <section className="relative pt-4 sm:pt-10 pb-2 sm:pb-6 px-4 max-w-4xl mx-auto text-center">
      {/* Decorative Twinkling Sparkle 1 */}
      <div
        aria-hidden="true"
        className="absolute top-6 left-6 sm:left-12 text-accent-soft animate-twinkle-1 hidden sm:block pointer-events-none"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z"></path>
        </svg>
      </div>

      {/* Decorative Floating Sparkle 2 */}
      <div
        aria-hidden="true"
        className="absolute top-12 right-8 sm:right-16 text-accent animate-float-1 hidden sm:block pointer-events-none"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0L13.8 8.2L22 10.5L14.5 13.5L12 22L9.5 13.5L2 10.5L10.2 8.2L12 0Z"></path>
        </svg>
      </div>

      {/* Signature Fluid Serif Headline */}
      <h1 className="font-serif text-[clamp(2rem,6.8vw,5.25rem)] leading-[1.02] sm:leading-[0.96] tracking-tight text-ink font-normal mb-3 sm:mb-5 max-w-3xl mx-auto">
        Make long links <span className="italic text-accent">tiny</span> and shareable
        <span className="text-accent">.</span>
      </h1>

      {/* Subtitle Description */}
      <p className="font-sans text-xs sm:text-base md:text-lg text-muted max-w-md sm:max-w-xl mx-auto leading-relaxed px-1">
        The neo-minimalist link shortener crafted for independent creators, studios, and editorial curators. Clean, edge-routed, zero noise.
      </p>
    </section>
  )
}
