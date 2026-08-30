'use client';

import { useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { places } from '@/data/places';
import SoulOfLahoreLogo from '@/app/components/SoulOfLahoreLogo';
import PlaceLogo from '@/app/components/PlaceLogo';
import CinematicTransition from '@/app/components/CinematicTransition';

const PlacesScene = dynamic(() => import('@/app/components/PlacesScene'), { ssr: false });

export default function PlacesPage() {
  const router = useRouter();
  const titleRef = useRef<HTMLDivElement>(null);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigate = useCallback((slug: string) => {
    setNavigatingTo(slug);
  }, []);

  const handleTransitionComplete = useCallback(() => {
    if (navigatingTo) {
      window.location.href = `/place/${navigatingTo}`;
    }
  }, [navigatingTo]);

  return (
    <>
      <section
        className="relative w-full h-screen bg-black overflow-hidden"
        style={{ height: '100dvh' }}
      >
        <PlacesScene onNavigate={handleNavigate} onHover={setHoveredSlug} />

        <div className="absolute inset-0 pointer-events-none z-[2]">
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0.8) 100%)',
          }} />
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Hamburger menu — top right */}
        <div className="absolute top-0 right-0 z-10 px-4 md:px-8 py-4">
          <button onClick={() => setMenuOpen(true)} className="pointer-events-auto flex flex-col gap-1.5 p-2 group" aria-label="Open menu">
            <span className="block w-6 h-px bg-white/50 group-hover:bg-white transition-colors" />
            <span className="block w-4 h-px bg-white/50 group-hover:bg-white transition-colors" />
            <span className="block w-5 h-px bg-white/50 group-hover:bg-white transition-colors" />
          </button>
        </div>

        {/* Home button — bottom left */}
        <div className="absolute bottom-8 left-8 z-10">
          <Link href="/" className="pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300 group">
            <svg className="w-4 h-4 text-white/50 transition-transform group-hover:-translate-x-1 group-hover:text-amber-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            <div className="w-5 h-5">
              <SoulOfLahoreLogo size={20} variant="navbar" />
            </div>
            <span className="text-xs tracking-[0.3em] uppercase text-white/50 group-hover:text-white/80 transition-colors">
              Home
            </span>
          </Link>
        </div>

        <div ref={titleRef} className="absolute inset-0 flex flex-col items-center justify-center z-[3] pointer-events-none px-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40" />
              <div className="h-px w-8 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
            </div>
            <h2 className="page-title-line text-4xl md:text-6xl lg:text-7xl font-bold mb-3 leading-none">
              Twelve <span className="text-gold">Souls</span>
            </h2>
            <div className="page-title-line divider-gold w-16 md:w-24 mx-auto my-4 md:my-5" />
            <p className="page-title-line text-sm md:text-base text-white/50 max-w-2xl mx-auto leading-relaxed px-4">
              Each frame holds a story spanning centuries. Touch one and step into another time.
            </p>
          </div>
        </div>

        {hoveredSlug && (
          <div className="fixed bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-all duration-500">
            <div className="px-5 py-2.5 rounded-full bg-black/60 backdrop-blur-xl border border-amber-500/20 shadow-lg shadow-amber-500/5">
              <span className="text-xs tracking-[0.3em] uppercase text-amber-400/80">
                {places.find(p => p.slug === hoveredSlug)?.title || ''}
              </span>
            </div>
          </div>
        )}

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
          <p className="text-[9px] tracking-[0.3em] uppercase text-white/20">
            Click to enter
          </p>
        </div>
      </section>

      {/* Side menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md" onClick={() => setMenuOpen(false)} />
      )}

      {/* Side menu panel */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm z-50 bg-neutral-950/95 backdrop-blur-2xl border-l border-white/5 overflow-y-auto transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-[10px] tracking-[0.4em] uppercase text-amber-500/50">Landmarks</span>
              <p className="text-xs text-white/20 mt-1">12 Souls of Lahore</p>
            </div>
            <button onClick={() => setMenuOpen(false)} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/15 transition-all border border-white/5" aria-label="Close menu">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-0.5">
            {places.map((place, i) => (
              <Link
                key={place.id}
                href={`/place/${place.slug}`}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.03] hover:pl-4 transition-all duration-300"
              >
                <div className="w-6 h-6 flex-shrink-0">
                  <PlaceLogo placeId={place.id} size={20} animated={false} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-medium truncate">{place.title}</span>
                  <span className="block text-[9px] tracking-[0.15em] uppercase text-white/30 truncate">{place.subtitle}</span>
                </div>
                <span className="text-[9px] font-mono text-white/20">{String(i + 1).padStart(2, '0')}</span>
              </Link>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <Link href="/" onClick={() => setMenuOpen(false)} className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-amber-400/50 hover:text-amber-300 transition-colors">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <CinematicTransition
        isActive={navigatingTo !== null}
        onComplete={handleTransitionComplete}
      />
    </>
  );
}
