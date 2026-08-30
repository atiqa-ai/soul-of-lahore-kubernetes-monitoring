'use client';

import { useState } from 'react';

interface PlaceLogoProps {
  placeId: string;
  size?: number;
  className?: string;
  animated?: boolean;
}

const PLACE_IMAGES: Record<string, string> = {
  'badshahi': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Badshahi_Mosque_%2C_Lahore.jpg?width=400',
  'minar': 'https://upload.wikimedia.org/wikipedia/commons/9/93/Minar-e-Pakistan%28Lahore%29.jpg?width=400',
  'lahore-fort': 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Shahi_Qila_-_The_Lahore_Fort.jpg?width=400',
  'iqbal-tomb': 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Grave_of_Muhammad_Iqbal.jpg?width=400',
  'wazir-khan': 'https://upload.wikimedia.org/wikipedia/commons/6/61/Wazir_Mosque%2C_Lahore.jpg?width=400',
  'sheesh-mahal': 'https://upload.wikimedia.org/wikipedia/commons/8/89/Sheesh_Mahal_in_Lahore_Fort.jpg?width=400',
  'quaid-e-azam-library': 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Montgomery_Hall_%28Quaid-e-Azam_Library%29_on_a_pleasant_day.jpg?width=400',
  'library': 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Montgomery_Hall_%28Quaid-e-Azam_Library%29_on_a_pleasant_day.jpg?width=400',
  'lahore-museum': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/The_Lahore_Museum.jpg?width=400',
  'tomb-of-jahangir': 'https://upload.wikimedia.org/wikipedia/commons/4/43/Tomb_of_Jahangir_and_gardens.jpg?width=400',
  'jahangir-tomb': 'https://upload.wikimedia.org/wikipedia/commons/4/43/Tomb_of_Jahangir_and_gardens.jpg?width=400',
  'lahore-zoo': 'https://upload.wikimedia.org/wikipedia/commons/2/24/Lahore_Zoo1.jpg?width=400',
  'shalimar': 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Shalimar_Gardens_%28Lahore%29.jpg?width=400',
  'bagh-jinnah': 'https://upload.wikimedia.org/wikipedia/commons/5/58/Bagh-e-Jinnah_Lahore_Pakistan.jpg?width=400',
};

export default function PlaceLogo({ placeId, size = 48, className = '', animated = true }: PlaceLogoProps) {
  const [error, setError] = useState(false);
  const src = PLACE_IMAGES[placeId];

  if (!src || error) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
        <circle cx="24" cy="24" r="20" stroke="#D4A853" strokeWidth="1.5" fill="none" opacity="0.5" />
        <circle cx="24" cy="24" r="8" stroke="#D4A853" strokeWidth="1" fill="none" opacity="0.3" />
        <circle cx="24" cy="24" r="2" fill="#D4A853" opacity="0.4" />
      </svg>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: '2px solid rgba(212, 168, 83, 0.3)',
        boxShadow: '0 0 10px rgba(212, 168, 83, 0.15)',
      }}
    >
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        onError={() => setError(true)}
      />
      {animated && (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: '2px solid rgba(255, 215, 0, 0.4)',
            animation: 'glowPulse 3s ease-in-out infinite',
          }}
        />
      )}
    </div>
  );
}
