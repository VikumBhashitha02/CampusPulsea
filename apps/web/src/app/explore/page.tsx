'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  Compass,
  Search,
  X,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { EventCard } from '../../components/events/event-card';
import { FilterSidebar } from '../../components/events/filter-sidebar';
import { FilterDrawer } from '../../components/events/filter-drawer';
import { ActiveFilterChips } from '../../components/events/active-filter-chips';
import { EventsGridSkeleton } from '../../components/events/events-skeleton';
import { EventsEmptyState } from '../../components/events/events-empty-state';
import { EventsErrorState } from '../../components/events/events-error-state';
import type { PaginatedEvents } from '../../services/events.service';
import { eventsService } from '../../services/events.service';
import type { EventMode } from '@campuspulse/types';

function ExploreContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialCategory = searchParams.get('categorySlug') || searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || searchParams.get('q') || '';
  const initialUniversity = searchParams.get('universitySlug') || searchParams.get('university') || '';
  const initialMode = searchParams.get('mode') || '';
  const initialDatePreset = searchParams.get('datePreset') || 'all';
  const initialIsFree = searchParams.get('isFree') === 'true';
  const initialSortBy = searchParams.get('sortBy') || 'startDate';
  const initialSortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedUniversity, setSelectedUniversity] = useState(initialUniversity);
  const [selectedMode, setSelectedMode] = useState(initialMode);
  const [datePreset, setDatePreset] = useState(initialDatePreset);
  const [isFreeOnly, setIsFreeOnly] = useState(initialIsFree);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);
  const [page, setPage] = useState(initialPage);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [eventsData, setEventsData] = useState<PaginatedEvents>({
    items: [],
    meta: { total: 0, page: 1, limit: 9, totalPages: 1 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateUrlParams = useCallback(
    (newParams: Record<string, string | number | boolean | undefined | null>) => {
      const current = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, val]) => {
        if (val === undefined || val === null || val === '' || (key === 'page' && val === 1) || (key === 'datePreset' && val === 'all')) {
          current.delete(key);
        } else {
          current.set(key, String(val));
        }
      });
      const queryStr = current.toString();
      const newUrl = queryStr ? `${pathname}?${queryStr}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const activeFiltersCount = [
    selectedCategory ? 1 : 0,
    selectedUniversity ? 1 : 0,
    selectedMode ? 1 : 0,
    datePreset !== 'all' ? 1 : 0,
    isFreeOnly ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await eventsService.getEvents({
        search: search.trim() || undefined,
        categorySlug: selectedCategory || undefined,
        universitySlug: selectedUniversity || undefined,
        mode: (selectedMode as EventMode) || undefined,
        datePreset: datePreset !== 'all' ? (datePreset as any) : undefined,
        isFree: isFreeOnly ? true : undefined,
        sortBy,
        sortOrder,
        page,
        limit: 9,
      });
      setEventsData(res);
    } catch (err: any) {
      console.error('Failed to load events:', err);
      setError(err?.message || 'Unable to connect to events service.');
    } finally {
      setLoading(false);
    }
  }, [
    search,
    selectedCategory,
    selectedUniversity,
    selectedMode,
    datePreset,
    isFreeOnly,
    sortBy,
    sortOrder,
    page,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEvents();
      updateUrlParams({
        search: search.trim() || undefined,
        categorySlug: selectedCategory || undefined,
        universitySlug: selectedUniversity || undefined,
        mode: selectedMode || undefined,
        datePreset: datePreset !== 'all' ? datePreset : undefined,
        isFree: isFreeOnly ? true : undefined,
        sortBy: sortBy !== 'startDate' ? sortBy : undefined,
        sortOrder: sortOrder !== 'asc' ? sortOrder : undefined,
        page: page > 1 ? page : undefined,
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [
    search,
    selectedCategory,
    selectedUniversity,
    selectedMode,
    datePreset,
    isFreeOnly,
    sortBy,
    sortOrder,
    page,
    loadEvents,
    updateUrlParams,
  ]);

  const handleClearAll = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedUniversity('');
    setSelectedMode('');
    setDatePreset('all');
    setIsFreeOnly(false);
    setSortBy('startDate');
    setSortOrder('asc');
    setPage(1);
    updateUrlParams({});
  };

  const handleSortChange = (value: string) => {
    switch (value) {
      case 'date_asc':
        setSortBy('startDate');
        setSortOrder('asc');
        break;
      case 'date_desc':
        setSortBy('startDate');
        setSortOrder('desc');
        break;
      case 'popularity':
        setSortBy('registrations');
        setSortOrder('desc');
        break;
      case 'title_asc':
        setSortBy('title');
        setSortOrder('asc');
        break;
      default:
        setSortBy('startDate');
        setSortOrder('asc');
    }
    setPage(1);
  };

    return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 section-container py-8 md:py-10 space-y-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Explore Opportunities</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              Discover Campus Opportunities
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl leading-relaxed">
              Competitions, hackathons, workshops, research, conferences, and scholarships across universities.
            </p>
          </div>

          <div className="relative max-w-2xl">
            <label htmlFor="search-input" className="sr-only">
              Search opportunities
            </label>
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="search-input"
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title, keyword, university, or society..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-xs sm:text-sm text-[#0F172A] placeholder:text-[#94A3B8] font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-all shadow-xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#94A3B8] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
                aria-label="Clear search text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <ActiveFilterChips
            search={search}
            categoryLabel={selectedCategory}
            universityLabel={selectedUniversity}
            modeLabel={selectedMode}
            dateLabel={datePreset !== 'all' ? datePreset : undefined}
            isFreeOnly={isFreeOnly}
            onRemoveSearch={() => {
              setSearch('');
              setPage(1);
            }}
            onRemoveCategory={() => {
              setSelectedCategory('');
              setPage(1);
            }}
            onRemoveUniversity={() => {
              setSelectedUniversity('');
              setPage(1);
            }}
            onRemoveMode={() => {
              setSelectedMode('');
              setPage(1);
            }}
            onRemoveDate={() => {
              setDatePreset('all');
              setPage(1);
            }}
            onRemoveFreeOnly={() => {
              setIsFreeOnly(false);
              setPage(1);
            }}
            onClearAll={handleClearAll}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-[#E2E8F0] text-xs font-semibold text-[#0F172A] shadow-xs transition-colors"
            >
              <Filter className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#FEB703] text-[#0F172A] text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <span className="text-xs text-[#64748B]">
              Showing <strong className="text-[#0F172A] font-semibold">{eventsData.items.length}</strong> of{' '}
              <strong className="text-[#0F172A] font-semibold">{eventsData.meta.total}</strong> opportunities
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="text-xs text-[#64748B] flex items-center gap-1 font-medium">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span>Sort by:</span>
            </span>
            <select
              value={sortBy === 'startDate' && sortOrder === 'asc' ? 'date_asc' : sortBy === 'startDate' && sortOrder === 'desc' ? 'date_desc' : sortBy === 'registrations' ? 'popularity' : sortBy === 'title' ? 'title_asc' : 'date_asc'}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] font-medium focus:outline-none focus:border-amber-500 shadow-xs cursor-pointer"
              aria-label="Sort opportunities"
            >
              <option value="date_asc">Upcoming First</option>
              <option value="date_desc">Latest Date</option>
              <option value="popularity">Most Popular</option>
              <option value="title_asc">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <aside className="hidden lg:block lg:col-span-1 p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs sticky top-24">
            <FilterSidebar
              selectedCategory={selectedCategory}
              onCategoryChange={(cat) => {
                setSelectedCategory(cat);
                setPage(1);
              }}
              selectedUniversity={selectedUniversity}
              onUniversityChange={(uni) => {
                setSelectedUniversity(uni);
                setPage(1);
              }}
              selectedMode={selectedMode}
              onModeChange={(m) => {
                setSelectedMode(m);
                setPage(1);
              }}
              datePreset={datePreset}
              onDatePresetChange={(p) => {
                setDatePreset(p);
                setPage(1);
              }}
              isFreeOnly={isFreeOnly}
              onFreeOnlyChange={(val) => {
                setIsFreeOnly(val);
                setPage(1);
              }}
              onClearAll={handleClearAll}
              totalActiveFilters={activeFiltersCount}
            />
          </aside>

          <section className="lg:col-span-3 space-y-6" aria-label="Opportunities list">
            {loading ? (
              <EventsGridSkeleton count={6} />
            ) : error ? (
              <EventsErrorState onRetry={loadEvents} message={error} />
            ) : eventsData.items.length === 0 ? (
              <EventsEmptyState onClearAll={handleClearAll} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {eventsData.items.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}

            {eventsData.meta.totalPages > 1 && (
              <nav
                className="pt-6 border-t border-[#E2E8F0] flex items-center justify-between text-xs"
                aria-label="Pagination Navigation"
              >
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#0F172A] font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white shadow-xs transition-colors"
                  aria-label="Go to previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="text-[#64748B] font-medium">
                  Page <span className="font-bold text-[#0F172A]">{page}</span> of{' '}
                  <span className="font-bold text-[#0F172A]">{eventsData.meta.totalPages}</span>
                </div>

                <button
                  type="button"
                  disabled={page >= eventsData.meta.totalPages}
                  onClick={() => setPage((p) => Math.min(eventsData.meta.totalPages, p + 1))}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#0F172A] font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white shadow-xs transition-colors"
                  aria-label="Go to next page"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </nav>
            )}
          </section>
        </div>

        <FilterDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          resultCount={eventsData.meta.total}
          selectedCategory={selectedCategory}
          onCategoryChange={(cat) => {
            setSelectedCategory(cat);
            setPage(1);
          }}
          selectedUniversity={selectedUniversity}
          onUniversityChange={(uni) => {
            setSelectedUniversity(uni);
            setPage(1);
          }}
          selectedMode={selectedMode}
          onModeChange={(m) => {
            setSelectedMode(m);
            setPage(1);
          }}
          datePreset={datePreset}
          onDatePresetChange={(p) => {
            setDatePreset(p);
            setPage(1);
          }}
          isFreeOnly={isFreeOnly}
          onFreeOnlyChange={(val) => {
            setIsFreeOnly(val);
            setPage(1);
          }}
          onClearAll={handleClearAll}
          totalActiveFilters={activeFiltersCount}
        />
      </main>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-xs text-cp-muted">
          Loading opportunity catalog...
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
