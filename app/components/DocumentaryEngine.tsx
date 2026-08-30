'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import type { MediaItem } from '@/data/places';
import { ZONE_LABELS } from '@/data/places';

interface DocumentaryEngineProps {
  items: MediaItem[];
}

type TransitionType = 'zoomMorph' | 'blurShift' | 'rotateFlip' | 'scaleFade' | 'slideReveal' | 'morphCross';

const TRANSITIONS: TransitionType[] = ['zoomMorph', 'blurShift', 'rotateFlip', 'scaleFade', 'slideReveal', 'morphCross'];

export default function DocumentaryEngine({ items }: DocumentaryEngineProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const chaosGlowRef = useRef<HTMLDivElement>(null);
  const count = items.length;
  const currentItem = items[currentIdx];
  const isVideo = currentItem.type === 'video';
  const focusDuration = isVideo ? 5 : 3;

  const advance = useCallback(() => {
    setPrevIdx(currentIdx);
    setCurrentIdx(prev => (prev + 1) % count);
  }, [count, currentIdx]);

  useEffect(() => {
    const container = containerRef.current;
    const stage = stageRef.current;
    const desc = descRef.current;
    const zone = zoneRef.current;
    const caption = captionRef.current;
    const progress = progressRef.current;
    const chaosGlow = chaosGlowRef.current;
    if (!container || !stage || !desc) return;

    const vid = videoRef.current;

    const nextIdx = (currentIdx + 1) % count;
    const nextItem = items[nextIdx];
    if (nextItem.type === 'image') {
      const preload = new Image();
      preload.src = nextItem.src;
    }

    const transitionType = TRANSITIONS[Math.floor(Math.random() * TRANSITIONS.length)];

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power4.inOut' },
        onComplete: () => { tl.kill(); advance(); },
      });

      gsap.set(stage, { autoAlpha: 0 });
      gsap.set(desc, { autoAlpha: 0, y: 30, filter: 'blur(6px)' });
      if (zone) gsap.set(zone, { autoAlpha: 0, y: -18 });
      if (caption) gsap.set(caption, { autoAlpha: 0, y: 15 });
      if (progress) gsap.set(progress, { scaleX: 0 });

      switch (transitionType) {
        case 'zoomMorph':
          gsap.set(stage, { scale: 1.3, filter: 'blur(12px)' });
          tl.to(stage, { scale: 1, filter: 'blur(0px)', autoAlpha: 1, duration: 1.0, ease: 'power4.out' });
          break;

        case 'blurShift':
          gsap.set(stage, { x: -80, filter: 'blur(8px)' });
          tl.to(stage, { x: 0, filter: 'blur(0px)', autoAlpha: 1, duration: 0.8, ease: 'power3.out' });
          break;

        case 'rotateFlip':
          gsap.set(container, { perspective: 1400 });
          gsap.set(stage, { rotationY: -35, scale: 0.85, transformOrigin: 'center center', backfaceVisibility: 'hidden' });
          tl.to(stage, { rotationY: 0, scale: 1, autoAlpha: 1, duration: 0.8, ease: 'power3.out', clearProps: 'rotationY' });
          break;

        case 'scaleFade':
          gsap.set(stage, { scale: 0.6, autoAlpha: 0 });
          tl.to(stage, { scale: 1, autoAlpha: 1, duration: 0.8, ease: 'back.out(1.7)' });
          break;

        case 'slideReveal':
          gsap.set(stage, { clipPath: 'inset(0 0 0 100%)', autoAlpha: 1 });
          tl.to(stage, { clipPath: 'inset(0 0 0 0%)', duration: 0.9, ease: 'power4.inOut' });
          break;

        case 'morphCross':
          gsap.set(stage, { scale: 0.92, autoAlpha: 0 });
          tl.to(stage, { scale: 1, autoAlpha: 1, duration: 0.8, ease: 'power2.out' });
          break;
      }

      if (isVideo && vid) {
        tl.call(() => { vid.currentTime = 0; vid.play().catch(() => {}); }, [], '-=0.3');
      }

      tl.to(desc, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out' }, '-=0.4');

      if (zone && currentItem.zone) {
        tl.to(zone, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.4');
      }

      if (caption && currentItem.caption) {
        tl.to(caption, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.3');
      }

      if (progress) {
        tl.to(progress, { scaleX: 1, duration: focusDuration, ease: 'none' }, '-=0.1');
      }

      if (!isVideo && imgRef.current) {
        tl.to(imgRef.current, { scale: 1.04, duration: focusDuration * 0.4, ease: 'none' }, '-=0.3');
      }

      if (chaosGlow) {
        tl.to(chaosGlow, {
          opacity: 0.15 + Math.random() * 0.1,
          duration: 0.3 + Math.random() * 0.2,
          ease: 'sine.inOut',
        }, '-=0.2');
        tl.to(chaosGlow, {
          opacity: 0.05 + Math.random() * 0.05,
          duration: 0.3 + Math.random() * 0.2,
          ease: 'sine.inOut',
        }, `-=${focusDuration * 0.3}`);
      }

      tl.to({}, { duration: Math.max(focusDuration - 1.0, 0) });

      if (isVideo && vid) {
        tl.call(() => { vid.pause(); }, []);
      }

      tl.to(desc, { autoAlpha: 0, y: -15, filter: 'blur(4px)', duration: 0.3, ease: 'power2.in' });

      if (zone) {
        tl.to(zone, { autoAlpha: 0, y: 8, duration: 0.25, ease: 'power2.in' }, '-=0.15');
      }

      if (caption) {
        tl.to(caption, { autoAlpha: 0, y: -10, duration: 0.2, ease: 'power2.in' }, '-=0.1');
      }

      const exitTransition = TRANSITIONS[Math.floor(Math.random() * TRANSITIONS.length)];
      switch (exitTransition) {
        case 'zoomMorph':
          tl.to(stage, { scale: 0.8, filter: 'blur(10px)', autoAlpha: 0, duration: 0.7, ease: 'power2.in' });
          break;
        case 'blurShift':
          tl.to(stage, { x: 80, filter: 'blur(10px)', autoAlpha: 0, duration: 0.6, ease: 'power2.in' });
          break;
        default:
          tl.to(stage, { scale: 0.75, filter: 'blur(12px)', autoAlpha: 0, duration: 0.7, ease: 'power2.in' });
          break;
      }

      tl.to({}, { duration: 0.1 });
    }, container);

    return () => {
      ctx.revert();
      if (isVideo && vid) { vid.pause(); vid.currentTime = 0; }
    };
  }, [currentIdx, currentItem, isVideo, advance, focusDuration, count, items]);

  return (
    <div ref={containerRef} className="absolute inset-0 bg-black overflow-hidden" style={{ perspective: '1400px' }}>

      <div
        ref={chaosGlowRef}
        className="absolute inset-0 pointer-events-none z-[5] opacity-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(212,168,83,0.08) 0%, transparent 60%)',
          mixBlendMode: 'overlay',
        }}
      />

      <div
        ref={stageRef}
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
      >
        {currentItem.type === 'image' ? (
          <img
            ref={imgRef}
            key={currentItem.id}
            src={currentItem.src}
            alt={currentItem.caption}
            className="absolute inset-0 w-full h-full select-none"
            style={{ objectFit: 'cover', backfaceVisibility: 'hidden' }}
            draggable={false}
          />
        ) : (
          <video
            ref={videoRef}
            key={currentItem.id}
            src={currentItem.src}
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full"
            style={{ objectFit: 'cover', backfaceVisibility: 'hidden' }}
          />
        )}
      </div>

      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0.55) 100%)',
      }} />

      <div className="absolute inset-0 pointer-events-none z-[4] mix-blend-overlay" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'1.2\' numOctaves=\'5\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.035\'/%3E%3C/svg%3E")',
        backgroundSize: '200px 200px',
        opacity: 0.5,
      }} />

      <div
        ref={zoneRef}
        className="absolute top-6 md:top-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
      >
        <div className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-lg shadow-amber-500/5">
          <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/70">
            {currentItem.zone ? ZONE_LABELS[currentItem.zone] : ''}
          </span>
        </div>
      </div>

      {currentItem.caption && (
        <div
          ref={captionRef}
          className="absolute top-20 md:top-24 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-center px-6 max-w-2xl w-full"
        >
          <h3 className="text-lg md:text-2xl font-bold text-white/90 tracking-wide">
            {currentItem.caption}
          </h3>
        </div>
      )}

      <div
        ref={descRef}
        className="absolute bottom-16 md:bottom-24 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-center px-8 max-w-3xl w-full"
      >
        <p className="text-sm md:text-base lg:text-lg text-white/85 leading-relaxed tracking-wide font-light max-w-2xl mx-auto [text-shadow:_0_2px_12px_rgba(0,0,0,0.5)]">
          {currentItem.description}
        </p>
      </div>

      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {items.map((_, i) => (
          <div
            key={i}
            className="relative h-1 rounded-full overflow-hidden"
            style={{
              width: i === currentIdx ? '2rem' : '0.5rem',
              background: i === currentIdx ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
            }}
          >
            {i === currentIdx && (
              <div
                ref={progressRef}
                className="absolute inset-0 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 rounded-full origin-left"
                style={{ transform: 'scaleX(0)' }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none z-[3]" />
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-[3]" />
    </div>
  );
}
