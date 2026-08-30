'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { places } from '@/data/places';
import PlaceLogo from './PlaceLogo';
import CinematicTransition from './CinematicTransition';

gsap.registerPlugin(ScrollTrigger);

export default function PlacesLogoGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  const handleNavigate = useCallback((slug: string) => {
    setNavigatingTo(slug);
  }, []);

  const handleTransitionComplete = useCallback(() => {
    if (navigatingTo) {
      window.location.href = `/place/${navigatingTo}`;
    }
  }, [navigatingTo]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const titleEl = titleRef.current;
      if (titleEl) {
        gsap.fromTo(titleEl, { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1, y: 0, duration: 1.5, ease: 'power3.out',
            scrollTrigger: { trigger: titleEl, start: 'top 85%', end: 'top 40%', scrub: 1.5 },
          });
      }

      const items = gridRef.current?.querySelectorAll('.logo-grid-item');
      if (items) {
        gsap.fromTo(items, { autoAlpha: 0, y: 40, scale: 0.9 },
          {
            autoAlpha: 1, y: 0, scale: 1, duration: 1.2, stagger: 0.08, ease: 'power3.out',
            scrollTrigger: { trigger: gridRef.current, start: 'top 80%', end: 'top 20%', scrub: 2 },
          });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        className="relative z-10 bg-black pb-20 md:pb-28 px-4 md:px-8 overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/3 rounded-full blur-[150px] pointer-events-none" />

        {/* Section header */}
        <div ref={titleRef} className="max-w-5xl mx-auto pt-16 md:pt-24 pb-10 md:pb-14 text-center">
          <span className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-amber-500/60 mb-4 block">
            The Cinematic Collection
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3">
            Twelve <span className="text-gold">Souls</span>
          </h2>
          <div className="divider-gold w-16 md:w-24 mx-auto my-4 md:my-5" />
          <p className="text-sm md:text-base text-white/50 max-w-2xl mx-auto leading-relaxed">
            Each landmark is a chapter in Lahore&apos;s story. Choose one to begin your journey.
          </p>
        </div>

        {/* Logo grid — all 12 places */}
        <div ref={gridRef} className="max-w-5xl mx-auto">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 md:gap-5">
            {places.map((place) => (
              <div
                key={place.id}
                className="logo-grid-item group cursor-pointer"
                onClick={() => handleNavigate(place.slug)}
              >
                <div className="relative aspect-square rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center justify-center gap-2 transition-all duration-700 hover:bg-white/[0.06] hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 group-hover:scale-105 overflow-hidden">
                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent" />
                  </div>

                  {/* Logo icon */}
                  <div className="relative z-10 transition-transform duration-700 group-hover:scale-110">
                    <PlaceLogo placeId={place.id} size={36} animated />
                  </div>

                  {/* Label */}
                  <span className="relative z-10 text-[8px] md:text-[9px] tracking-[0.1em] uppercase text-white/40 group-hover:text-amber-400/70 transition-colors duration-500 text-center leading-tight px-1">
                    {place.title}
                  </span>

                  {/* Index */}
                  <span className="absolute top-2 right-2 text-[7px] font-mono text-white/15 group-hover:text-amber-500/30 transition-colors duration-500">
                    {(places.indexOf(place) + 1).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom hint */}
        <div className="text-center mt-10 md:mt-12">
          <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/20">
            Or scroll down to explore detailed destinations
          </p>
          <div className="flex justify-center mt-3 gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-amber-500/30"
                style={{ animation: `glow-pulse ${1.5 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.4}s` }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Cinematic transition */}
      <CinematicTransition
        isActive={navigatingTo !== null}
        onComplete={handleTransitionComplete}
      />
    </>
  );
}
