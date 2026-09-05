import React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { buttonClassName } from './button';

export interface AccessRestrictedProps {
  title?: string;
  message?: string;
  homeHref?: string;
  accountHref?: string;
}

export function AccessRestricted({
  title = 'Access restricted',
  message = 'You do not have permission to view this area of CampusPulse.',
  homeHref = '/',
  accountHref = '/account',
}: AccessRestrictedProps) {
  return (
    <div className="flex-1 max-w-lg w-full mx-auto px-4 py-20 flex flex-col items-center justify-center text-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center">
        <Lock className="w-6 h-6" aria-hidden="true" />
      </div>
      <h1 className="text-page-title text-cp-navy">{title}</h1>
      <p className="text-body text-cp-muted">{message}</p>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link href={homeHref} className={buttonClassName({ variant: 'secondary', size: 'sm' })}>
          Return home
        </Link>
        <Link href={accountHref} className={buttonClassName({ variant: 'primary', size: 'sm' })}>
          My account
        </Link>
      </div>
    </div>
  );
}
