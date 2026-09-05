import React from 'react';
import { cn } from '../../lib/cn';

export interface GridSkeletonProps {
  count?: number;
  className?: string;
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-slate-200 motion-reduce:animate-none', className)} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-cp-surface border border-cp-border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-5 w-24" />
        <SkeletonBlock className="h-5 w-12" />
      </div>
      <SkeletonBlock className="h-5 w-4/5" />
      <SkeletonBlock className="h-4 w-3/5" />
      <div className="space-y-2 pt-3 border-t border-cp-border-light">
        <SkeletonBlock className="h-3.5 w-1/2" />
        <SkeletonBlock className="h-3.5 w-2/3" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6, className }: GridSkeletonProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}
