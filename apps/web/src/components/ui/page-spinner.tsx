import React from 'react';
import { cn } from '../../lib/cn';

export interface PageSpinnerProps {
  label?: string;
  className?: string;
}

export function PageSpinner({ label = 'Loading…', className }: PageSpinnerProps) {
  return (
    <div
      className={cn('flex flex-1 items-center justify-center p-10', className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 rounded-full border-2 border-cp-yellow border-t-transparent animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-cp-muted">{label}</p>
      </div>
    </div>
  );
}
