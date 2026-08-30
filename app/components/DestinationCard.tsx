'use client';

import { useRef, useCallback } from 'react';
import type { Place } from '@/data/places';

interface DestinationCardProps {
  place: Place;
  index: number;
  onNavigate: (slug: string) => void;
}

const LANDMARK_ICONS: Record<string, string> = {
  'minar': 'M12 2L2 22h20L12 2z',
  'badshahi': 'M4 4h16v16H4z',
  'lahore-fort': 'M2 22V8l10-6 10 6v14z',
  'iqbal-tomb': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
  'wazir-khan': 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  'sheesh-mahal': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  'library': 'M4 6h16v12H4z',
  'lahore-museum': 'M2 20V4l10-2 10 2v16l-10 2z',
  'jahangir-tomb': 'M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9z',
  'lahore-zoo': 'M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10',
  'shalimar': 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  'bagh-jinnah': 'M2 12h20M12 2v20',
};

const GRADIENT_OVERRIDES: Record<string, string> = {
  'minar': 'from-emerald-900/90 via-emerald-600/50 to-emerald-900/90',
  'badshahi': 'from-amber-900/90 via-amber-600/50 to-amber-900/90',
  'lahore-fort': 'from-stone-900/90 via-stone-600/50 to-stone-900/90',
  'iqbal-tomb': 'from-rose-900/90 via-red-600/50 to-rose-900/90',
  'wazir-khan': 'from-teal-900/90 via-emerald-600/50 to-teal-900/90',
  'sheesh-mahal': 'from-sky-900/90 via-indigo-600/50 to-sky-900/90',
  'library': 'from-blue-900/90 via-indigo-600/50 to-blue-900/90',
  'lahore-museum': 'from-amber-900/90 via-yellow-600/50 to-amber-900/90',
  'jahangir-tomb': 'from-stone-900/90 via-amber-600/50 to-stone-900/90',
  'lahore-zoo': 'from-green-900/90 via-emerald-600/50 to-green-900/90',
  'shalimar': 'from-teal-900/90 via-emerald-600/50 to-teal-900/90',
  'bagh-jinnah': 'from-lime-900/90 via-green-600/50 to-lime-900/90',
};

export default function DestinationCard({ place, index, onNavigate }: DestinationCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card || !glow) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    glow.style.setProperty('--mouse-x', `${x}px`);
    glow.style.setProperty('--mouse-y', `${y}px`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  }, []);

  const path = place.media[0]?.src || '';
  const iconPath = LANDMARK_ICONS[place.id] || 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

  return (
    <div
      ref={cardRef}
      className="destination-card group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onNavigate(place.slug)}
      style={{ transition: 'transform 0.15s ease-out' }}
    >
      {/* Glow effect */}
      <div ref={glowRef} className="card-glow" />

      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={path}
          alt={place.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading={index < 4 ? 'eager' : 'lazy'}
        />
      </div>

      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t ${GRADIENT_OVERRIDES[place.id] || place.gradient} transition-opacity duration-500`} />
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500" />

      {/* Shine sweep */}
      <div className="card-shine absolute inset-0" />

      {/* Content */}
      <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-between z-[3]">
        {/* Index number */}
        <div className="flex justify-between items-start">
          <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-white/40 font-mono">
            {(index + 1).toString().padStart(2, '0')}
          </span>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
            <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>

        {/* Bottom content */}
        <div className="transform transition-transform duration-500 group-hover:translate-y-[-4px]">
          {/* Landmark icon */}
          <svg className="w-6 h-6 md:w-7 md:h-7 mb-2 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d={iconPath} />
          </svg>

          <p className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-white/50 mb-1">
            {place.label}
          </p>
          <h3 className="text-lg md:text-xl font-bold text-white mb-1">
            {place.title}
          </h3>
          <p className="text-xs md:text-sm text-white/60 line-clamp-2 leading-relaxed">
            {place.description}
          </p>

          {/* Hover underline */}
          <div className="mt-3 h-px w-0 bg-gradient-to-r from-amber-400/60 to-transparent transition-all duration-500 group-hover:w-1/2" />
        </div>
      </div>
    </div>
  );
}
