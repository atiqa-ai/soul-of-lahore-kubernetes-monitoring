'use client';

import dynamic from 'next/dynamic';
import { type ReactNode } from 'react';
import NavBar from './components/NavBar';
import PageTransition from './components/PageTransition';
import AmbientSoundtrack from './components/AmbientSoundtrack';
import ErrorBoundary from './components/ErrorBoundary';

const SmoothScrollWrapper = dynamic(() => import('./components/SmoothScrollWrapper'), { ssr: false });

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <SmoothScrollWrapper>
      <AmbientSoundtrack />
      <ErrorBoundary>
        <NavBar />
        <PageTransition>
          {children}
        </PageTransition>
      </ErrorBoundary>
    </SmoothScrollWrapper>
  );
}
