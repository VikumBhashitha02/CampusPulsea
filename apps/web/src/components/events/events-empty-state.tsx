import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

interface EventsEmptyStateProps {
  onClearAll?: () => void;
}

export function EventsEmptyState({ onClearAll }: EventsEmptyStateProps) {
  return (
    <div className="w-full py-16 px-6 rounded-2xl bg-white border border-[#E5E7EB] text-center flex flex-col items-center justify-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-[#FFF8E6] text-[#B45309] flex items-center justify-center">
        <SearchX className="w-7 h-7" />
      </div>

      <div className="max-w-md space-y-1.5">
        <h3 className="text-lg font-extrabold text-[#222730]">No Opportunities Found</h3>
        <p className="text-xs text-[#64748B] leading-relaxed">
          We couldn&apos;t find any opportunities matching your selected search terms or filters. Try broadening your keywords or resetting filters.
        </p>
      </div>

      {onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-2 mt-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear All Filters</span>
        </button>
      )}
    </div>
  );
}
