import React from 'react';

export function EventCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-[#E5E7EB] p-5 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-5 bg-slate-200 rounded-md w-24" />
        <div className="h-5 bg-slate-200 rounded-md w-12" />
      </div>
      <div className="space-y-2 pt-1">
        <div className="h-5 bg-slate-200 rounded-md w-4/5" />
        <div className="h-4 bg-slate-200 rounded-md w-3/5" />
      </div>
      <div className="space-y-1.5 pt-3 border-t border-[#F1F5F9]">
        <div className="h-3.5 bg-slate-100 rounded w-1/2" />
        <div className="h-3.5 bg-slate-100 rounded w-2/3" />
      </div>
      <div className="h-10 bg-slate-50 rounded-lg mt-3" />
    </div>
  );
}

export function EventsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <EventCardSkeleton key={idx} />
      ))}
    </div>
  );
}
