'use client';

import React from 'react';
import { X, RotateCcw } from 'lucide-react';

export interface ActiveFilterChipsProps {
  search?: string;
  categoryLabel?: string;
  universityLabel?: string;
  modeLabel?: string;
  dateLabel?: string;
  isFreeOnly?: boolean;
  onRemoveSearch: () => void;
  onRemoveCategory: () => void;
  onRemoveUniversity: () => void;
  onRemoveMode: () => void;
  onRemoveDate: () => void;
  onRemoveFreeOnly: () => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({
  search,
  categoryLabel,
  universityLabel,
  modeLabel,
  dateLabel,
  isFreeOnly,
  onRemoveSearch,
  onRemoveCategory,
  onRemoveUniversity,
  onRemoveMode,
  onRemoveDate,
  onRemoveFreeOnly,
  onClearAll,
}: ActiveFilterChipsProps) {
  const chips = [
    search ? { id: 'search', label: `Search: "${search}"`, onRemove: onRemoveSearch } : null,
    categoryLabel
      ? { id: 'category', label: `Category: ${categoryLabel}`, onRemove: onRemoveCategory }
      : null,
    universityLabel
      ? { id: 'uni', label: `Campus: ${universityLabel}`, onRemove: onRemoveUniversity }
      : null,
    modeLabel ? { id: 'mode', label: `Mode: ${modeLabel}`, onRemove: onRemoveMode } : null,
    dateLabel && dateLabel !== 'all'
      ? { id: 'date', label: `Timing: ${dateLabel.replace('_', ' ')}`, onRemove: onRemoveDate }
      : null,
    isFreeOnly
      ? { id: 'free', label: 'Free Opportunities Only', onRemove: onRemoveFreeOnly }
      : null,
  ].filter(Boolean) as { id: string; label: string; onRemove: () => void }[];

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1" aria-label="Active Filters">
      <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
        Active Filters:
      </span>

      {chips.map((chip) => (
        <span
          key={chip.id}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#222730] border border-[#E2E8F0]"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={chip.onRemove}
            className="w-4 h-4 rounded-full hover:bg-slate-300 flex items-center justify-center text-[#64748B] hover:text-black transition-colors"
            aria-label={`Remove filter ${chip.label}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="inline-flex items-center gap-1 text-xs font-bold text-[#B45309] hover:underline ml-1 transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Clear All</span>
      </button>
    </div>
  );
}
