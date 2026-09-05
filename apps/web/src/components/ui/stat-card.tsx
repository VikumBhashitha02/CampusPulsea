import React from 'react';
import { Card } from './card';
import { cn } from '../../lib/cn';

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, hint, icon, className }: StatCardProps) {
  return (
    <Card className={cn('space-y-3', className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-meta font-semibold text-cp-muted">{label}</p>
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-cp-bg border border-cp-border text-cp-navy flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>
      <p className="text-section-title text-cp-navy">{value}</p>
      {hint && <p className="text-meta text-cp-muted">{hint}</p>}
    </Card>
  );
}
