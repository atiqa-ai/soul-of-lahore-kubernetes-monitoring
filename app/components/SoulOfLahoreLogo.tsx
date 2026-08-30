'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface SoulOfLahoreLogoProps {
  size?: number;
  variant?: 'hero' | 'navbar' | 'footer';
  className?: string;
}

export default function SoulOfLahoreLogo({ size = 80, variant = 'hero', className = '' }: SoulOfLahoreLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || variant !== 'hero') return;

    const svg = container.querySelector('svg');
    const dome = container.querySelector('.logo-dome');
    const arch = container.querySelector('.logo-arch');
    const minaretL = container.querySelector('.logo-minaret-l');
    const minaretR = container.querySelector('.logo-minaret-r');
    const star = container.querySelector('.logo-star');
    const base = container.querySelector('.logo-base');
    const ring = container.querySelector('.logo-ring');
    const glow = glowRef.current;
    const particles = particlesRef.current;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      gsap.set([svg, glow, particles], { autoAlpha: 0 });

      tl.to(glow, { autoAlpha: 1, duration: 0.6, ease: 'power3.out' });

      tl.fromTo(svg, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)' }, '-=0.4');

      if (dome) tl.fromTo(dome, { autoAlpha: 0, y: -20 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'back.out(1.4)' }, '-=0.4');
      if (minaretL) tl.fromTo(minaretL, { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: 0.4, ease: 'power3.out' }, '-=0.3');
      if (minaretR) tl.fromTo(minaretR, { autoAlpha: 0, x: 20 }, { autoAlpha: 1, x: 0, duration: 0.4, ease: 'power3.out' }, '-=0.3');
      if (arch) tl.fromTo(arch, { autoAlpha: 0, scaleY: 0.7, transformOrigin: 'bottom center' }, { autoAlpha: 1, scaleY: 1, duration: 0.5, ease: 'back.out(1.4)' }, '-=0.3');
      if (base) tl.fromTo(base, { autoAlpha: 0, scaleX: 0 }, { autoAlpha: 1, scaleX: 1, duration: 0.4, ease: 'power3.out' }, '-=0.2');
      if (star) tl.fromTo(star, { autoAlpha: 0, scale: 0, rotate: -90 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' }, '-=0.15');
      if (ring) tl.fromTo(ring, { autoAlpha: 0, scale: 1.3, rotate: -30 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3');

      tl.to(particles, { autoAlpha: 1, duration: 0.3 }, '-=0.15');

      gsap.to(dome || svg, {
        y: -4,
        duration: 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      if (glow) {
        gsap.to(glow, {
          opacity: 0.6,
          duration: 1.2,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        });
      }
    }, container);

    return () => ctx.revert();
  }, [variant]);

  const s = size;

  return (
    <div ref={containerRef} className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Ambient glow behind logo */}
      {variant === 'hero' && (
        <div
          ref={glowRef}
          className="absolute rounded-full"
          style={{
            width: s * 2.5,
            height: s * 2.5,
            background: 'radial-gradient(circle, rgba(212,168,83,0.2) 0%, rgba(212,168,83,0.05) 40%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
      )}

      {/* Main SVG logo */}
      <svg
        width={s}
        height={s}
        viewBox="0 0 100 100"
        fill="none"
        className="relative z-10"
        style={{ filter: variant === 'hero' ? 'drop-shadow(0 0 30px rgba(212,168,83,0.3))' : 'none' }}
      >
        <defs>
          <linearGradient id="logoGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B8860B" />
            <stop offset="30%" stopColor="#D4A853" />
            <stop offset="60%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#D4A853" />
          </linearGradient>
          <linearGradient id="logoGoldLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4A853" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#FFD700" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#D4A853" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="logoDome" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
        </defs>

        {/* Outer ornate ring border */}
        <circle
          className="logo-ring"
          cx="50" cy="50" r="47"
          stroke="url(#logoGoldLight)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.8"
        />
        <circle
          cx="50" cy="50" r="43"
          stroke="url(#logoGoldLight)"
          strokeWidth="0.5"
          fill="none"
          opacity="0.4"
          strokeDasharray="4 4"
        />

        {/* Left minaret */}
        <g className="logo-minaret-l">
          <rect x="14" y="28" width="4" height="52" rx="1.5" fill="url(#logoGold)" opacity="0.85" />
          <rect x="12" y="24" width="8" height="6" rx="1" fill="url(#logoGold)" opacity="0.7" />
          <circle cx="16" cy="20" r="2.5" fill="#FFD700" opacity="0.9" />
          <line x1="16" y1="20" x2="16" y2="16" stroke="#D4A853" strokeWidth="1" />
        </g>

        {/* Right minaret */}
        <g className="logo-minaret-r">
          <rect x="82" y="28" width="4" height="52" rx="1.5" fill="url(#logoGold)" opacity="0.85" />
          <rect x="80" y="24" width="8" height="6" rx="1" fill="url(#logoGold)" opacity="0.7" />
          <circle cx="84" cy="20" r="2.5" fill="#FFD700" opacity="0.9" />
          <line x1="84" y1="20" x2="84" y2="16" stroke="#D4A853" strokeWidth="1" />
        </g>

        {/* Main dome */}
        <path
          className="logo-dome"
          d="M50 8 C38 8 28 16 26 26 L74 26 C72 16 62 8 50 8Z"
          fill="url(#logoDome)"
          opacity="0.95"
        />
        {/* Dome spire */}
        <line x1="50" y1="8" x2="50" y2="2" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
        <circle cx="50" cy="2" r="2.5" fill="#FFD700" />

        {/* Arch iwan */}
        <path
          className="logo-arch"
          d="M32 80 L32 48 C32 36 40 30 50 30 C60 30 68 36 68 48 L68 80"
          stroke="url(#logoGold)"
          strokeWidth="2"
          fill="none"
        />
        {/* Inner arch */}
        <path
          d="M38 80 L38 52 C38 42 44 38 50 38 C56 38 62 42 62 52 L62 80"
          stroke="url(#logoGoldLight)"
          strokeWidth="1"
          fill="none"
          opacity="0.6"
        />

        {/* Base platform */}
        <rect className="logo-base" x="20" y="78" width="60" height="4" rx="2" fill="url(#logoGold)" opacity="0.7" />

        {/* Star of Lahore */}
        <polygon
          className="logo-star"
          points="50,60 53,67 62,68 55,74 58,84 50,78 42,84 45,74 38,68 47,67"
          fill="url(#logoGold)"
          opacity="0.5"
        />

        {/* Central gem */}
        <circle cx="50" cy="78" r="3" fill="#FFD700" opacity="0.8" />

        {/* Decorative dots on arch */}
        <circle cx="44" cy="44" r="1" fill="#FFD700" opacity="0.4" />
        <circle cx="50" cy="42" r="1.2" fill="#FFD700" opacity="0.5" />
        <circle cx="56" cy="44" r="1" fill="#FFD700" opacity="0.4" />
      </svg>

      {/* Floating golden particles around logo */}
      {variant === 'hero' && (
        <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 2 + Math.random() * 2,
                height: 2 + Math.random() * 2,
                background: '#FFD700',
                left: `${30 + Math.random() * 40}%`,
                top: `${20 + Math.random() * 60}%`,
                boxShadow: '0 0 4px rgba(255,215,0,0.6)',
                animation: `particleFloat${i} ${5 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: 0.3 + Math.random() * 0.4,
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        ${variant === 'hero' ? [...Array(6)].map((_, i) => `
          @keyframes particleFloat${i} {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0; }
            10% { opacity: ${0.4 + i * 0.06}; }
            50% { transform: translate(${(i % 2 === 0 ? '' : '-') + (5 + i * 2)}px, ${-(8 + i * 3)}px) scale(1.2); opacity: ${0.5 + i * 0.04}; }
            90% { opacity: ${0.2 + i * 0.04}; }
          }
        `).join('\n') : ''}
      `}</style>
    </div>
  );
}
