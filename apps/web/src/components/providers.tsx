'use client';

import React from 'react';
import { AuthProvider } from '../lib/auth/auth-context';
import { ToastProvider } from './ui/toast';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}
