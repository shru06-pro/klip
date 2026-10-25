/**
 * ==============================================================================
 * FILE: frontend/src/components/features/bento/BentoFeatures.jsx
 * WHAT IT DOES: 3-column feature suite component showcasing edge features.
 * WHERE IT IS CALLED FROM: components/layout/Main.jsx.
 * ==============================================================================
 */

import React from 'react'

export default function BentoFeatures() {
  return (
    <section className="max-w-5xl mx-auto px-4 mb-20" id="engine">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            {'// ENGINE SUITE'}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal tracking-tight mt-1">
            Engineered for Editorial Velocity
          </h2>
        </div>
        <p className="font-sans text-sm text-muted max-w-sm">
          Precision edge routing without surveillance scripts or redirect bloat. Pure typographic clarity for your links.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Bento Card 1: Universal Deep Links */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-border shadow-[0_4px_20px_-4px_rgba(39,39,42,0.04)] flex flex-col justify-between hover:-translate-y-0.5 transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-accent-tint text-accent flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">alt_route</span>
            </div>
            <h3 className="font-sans font-medium text-lg text-ink">
              Universal Deep Links
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Bypass internal social in-app webviews seamlessly. Direct fans straight into native Spotify, iOS, or YouTube targets.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-border/70 flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-canvas text-ink font-mono text-xs border border-border">
              iOS
            </span>
            <span className="px-2.5 py-1 rounded-full bg-canvas text-ink font-mono text-xs border border-border">
              Android
            </span>
            <span className="px-2.5 py-1 rounded-full bg-canvas text-ink font-mono text-xs border border-border">
              PWA
            </span>
          </div>
        </div>

        {/* Bento Card 2: UTM Studio Presets */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-border shadow-[0_4px_20px_-4px_rgba(39,39,42,0.04)] flex flex-col justify-between hover:-translate-y-0.5 transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-accent-tint text-accent flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">tune</span>
            </div>
            <h3 className="font-sans font-medium text-lg text-ink">
              UTM Studio Presets
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Inject editorial campaign attribution taxonomy cleanly at the edge with zero tracking cookies or client-side JavaScript lag.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-border/70 flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-canvas text-muted font-mono text-[11px] border border-border">
              #Substack
            </span>
            <span className="px-2.5 py-1 rounded-full bg-canvas text-muted font-mono text-[11px] border border-border">
              #InstagramBio
            </span>
            <span className="px-2.5 py-1 rounded-full bg-canvas text-muted font-mono text-[11px] border border-border">
              #TikTok
            </span>
          </div>
        </div>

        {/* Bento Card 3: Edge Telemetry */}
        <div
          className="bg-white rounded-2xl p-5 sm:p-6 border border-border shadow-[0_4px_20px_-4px_rgba(39,39,42,0.04)] flex flex-col justify-between hover:-translate-y-0.5 transition-all sm:col-span-2 lg:col-span-1"
          id="analytics"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-accent-tint text-accent flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">insights</span>
            </div>
            <h3 className="font-sans font-medium text-lg text-ink">
              Edge Telemetry
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Live click velocity aggregated at 285 CDN edge locations worldwide with ultra-low latency redirection under 40ms.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-border/70 flex items-center justify-between">
            <div>
              <div className="font-mono text-[11px] text-muted uppercase">Global Rate</div>
              <div className="font-mono text-sm text-accent font-medium">+1,420 hits / hr</div>
            </div>
            <svg className="w-20 h-6 text-accent" fill="none" viewBox="0 0 100 30">
              <path
                d="M0 25 L15 22 L30 26 L45 15 L60 18 L75 8 L90 12 L100 4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
