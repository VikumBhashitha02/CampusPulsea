import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from './button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = 'Unable to load content',
  message = 'A connection or server issue occurred. Please check your network and try again.',
  onRetry,
  retryLabel = 'Try again',
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'w-full py-14 px-6 rounded-xl bg-white border border-[#FECACA] text-center flex flex-col items-center justify-center gap-3.5 shadow-xs',
        className,
      )}
    >
      <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
        <AlertCircle className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="max-w-md space-y-1">
        <h3 className="text-base font-semibold text-[#0F172A] tracking-tight">{title}</h3>
        <p className="text-xs text-[#64748B] leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <div className="pt-2">
          <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
