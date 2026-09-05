import React from 'react';
import { cn } from '../../lib/cn';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  eyebrow?: string;
  className?: string;
}

export function PageHeader({ title, description, actions, eyebrow, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="space-y-2 max-w-2xl">
        {eyebrow && (
          <p className="text-sm font-semibold text-cp-muted">{eyebrow}</p>
        )}
        <h1 className="text-page-title text-cp-navy">{title}</h1>
        {description && <p className="text-body text-cp-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
