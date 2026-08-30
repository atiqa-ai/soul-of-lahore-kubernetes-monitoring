'use client';

import { useState, useRef, useEffect, useCallback, CSSProperties } from 'react';
import { gsap } from 'gsap';
import type { MediaItem, CinematicZone } from '@/data/places';
import { ZONE_LABELS } from '@/data/places';

interface MediaGalleryProps {
  items: MediaItem[];
}

type TransitionType = 'zoomMorph' | 'blurShift' | 'rotateFlip' | 'scaleFade' | 'slideReveal' | 'morphCross';

const TRANSITIONS: TransitionType[] = ['zoomMorph', 'blurShift', 'rotateFlip', 'scaleFade', 'slideReveal', 'morphCross'];

export default function MediaGallery({ items }: MediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(-1);
  const [direction, setDirection] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const prevSlideRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const captionRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const zoneLabelRef = useRef<HTMLDivElement>(null);

  const activeItem = items[activeIndex];
  const itemCount = items.length;

  const goTo = useCallback((index: number) => {
    if (index === activeIndex) return;
    setDirection(index > activeIndex ? 1 : -1);
    setPrevIndex(activeIndex);
    setActiveIndex(index);
  }, [activeIndex]);

  const next = useCallback(() => {
    goTo((activeIndex + 1) % itemCount);
  }, [activeIndex, itemCount, goTo]);

  const prev = useCallback(() => {
    goTo((activeIndex - 1 + itemCount) % itemCount);
  }, [activeIndex, itemCount, goTo]);

  useEffect(() => {
    const container = containerRef.current;
    const activeSlide = slidesRef.current[activeIndex];
    const prevSlide = prevIndex >= 0 ? slidesRef.current[prevIndex] : null;
    const activeImg = imageRefs.current[activeIndex];
    if (!container || !activeSlide || !items.length) return;

    const transitionType = TRANSITIONS[Math.floor(Math.random() * TRANSITIONS.length)];

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.inOut' } });

      // Prev slide handling
      if (prevSlide && prevIndex >= 0) {
        tl.to(prevSlide, {
          autoAlpha: 0,
          scale: 0.9,
          filter: 'blur(6px)',
          duration: 0.35,
        }, 0);
      }

      // Active slide entrance with cinematic transition
      gsap.set(activeSlide, {
        display: 'flex',
        autoAlpha: 1,
        clearProps: 'transform',
      });

      switch (transitionType) {
        case 'zoomMorph':
          gsap.set(activeSlide, { scale: 1.15, filter: 'blur(8px)' });
          tl.to(activeSlide, {
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.5,
            ease: 'power3.out',
          }, 0.1);
          break;

        case 'blurShift':
          const shiftX = direction >= 0 ? 60 : -60;
          gsap.set(activeSlide, { x: shiftX, filter: 'blur(6px)' });
          tl.to(activeSlide, {
            x: 0,
            filter: 'blur(0px)',
            duration: 0.4,
            ease: 'power3.out',
          }, 0.1);
          break;

        case 'rotateFlip':
          gsap.set(activeSlide, {
            rotationY: direction >= 0 ? -35 : 35,
            scale: 0.85,
          });
          tl.to(activeSlide, {
            rotationY: 0,
            scale: 1,
            duration: 0.4,
            ease: 'power3.out',
            clearProps: 'rotationY',
          }, 0.1);
          break;

        case 'scaleFade':
          gsap.set(activeSlide, { scale: 0.6, autoAlpha: 0 });
          tl.to(activeSlide, {
            scale: 1,
            autoAlpha: 1,
            duration: 0.4,
            ease: 'back.out(1.4)',
          }, 0.1);
          break;

        case 'slideReveal':
          gsap.set(activeSlide, {
            clipPath: direction >= 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)',
          });
          tl.to(activeSlide, {
            clipPath: 'inset(0 0 0 0%)',
            duration: 0.5,
            ease: 'power4.inOut',
          }, 0.05);
          break;

        case 'morphCross':
          gsap.set(activeSlide, { scale: 0.95, autoAlpha: 0 });
          tl.to(prevSlide || activeSlide, { scale: 1.05, duration: 0.25 }, 0);
          tl.to(activeSlide, {
            scale: 1,
            autoAlpha: 1,
            duration: 0.4,
            ease: 'power2.out',
          }, 0.2);
          break;
      }

      // Ken Burns slow zoom on active image
      if (activeImg && items[activeIndex].type === 'image') {
        gsap.set(activeImg, { scale: 1 });
        tl.call(() => {
          gsap.to(activeImg, {
            scale: 1.06,
            duration: 2.5,
            ease: 'none',
            transformOrigin: 'center center',
          });
        }, [], '>-0.2');
      }

      // Caption animation
      if (captionRef.current) {
        gsap.set(captionRef.current, { autoAlpha: 0, y: 20, filter: 'blur(4px)' });
        tl.to(captionRef.current, {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.3,
          ease: 'power2.out',
        }, '-=0.5');
      }

      if (descRef.current) {
        gsap.set(descRef.current, { autoAlpha: 0, y: 15 });
        tl.to(descRef.current, {
          autoAlpha: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out',
        }, '-=0.3');
      }

      // Zone label animation
      if (zoneLabelRef.current && items[activeIndex].zone) {
        gsap.set(zoneLabelRef.current, { autoAlpha: 0, y: 10 });
        tl.to(zoneLabelRef.current, {
          autoAlpha: 1,
          y: 0,
          duration: 0.25,
          ease: 'power2.out',
        }, '-=0.6');
        tl.to(zoneLabelRef.current, {
          autoAlpha: 0,
          y: -5,
          duration: 0.4,
          ease: 'power2.in',
        }, '+=2.5');
      }
    }, container);

    return () => ctx.revert();
  }, [activeIndex, prevIndex, direction, items]);

  // Auto-advance with varied timing for organic feel
  useEffect(() => {
    if (!itemCount) return;
    const baseInterval = 4000;
    const variance = Math.random() * 2000 - 1000;
    const interval = baseInterval + variance;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [itemCount, next, activeIndex]);

  if (!itemCount) return null;

  return (
    <div ref={containerRef} className="relative w-full h-full perspective-1200">
      {/* Main slider area */}
      <div className="relative w-full h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden rounded-2xl cinematic-overlay">
        {items.map((item, i) => (
          <div
            key={item.id}
            ref={(el) => { slidesRef.current[i] = el; }}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              zIndex: i === activeIndex ? 10 : i === prevIndex ? 9 : 0,
              opacity: i === activeIndex || i === prevIndex ? 1 : 0,
              pointerEvents: i === activeIndex ? 'auto' : 'none',
              display: i === activeIndex || i === prevIndex ? 'flex' : 'none',
            }}
          >
            <div className="relative w-full h-full max-w-6xl max-h-full mx-4 md:mx-8 overflow-hidden shadow-2xl preserve-3d rounded-2xl">
              {item.type === 'image' ? (
                <div ref={(el) => { imageRefs.current[i] = el; }} className="w-full h-full">
                  <img
                    src={item.src}
                    alt={item.caption}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
              ) : (
                <video
                  src={item.src}
                  muted
                  loop
                  playsInline
                  autoPlay
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLVideoElement).style.display = 'none';
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              {item.type === 'image' && (
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent opacity-40" />
              )}
            </div>
          </div>
        ))}

        {/* Glow sweep overlay on active */}
        <div className="absolute inset-0 pointer-events-none z-5 overflow-hidden opacity-[0.03]">
          <div
            className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white to-transparent"
            style={{ animation: 'sweep 6s linear infinite' } as CSSProperties}
          />
        </div>

        {/* Navigation arrows */}
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          className="absolute left-4 md:left-8 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-white/10"
          aria-label="Previous"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="absolute right-4 md:right-8 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-white/10"
          aria-label="Next"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Zone label */}
      <div ref={zoneLabelRef} className="absolute top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        {activeItem.zone && (
          <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/80">
              {ZONE_LABELS[activeItem.zone]}
            </span>
          </div>
        )}
      </div>

      {/* Caption area */}
      <div key={activeIndex} className="relative px-4 md:px-8 -mt-1 z-20">
        <div className="max-w-4xl mx-auto">
          <div ref={captionRef} className="mb-2">
            <h3 className="text-xl md:text-2xl font-bold text-white">
              {activeItem.caption}
            </h3>
          </div>
          <div ref={descRef}>
            <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-2xl">
              {activeItem.description}
            </p>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 mt-5">
            {items.map((item, i) => (
              <button
                key={item.id}
                onClick={() => goTo(i)}
                className="relative h-1.5 rounded-full transition-all duration-500 overflow-hidden"
                style={{
                  width: i === activeIndex ? '2.5rem' : '0.75rem',
                  background: i === activeIndex ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.25)',
                }}
                aria-label={`Go to slide ${i + 1}`}
              >
                {i === activeIndex && (
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-amber-400 to-red-400 rounded-full origin-left"
                    style={{
                      animation: `progressBar ${6000 + Math.random() * 2000 - 1000}ms linear forwards`,
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes sweep {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @keyframes progressBar {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
