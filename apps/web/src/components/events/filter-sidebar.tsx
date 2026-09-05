'use client';

import React from 'react';
import {
  Filter,
  RotateCcw,
  Building2,
  Calendar,
  Layers,
  Check,
  DollarSign,
  Radio,
} from 'lucide-react';
import { EventMode } from '@campuspulse/types';

export interface FilterSidebarProps {
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

const CATEGORIES = [
  { slug: '', label: 'All Categories' },
  { slug: 'competitions', label: 'Hackathons & Competitions' },
  { slug: 'academic', label: 'Workshops & Tech Talks' },
  { slug: 'career', label: 'Career & Internship Fairs' },
  { slug: 'research', label: 'Research & Academic' },
  { slug: 'cultural', label: 'Cultural & Performing Arts' },
  { slug: 'music', label: 'Music & Concerts' },
  { slug: 'sports', label: 'Sports Tournaments' },
  { slug: 'social', label: 'Social & Campus Life' },
];

const UNIVERSITIES = [
  { slug: '', label: 'All Universities' },
  { slug: 'uom', label: 'University of Moratuwa (UoM)' },
  { slug: 'uoc', label: 'University of Colombo (UoC)' },
  { slug: 'uop', label: 'University of Peradeniya (UoP)' },
  { slug: 'kln', label: 'University of Kelaniya' },
  { slug: 'sjp', label: 'University of Sri Jayewardenepura' },
  { slug: 'sliit', label: 'SLIIT' },
];

export function FilterSidebar({
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
}: FilterSidebarProps) {
  return (
    <div className="space-y-6 text-sm">
      {/* Filter Header & Reset */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2 font-extrabold text-[#222730]">
          <Filter className="w-4 h-4 text-[#FEB703]" />
          <span>Filters</span>
          {totalActiveFilters > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#FFF8E6] text-[#B45309] border border-[#FDE68A]">
              {totalActiveFilters}
            </span>
          )}
        </div>

        {totalActiveFilters > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1 text-xs font-semibold text-[#64748B] hover:text-[#222730] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 1. Category Filter */}
      <div className="space-y-2">
        <label className="font-bold text-[#222730] flex items-center gap-2 text-xs uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5 text-[#64748B]" />
          <span>Category</span>
        </label>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.slug;
            return (
              <button
                key={cat.slug || 'all-cat'}
                type="button"
                onClick={() => onCategoryChange(cat.slug)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                  isActive
                    ? 'bg-[#FFF8E6] text-[#B45309] font-bold border border-[#FDE68A]'
                    : 'text-[#64748B] hover:text-[#222730] hover:bg-[#F8FAFC]'
                }`}
              >
                <span>{cat.label}</span>
                {isActive && <Check className="w-3.5 h-3.5 text-[#B45309]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. University / Campus Filter */}
      <div className="space-y-2 pt-4 border-t border-[#E5E7EB]">
        <label className="font-bold text-[#222730] flex items-center gap-2 text-xs uppercase tracking-wider">
          <Building2 className="w-3.5 h-3.5 text-[#64748B]" />
          <span>Host University</span>
        </label>
        <select
          value={selectedUniversity}
          onChange={(e) => onUniversityChange(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#E5E7EB] text-xs text-[#222730] font-medium focus:outline-none focus:border-[#FEB703] transition-colors"
          aria-label="Filter by host university"
        >
          {UNIVERSITIES.map((uni) => (
            <option key={uni.slug || 'all-uni'} value={uni.slug}>
              {uni.label}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Event Mode Filter */}
      <div className="space-y-2 pt-4 border-t border-[#E5E7EB]">
        <label className="font-bold text-[#222730] flex items-center gap-2 text-xs uppercase tracking-wider">
          <Radio className="w-3.5 h-3.5 text-[#64748B]" />
          <span>Participation Mode</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { mode: '', label: 'All Modes' },
            { mode: EventMode.IN_PERSON, label: 'In Person' },
            { mode: EventMode.ONLINE, label: 'Online' },
            { mode: EventMode.HYBRID, label: 'Hybrid' },
          ].map((item) => {
            const isActive = selectedMode === item.mode;
            return (
              <button
                key={item.mode || 'all-mode'}
                type="button"
                onClick={() => onModeChange(item.mode)}
                className={`px-3 py-2 rounded-lg text-center text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#222730] text-white shadow-xs'
                    : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#222730] border border-[#E5E7EB]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Timeline / Date Preset Filter */}
      <div className="space-y-2 pt-4 border-t border-[#E5E7EB]">
        <label className="font-bold text-[#222730] flex items-center gap-2 text-xs uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
          <span>Timing & Date</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'all', label: 'All Upcoming' },
            { id: 'upcoming', label: 'Future Events' },
            { id: 'this_week', label: 'This Week' },
            { id: 'this_month', label: 'This Month' },
          ].map((item) => {
            const isActive = datePreset === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onDatePresetChange(item.id)}
                className={`px-3 py-2 rounded-lg text-left text-xs font-semibold transition-all flex items-center justify-between ${
                  isActive
                    ? 'bg-[#FFF8E6] text-[#B45309] border border-[#FDE68A]'
                    : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#222730] border border-[#E5E7EB]'
                }`}
              >
                <span>{item.label}</span>
                {isActive && <Check className="w-3 h-3 text-[#B45309]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Free Opportunities Toggle */}
      <div className="pt-4 border-t border-[#E5E7EB]">
        <label className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] cursor-pointer hover:border-[#FEB703] transition-colors">
          <span className="flex items-center gap-2 text-xs font-bold text-[#222730]">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Free Opportunities Only</span>
          </span>
          <input
            type="checkbox"
            checked={isFreeOnly}
            onChange={(e) => onFreeOnlyChange(e.target.checked)}
            className="w-4 h-4 rounded border-[#E5E7EB] text-[#FEB703] focus:ring-[#FEB703] cursor-pointer accent-[#FEB703]"
          />
        </label>
      </div>
    </div>
  );
}
