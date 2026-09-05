import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'w-full py-14 px-6 rounded-xl bg-white border border-[#E2E8F0] text-center flex flex-col items-center justify-center gap-3.5 shadow-xs',
        className,
      )}
    >
      <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/60 text-slate-500 flex items-center justify-center">
        {icon ?? <Inbox className="w-5 h-5" aria-hidden="true" />}
      </div>
      <div className="max-w-md space-y-1">
        <h3 className="text-base font-semibold text-[#0F172A] tracking-tight">{title}</h3>
        {description && <p className="text-xs text-[#64748B] leading-relaxed">{description}</p>}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
