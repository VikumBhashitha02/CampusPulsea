import React from 'react';
import { cn } from '../../lib/cn';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeKind =
  | 'default'
  | 'category'
  | 'mode'
  | 'status'
  | 'free'
  | 'verified'
  | 'registration';

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100/80 text-slate-700 border-slate-200/80',
  accent: 'bg-amber-50 text-amber-900 border-amber-200/80 font-semibold',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
  danger: 'bg-rose-50 text-rose-800 border-rose-200/80',
  info: 'bg-blue-50 text-blue-800 border-blue-200/80',
};

const kindTone: Record<BadgeKind, BadgeTone> = {
  default: 'neutral',
  category: 'accent',
  mode: 'neutral',
  status: 'neutral',
  free: 'success',
  verified: 'success',
  registration: 'warning',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  kind?: BadgeKind;
  tone?: BadgeTone;
  size?: 'sm' | 'md';
}

export function Badge({
  kind = 'default',
  tone,
  size = 'sm',
  className,
  children,
  ...props
}: BadgeProps) {
  const resolvedTone = tone ?? kindTone[kind];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border font-medium transition-colors select-none',
        size === 'sm' ? 'px-2 py-0.5 text-[11px] leading-tight' : 'px-2.5 py-1 text-xs',
        toneClasses[resolvedTone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
