'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface CinematicTransitionProps {
  isActive: boolean;
  onComplete: () => void;
}

export default function CinematicTransition({ isActive, onComplete }: CinematicTransitionProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const tunnelRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete,
      });

      // Reset states
      gsap.set(overlayRef.current, { display: 'flex', autoAlpha: 1 });

      // Portal expansion
      tl.fromTo(
        tunnelRef.current,
        { scale: 0, autoAlpha: 1 },
        { scale: 3, duration: 0.5, ease: 'power4.inOut' }
      );

      // Glow
      tl.fromTo(
        glowRef.current,
        { autoAlpha: 0, scale: 0.5 },
        { autoAlpha: 1, scale: 2, duration: 0.4, ease: 'power2.out' },
        '-=0.8'
      );

      // Travelling text
      tl.fromTo(
        textRef.current,
        { autoAlpha: 0, y: 20, scale: 0.9 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' },
        '-=0.6'
      );
      tl.to(textRef.current, { autoAlpha: 0, y: -20, duration: 0.4, ease: 'power2.in' }, '-=0.2');

      // Tunnel morphs to white light
      tl.to(tunnelRef.current, {
        scale: 4,
        autoAlpha: 0,
        duration: 0.4,
        ease: 'power2.in',
      }, '-=0.1');
    });

    return () => ctx.revert();
  }, [isActive, onComplete]);

  return (
    <div
      ref={overlayRef}
      className="portal-overlay"
      style={{ display: 'none' }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black" />

      {/* Portal tunnel */}
      <div
        ref={tunnelRef}
        className="absolute w-[60vmin] h-[60vmin] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(212,168,83,0.15) 30%, transparent 60%)',
          boxShadow: '0 0 100px rgba(212,168,83,0.2), 0 0 200px rgba(212,168,83,0.1)',
        }}
      />

      {/* Inner glow */}
      <div
        ref={glowRef}
        className="absolute w-[30vmin] h-[30vmin] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)',
        }}
      />

      {/* Travelling text */}
      <div
        ref={textRef}
        className="absolute text-center z-10"
      >
        <span className="text-sm md:text-base tracking-[0.3em] uppercase text-gold">
          Travelling through time...
        </span>
      </div>

      {/* Golden rings */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-amber-500/20"
          style={{
            width: `${40 + i * 20}vmin`,
            height: `${40 + i * 20}vmin`,
            animation: `portalRing ${1.5 + i * 0.3}s ease-out infinite`,
            opacity: 0.3 - i * 0.1,
          }}
        />
      ))}

      <style>{`
        @keyframes portalRing {
          0% { transform: scale(0.8); opacity: 0; }
          50% { opacity: 0.3; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
