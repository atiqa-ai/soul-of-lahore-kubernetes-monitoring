'use client';

import dynamic from 'next/dynamic';
import SoulOfLahoreLogo from './components/SoulOfLahoreLogo';

const HeroSection = dynamic(() => import('./components/HeroSection'), { ssr: false });
const DestinationsSection = dynamic(() => import('./components/DestinationsSection'), { ssr: false });

export default function Home() {
  return (
    <main className="relative bg-black">
      <HeroSection />
      <DestinationsSection />
      <footer className="relative z-10 bg-black/90 border-t border-white/5 py-12 md:py-16 text-center px-4">
        <div className="max-w-2xl mx-auto">
          <SoulOfLahoreLogo size={40} variant="footer" className="mx-auto mb-5" />
          <div className="divider-gold w-12 mx-auto mb-4" />
          <p className="text-xs tracking-[0.3em] uppercase text-white/30 mb-3">
            Soul of Lahore &mdash; A Cinematic Journey Through Time
          </p>
          <p className="text-[10px] tracking-[0.2em] uppercase text-white/15">
            Every Brick Tells A Story.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-[9px] tracking-[0.2em] uppercase text-white/10">
            <span>12 Landmarks</span>
            <span className="w-px h-3 bg-white/10" />
            <span>7 Cinematic Zones Each</span>
            <span className="w-px h-3 bg-white/10" />
            <span>84 Stories</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
