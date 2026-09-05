'use client';

import React from 'react';
import { X, Filter } from 'lucide-react';
import { FilterSidebar } from './filter-sidebar';

export interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  resultCount: number;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedUniversity: string;
  onUniversityChange: (uni: string) => void;
  selectedMode: string;
  onModeChange: (mode: string) => void;
  datePreset: string;
  onDatePresetChange: (preset: string) => void;
  isFreeOnly: boolean;
  onFreeOnlyChange: (val: boolean) => void;
  onClearAll: () => void;
  totalActiveFilters: number;
}

export function FilterDrawer({
  isOpen,
  onClose,
  resultCount,
  selectedCategory,
  onCategoryChange,
  selectedUniversity,
  onUniversityChange,
  selectedMode,
  onModeChange,
  datePreset,
  onDatePresetChange,
  isFreeOnly,
  onFreeOnlyChange,
  onClearAll,
  totalActiveFilters,
}: FilterDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#FEB703]" />
              <h2 className="text-base font-extrabold text-[#222730]">Filter Opportunities</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-[#64748B] hover:text-[#222730] hover:bg-[#F8FAFC] transition-colors"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Scrollable Body */}
          <div className="p-6 overflow-y-auto flex-1">
            <FilterSidebar
              selectedCategory={selectedCategory}
              onCategoryChange={onCategoryChange}
              selectedUniversity={selectedUniversity}
              onUniversityChange={onUniversityChange}
              selectedMode={selectedMode}
              onModeChange={onModeChange}
              datePreset={datePreset}
              onDatePresetChange={onDatePresetChange}
              isFreeOnly={isFreeOnly}
              onFreeOnlyChange={onFreeOnlyChange}
              onClearAll={onClearAll}
              totalActiveFilters={totalActiveFilters}
            />
          </div>

          {/* Drawer Footer CTA */}
          <div className="p-5 border-t border-[#E5E7EB] bg-[#F8FAFC] flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full btn-primary py-3 text-sm font-bold justify-center"
            >
              View {resultCount} Opportunities
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
