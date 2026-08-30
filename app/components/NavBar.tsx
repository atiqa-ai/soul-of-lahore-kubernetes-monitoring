'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import SoulOfLahoreLogo from './SoulOfLahoreLogo';
import PlaceLogo from './PlaceLogo';

const FEATURED = ['badshahi', 'minar', 'wazir-khan', 'sheesh-mahal'];

const navPlaces = [
  { id: 'minar', slug: 'minar-pakistan', title: 'Minar-e-Pakistan', subtitle: 'Monument of Freedom' },
  { id: 'badshahi', slug: 'badshahi-mosque', title: 'Badshahi Mosque', subtitle: 'Mughal Grandeur' },
  { id: 'iqbal-tomb', slug: 'allama-iqbal-tomb', title: 'Allama Iqbal Tomb', subtitle: 'Mazar-e-Iqbal' },
  { id: 'lahore-fort', slug: 'lahore-fort', title: 'Shahi Qila', subtitle: 'The Royal Fort' },
  { id: 'wazir-khan', slug: 'wazir-khan-mosque', title: 'Masjid Wazir Khan', subtitle: 'The Painted Mosque' },
  { id: 'sheesh-mahal', slug: 'sheesh-mahal', title: 'Sheesh Mahal', subtitle: 'Palace of Mirrors' },
  { id: 'library', slug: 'quaid-e-azam-library', title: 'Quaid-e-Azam Library', subtitle: 'Temple of Knowledge' },
  { id: 'lahore-museum', slug: 'lahore-museum', title: 'Lahore Museum', subtitle: 'Wonder House of History' },
  { id: 'jahangir-tomb', slug: 'tomb-of-jahangir', title: 'Tomb of Jahangir', subtitle: "Mughal Emperor's Rest" },
  { id: 'lahore-zoo', slug: 'lahore-zoo', title: 'Lahore Zoo', subtitle: 'Wild Heart of the City' },
  { id: 'shalimar', slug: 'shalimar-gardens', title: 'Shalimar Gardens', subtitle: 'Mughal Paradise Garden' },
  { id: 'bagh-jinnah', slug: 'bagh-e-jinnah', title: 'Bagh-e-Jinnah', subtitle: 'Lawrence Gardens' },
];

