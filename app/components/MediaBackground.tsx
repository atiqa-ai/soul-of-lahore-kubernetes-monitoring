'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';

export interface MediaItem {
  type: 'image' | 'video';
  src: string;
}

interface MediaBackgroundProps {
  items: MediaItem[];
  imageInterval?: number;
  className?: string;
}

type TransitionType = 'zoomMorph' | 'blurShift' | 'rotateFlip' | 'scaleFade' | 'slideReveal';

const TRANSITIONS: TransitionType[] = ['zoomMorph', 'blurShift', 'rotateFlip', 'scaleFade', 'slideReveal'];

export default function MediaBackground({ items = [], imageInterval = 5000, className = '' }: MediaBackgroundProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(-1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const transitionRef = useRef<TransitionType>('zoomMorph');

  const advance = useCallback(() => {
    setPrevIndex(activeIndex);
    setActiveIndex(i => (i + 1) % items.length);
  }, [activeIndex, items.length]);

  // Apply cinematic transition between slides
  useEffect(() => {
    if (prevIndex < 0 || !prevRef.current || !activeRef.current || !containerRef.current) return;

    const prev = prevRef.current;
    const active = activeRef.current;
    const container = containerRef.current;

    // Pick a random cinematic transition type
    transitionRef.current = TRANSITIONS[Math.floor(Math.random() * TRANSITIONS.length)];

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power4.inOut' },
        onComplete: () => {
          gsap.set(prev, { clearProps: 'all' });
        },
      });

      switch (transitionRef.current) {
        case 'zoomMorph':
          // Current zooms out + blurs, next zooms in from deep
          tl.fromTo(active, { scale: 1.3, filter: 'blur(12px)', autoAlpha: 0 }, { scale: 1, filter: 'blur(0px)', autoAlpha: 1, duration: 0.6 }, 0);
          tl.to(prev, { scale: 0.85, filter: 'blur(8px)', autoAlpha: 0, duration: 0.5 }, 0);
          gsap.fromTo(active.querySelector('.ken-burns-layer'), { scale: 1.15 }, { scale: 1, duration: 2.5, ease: 'none' });
          break;

        case 'blurShift':
          // Current blurs and shifts right, next unblurs from left
          gsap.set(active, { x: -80, filter: 'blur(6px)', autoAlpha: 0 });
          tl.to(prev, { x: 80, filter: 'blur(10px)', autoAlpha: 0, duration: 0.4 }, 0);
          tl.to(active, { x: 0, filter: 'blur(0px)', autoAlpha: 1, duration: 0.5 }, 0.1);
          break;

        case 'rotateFlip':
          // 3D card flip
          gsap.set(container, { perspective: 1200 });
          gsap.set(prev, { rotationY: 0, autoAlpha: 1, transformOrigin: 'center center', backfaceVisibility: 'hidden' });
          gsap.set(active, { rotationY: -90, autoAlpha: 1, transformOrigin: 'center center', backfaceVisibility: 'hidden' });
          tl.to(prev, { rotationY: 90, autoAlpha: 0, duration: 0.35 }, 0);
          tl.to(active, { rotationY: 0, duration: 0.35, ease: 'power3.out' }, 0.15);
          break;

        case 'scaleFade':
          // Current scales down + fades, next scales up from small
          gsap.set(active, { scale: 0.7, autoAlpha: 0 });
          tl.to(prev, { scale: 1.1, autoAlpha: 0, duration: 0.4 }, 0);
          tl.to(active, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'power3.out' }, 0.1);
          break;

        case 'slideReveal':
          // Mask/slide reveal with clip
          gsap.set(active, { clipPath: 'inset(0 0 0 100%)', autoAlpha: 1 });
          tl.to(prev, { autoAlpha: 0, duration: 0.3 }, 0);
          tl.to(active, { clipPath: 'inset(0 0 0 0%)', duration: 0.6, ease: 'power4.inOut' }, 0.1);
          break;
      }
    }, container);

    return () => ctx.revert();
  }, [activeIndex, prevIndex]);

  // Auto-advance timer
  useEffect(() => {
    const item = items[activeIndex];
    if (!item) return;

    if (item.type === 'video') {
      const vid = videoRef.current;
      if (vid) {
        vid.currentTime = 0;
        vid.play().catch(() => {});
      }
    } else {
      const timer = setTimeout(advance, imageInterval);
      return () => clearTimeout(timer);
    }
  }, [activeIndex, items, imageInterval, advance]);

  if (items.length === 0) return null;

  return (
    <div ref={containerRef} className={`absolute inset-0 w-full h-full overflow-hidden cinematic-overlay ${className}`}>
      {items.map((item, i) => {
        const isActive = i === activeIndex;
        const isPrev = i === prevIndex;
        const isImage = item.type === 'image';

        return (
          <div
            key={`${item.type}-${i}`}
            ref={(el) => {
              if (isActive) activeRef.current = el;
              if (isPrev) prevRef.current = el;
            }}
            className="absolute inset-0 w-full h-full preserve-3d"
            style={{
              zIndex: isActive ? 2 : isPrev ? 1 : 0,
              opacity: isActive || isPrev ? 1 : 0,
              pointerEvents: isActive ? 'auto' : 'none',
            }}
          >
            {isImage ? (
              <>
                <div className="ken-burns-layer absolute inset-0 w-full h-full">
                  <img src={item.src} alt="" className="w-full h-full object-cover" draggable={false} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-[1]" />
              </>
            ) : (
              <>
                <video
                  ref={isActive ? videoRef : undefined}
                  src={item.src}
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  onEnded={advance}
                  onError={advance}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-[1]" />
              </>
            )}
          </div>
        );
      })}

      {/* Cinematic progress bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 h-1 bg-white/10">
        <div
          key={activeIndex}
          className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 origin-left"
          style={{
            animation: items[activeIndex]?.type === 'video' ? 'none' : `growWidth ${imageInterval}ms linear forwards`,
          }}
        />
      </div>

      <style>{`
        @keyframes growWidth {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
