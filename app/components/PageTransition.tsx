'use client';

import { useRef, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;

    gsap.set(el, { autoAlpha: 0, y: 30 });

    const ctx = gsap.context(() => {
      gsap.to(el, {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        ease: 'power4.out',
      });
    }, el);

    return () => ctx.revert();
  }, [pathname]);

  return (
    <div ref={pageRef} className="min-h-screen">
      {children}
    </div>
  );
}