export default function NavBar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === '/';
  const currentPlace = navPlaces.find(p => pathname.includes(p.slug));

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(navRef.current, { y: -60, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', delay: 0.5 });
    }, navRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(overlayRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 });
      tl.fromTo(menuRef.current, { x: '100%' }, { x: 0, duration: 0.6, ease: 'power4.inOut' }, '-=0.2');
      tl.fromTo(menuRef.current?.querySelectorAll('.menu-item'), { autoAlpha: 0, x: 40 },
        { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.04, ease: 'power3.out' }, '-=0.3');
    });
    return () => ctx.revert();
  }, [menuOpen]);

  const closeMenu = () => {
    if (!menuRef.current || !overlayRef.current) {
      setMenuOpen(false);
      return;
    }
    const ctx = gsap.context(() => {
      gsap.to(menuRef.current, {
        x: '100%', duration: 0.5, ease: 'power3.in',
        onComplete: () => setMenuOpen(false),
      });
      gsap.to(overlayRef.current, { autoAlpha: 0, duration: 0.3 });
    });
  };

  const isPlaceActive = (slug: string) => pathname.includes(slug);

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4 flex items-center justify-between backdrop-blur-md bg-black/40"
      >
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-6 h-6 md:w-7 md:h-7 transition-transform duration-700 group-hover:scale-110">
            <SoulOfLahoreLogo size={24} variant="navbar" />
          </div>
          <span className="hidden sm:block text-sm tracking-[0.3em] uppercase text-white/80 hover:text-white transition-colors">
            Soul of Lahore
          </span>
        </Link>

        <div className="flex items-center gap-6">
          {currentPlace && (
            <span className="hidden md:block text-xs text-white/40 tracking-wider uppercase">
              {currentPlace.subtitle}
            </span>
          )}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col gap-1.5 p-2 group"
            aria-label="Open menu"
          >
            <span className="block w-6 h-px bg-white/60 group-hover:bg-white transition-colors" />
            <span className="block w-4 h-px bg-white/60 group-hover:bg-white transition-colors" />
            <span className="block w-5 h-px bg-white/60 group-hover:bg-white transition-colors" />
          </button>
        </div>
      </nav>

      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
        style={{ display: menuOpen ? 'block' : 'none', opacity: 0 }}
        onClick={closeMenu}
      />

      {/* Menu panel */}
      <div
        ref={menuRef}
        className="fixed top-0 right-0 h-full w-full max-w-md z-50 bg-neutral-950/95 backdrop-blur-2xl border-l border-white/5 overflow-y-auto"
        style={{ display: menuOpen ? 'block' : 'none', transform: 'translateX(100%)' }}
      >
        {/* Decorative top gradient */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        <div className="p-6 md:p-10">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <span className="text-[10px] tracking-[0.4em] uppercase text-amber-500/50">Navigation</span>
              <p className="text-xs text-white/20 mt-1">Soul of Lahore</p>
            </div>
            <button
              onClick={closeMenu}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/15 transition-all border border-white/5"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main navigation */}
          <div className="mb-8">
            <Link
              href="/"
              onClick={closeMenu}
              className={`menu-item block py-3 text-2xl md:text-3xl font-bold transition-all duration-300 ${
                isHome ? 'text-white' : 'text-white/30 hover:text-white hover:pl-2'
              }`}
            >
              <span className="text-[10px] text-white/15 mr-3 font-mono align-middle">00</span>
              Home
            </Link>

            <Link
              href="/places"
              onClick={closeMenu}
              className={`menu-item block py-3 text-xl md:text-2xl font-semibold transition-all duration-300 ${
                pathname === '/places' ? 'text-amber-400' : 'text-white/30 hover:text-amber-400 hover:pl-2'
              }`}
            >
              <span className="text-[10px] text-white/15 mr-3 font-mono align-middle">All</span>
              Places Collection
            </Link>

            <Link
              href="/reviews"
              onClick={closeMenu}
              className={`menu-item block py-3 text-xl md:text-2xl font-semibold transition-all duration-300 ${
                pathname === '/reviews' ? 'text-amber-400' : 'text-white/30 hover:text-amber-400 hover:pl-2'
              }`}
            >
              <span className="text-[10px] text-white/15 mr-3 font-mono align-middle">Voices</span>
              Visitor Reviews
            </Link>
          </div>

          {/* Featured highlights */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-amber-500/30 to-transparent" />
              <span className="text-[9px] tracking-[0.4em] uppercase text-amber-500/40">Featured</span>
              <div className="h-px flex-1 bg-gradient-to-l from-amber-500/30 to-transparent" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {navPlaces.filter(p => FEATURED.includes(p.id)).map((place) => (
                <Link
                  key={place.id}
                  href={`/place/${place.slug}`}
                  onClick={closeMenu}
                  className={`menu-item flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-300 ${
                    isPlaceActive(place.slug) ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] hover:border-amber-500/20'
                  }`}
                >
                  <PlaceLogo placeId={place.id} size={22} animated />
                  <span className="text-[7px] tracking-[0.1em] uppercase text-white/40 text-center leading-tight">
                    {place.title.split(' ')[0]}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* All places list */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              <span className="text-[9px] tracking-[0.4em] uppercase text-white/20">All Landmarks</span>
              <div className="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent" />
            </div>
            <div className="space-y-0.5">
              {navPlaces.map((place) => (
                <Link
                  key={place.id}
                  href={`/place/${place.slug}`}
                  onClick={closeMenu}
                  className={`menu-item flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-300 ${
                    isPlaceActive(place.slug)
                      ? 'text-white bg-white/5 border-l-2 border-amber-500'
                      : 'text-white/40 hover:text-white hover:bg-white/[0.03] hover:pl-4'
                  }`}
                >
                  <div className="w-6 h-6 flex-shrink-0">
                    <PlaceLogo placeId={place.id} size={20} animated={false} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm font-medium truncate">{place.title}</span>
                    <span className="block text-[9px] tracking-[0.15em] uppercase text-white/30 truncate">
                      {place.subtitle}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-white/20">
                    {(navPlaces.indexOf(place) + 1).toString().padStart(2, '0')}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-[9px] tracking-[0.3em] uppercase text-white/10">
              Every Brick Tells A Story.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
