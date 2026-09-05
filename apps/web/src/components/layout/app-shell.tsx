'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './header';
import { Footer } from './footer';
import { getRawAppArea } from '../../lib/navigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const area = getRawAppArea(pathname);

  if (area === 'auth') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-cp-bg">
      <Header />
      <div id="main" tabIndex={-1} className="flex-1 flex flex-col outline-none">
        {children}
      </div>
      <Footer />
    </div>
  );
}
