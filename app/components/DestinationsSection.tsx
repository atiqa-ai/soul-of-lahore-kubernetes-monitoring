'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { places } from '@/data/places';
import CinematicTransition from './CinematicTransition';
import PlaceLogo from './PlaceLogo';

gsap.registerPlugin(ScrollTrigger);

export default function DestinationsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNavigate = useCallback((slug: string) => {
    setNavigatingTo(slug);
  }, []);

  const handleTransitionComplete = useCallback(() => {
    if (navigatingTo) {
      window.location.href = '/places';
    }
  }, [navigatingTo]);

  // --- Drag logic ---
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let dragDistance = 0;
    let lastMoveX = 0;

    const onDown = (e: MouseEvent | TouchEvent) => {
      isDown = true;
      dragDistance = 0;
      const x = 'touches' in e ? e.touches[0].pageX : e.pageX;
      startX = x;
      lastMoveX = x;
      scrollLeft = track.scrollLeft;
      track.style.cursor = 'grabbing';
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = 'touches' in e ? e.touches[0].pageX : e.pageX;
      const delta = x - lastMoveX;
      lastMoveX = x;
      dragDistance += Math.abs(delta);
      track.scrollLeft -= delta;
    };

    const onUp = () => {
      isDown = false;
      track.style.cursor = 'grab';
    };

    const onUpClickCheck = (e: MouseEvent) => {
      if (dragDistance > 5) {
        e.stopPropagation();
      }
    };

    track.addEventListener('mousedown', onDown);
    track.addEventListener('mousemove', onMove);
    track.addEventListener('mouseup', onUp);
    track.addEventListener('mouseleave', onUp);
    track.addEventListener('touchstart', onDown, { passive: true });
    track.addEventListener('touchmove', onMove, { passive: false });
    track.addEventListener('touchend', onUp);

    // Update active index on scroll
    const onScroll = () => {
      const cards = track.querySelectorAll<HTMLElement>('.drag-card');
      const center = track.scrollLeft + track.offsetWidth / 2;
      let closest = 0;
      let closestDist = Infinity;
      cards.forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(cardCenter - center);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });
      setActiveIndex(closest);
    };

    track.addEventListener('scroll', onScroll);

    return () => {
      track.removeEventListener('mousedown', onDown);
      track.removeEventListener('mousemove', onMove);
      track.removeEventListener('mouseup', onUp);
      track.removeEventListener('mouseleave', onUp);
      track.removeEventListener('touchstart', onDown);
      track.removeEventListener('touchmove', onMove);
      track.removeEventListener('touchend', onUp);
      track.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        const titleLines = titleRef.current.querySelectorAll('.section-title-line');
        gsap.fromTo(
          titleLines,
          { autoAlpha: 0, y: 40, filter: 'blur(6px)' },
          {
            autoAlpha: 1, y: 0, filter: 'blur(0px)',
            duration: 0.6, stagger: 0.08, ease: 'power4.out',
            scrollTrigger: {
              trigger: titleRef.current,
              start: 'top 85%',
              end: 'top 35%',
              scrub: 0.5,
            },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <section
        id="destinations"
        ref={sectionRef}
        className="relative z-10 bg-black pb-20 md:pb-28 overflow-hidden"
      >
        {/* Background ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/3 rounded-full blur-[120px] pointer-events-none" />

        {/* Section header */}
        <div ref={titleRef} className="max-w-7xl mx-auto pt-16 md:pt-24 pb-10 md:pb-14 text-center px-4 md:px-8">
          <span className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-amber-500/60 mb-4 block">
            Discover Lahore
          </span>
          <h2 className="section-title-line text-3xl md:text-5xl lg:text-6xl font-bold mb-3">
            The <span className="text-gold">Landmarks</span>
          </h2>
          <div className="section-title-line divider-gold w-16 md:w-24 mx-auto my-4 md:my-5" />
          <p className="section-title-line text-sm md:text-base text-white/50 max-w-2xl mx-auto leading-relaxed">
            Twelve windows into the soul of a city that has lived for over a millennium.
            Each stone, each arch, each garden tells a story of empires, art, and faith.
          </p>
        </div>

        {/* Draggable carousel */}
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute top-0 left-0 w-16 md:w-32 h-full bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-16 md:w-32 h-full bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

          <div
            ref={trackRef}
            className="flex gap-4 md:gap-6 px-8 md:px-16 pb-4 overflow-x-auto cursor-grab select-none scroll-smooth"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {places.map((place, i) => (
              <div
                key={place.id}
                className="drag-card flex-shrink-0 group relative"
                style={{ width: '220px', minWidth: '220px' }}
                onClick={() => handleNavigate(place.slug)}
                onMouseDown={(e) => {
                  // Prevent click if dragged
                  const card = e.currentTarget;
                  const handler = (ev: MouseEvent) => {
                    card.removeEventListener('click', handler);
                  };
                  card.addEventListener('click', handler);
                }}
              >
                <div
                  className="relative w-full rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all duration-500 group-hover:border-amber-500/30 group-hover:bg-white/[0.04]"
                  style={{ height: '280px' }}
                >
                  {/* Background image */}
                  <div className="absolute inset-0">
                    <img
                      src={place.media[0]?.src || ''}
                      alt={place.title}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />

                  {/* Index badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold border border-white/10 bg-black/40 backdrop-blur-md text-white/60">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="absolute inset-0 p-4 flex flex-col justify-end z-[3]">
                    {/* Place Logo */}
                    <div className="mb-2 opacity-60 group-hover:opacity-90 transition-opacity duration-500">
                      <PlaceLogo placeId={place.id} size={40} animated={false} />
                    </div>
                    <p className="text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-white/40 mb-0.5">{place.label}</p>
                    <h3 className="text-base md:text-lg font-bold text-white mb-1 leading-tight">{place.title}</h3>
                    <p className="text-[10px] md:text-[11px] text-white/50 line-clamp-2 leading-relaxed">{place.description}</p>
                    <div className="mt-2 h-px w-0 bg-gradient-to-r from-amber-400/60 to-transparent transition-all duration-500 group-hover:w-full" />
                  </div>

                  {/* Hover arrow */}
                  <div className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                    <svg className="w-3.5 h-3.5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>

                {/* Active indicator ring */}
                {activeIndex === i && (
                  <div className="absolute -inset-1 rounded-[18px] border border-amber-500/30 pointer-events-none transition-opacity duration-300" />
                )}
              </div>
            ))}
          </div>

          {/* Scroll hint */}
          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] tracking-[0.3em] uppercase text-white/20">
            <svg className="w-3 h-3 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            Drag to explore
          </div>
        </div>

        {/* Pagination dots */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {places.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-500 ${i === activeIndex ? 'w-6 h-1.5 bg-amber-500/60' : 'w-1.5 h-1.5 bg-white/10'}`}
            />
          ))}
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      </section>

      <CinematicTransition
        isActive={navigatingTo !== null}
        onComplete={handleTransitionComplete}
      />
    </>
  );
}
