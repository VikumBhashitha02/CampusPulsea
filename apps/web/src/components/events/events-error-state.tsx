import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface EventsErrorStateProps {
  onRetry: () => void;
  message?: string;
}

export function EventsErrorState({
  onRetry,
  message = 'We encountered an issue loading opportunities from the server.',
}: EventsErrorStateProps) {
  return (
    <div className="w-full py-16 px-6 rounded-2xl bg-white border border-rose-200 text-center flex flex-col items-center justify-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
        <AlertCircle className="w-7 h-7" />
      </div>

      <div className="max-w-md space-y-1.5">
        <h3 className="text-lg font-extrabold text-[#222730]">Unable to Load Opportunities</h3>
        <p className="text-xs text-[#64748B] leading-relaxed">{message}</p>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-2 mt-2"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Try Again</span>
      </button>
    </div>
  );
}
