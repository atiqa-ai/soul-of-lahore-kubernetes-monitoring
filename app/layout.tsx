import type { ReactNode } from 'react';
import './globals.css';
import ClientLayout from './client-layout';

export const metadata = {
  title: 'Soul of Lahore — A Cinematic Documentary',
  description: 'Experience the soul of Lahore through a cinematic journey across its timeless landmarks, culture, and history.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-black text-white">
      <body className="overflow-x-hidden">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
