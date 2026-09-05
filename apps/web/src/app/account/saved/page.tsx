'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bookmark,
  ArrowLeft,
  Compass,
  Trash2,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { EventCard } from '../../../components/events/event-card';
import { useAuth } from '../../../lib/auth/auth-context';
import type { EventItem } from '../../../services/events.service';
import { bookmarksService } from '../../../services/bookmarks.service';
import { useToast } from '../../../components/ui/toast';

export default function SavedOpportunitiesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login?redirect=/account/saved');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadBookmarks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookmarksService.getMyBookmarks();
      setEvents(data);
    } catch (err: any) {
      console.error('Failed to load saved opportunities:', err);
      setError('Unable to load your saved opportunities. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadBookmarks();
    }
  }, [isAuthenticated, loadBookmarks]);

  const handleRemoveBookmark = async (eventId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setRemovingId(eventId);
    const previousEvents = [...events];
    setEvents((prev) => prev.filter((item) => item.id !== eventId));

    try {
      await bookmarksService.toggleBookmark(eventId);
      toast({
        title: 'Removed from saved',
        description: 'Opportunity removed from your saved list.',
        tone: 'info',
      });
    } catch (err: any) {
      console.error('Failed to remove bookmark:', err);
      setEvents(previousEvents);
      toast({
        title: 'Unable to remove',
        description: 'Please try again.',
        tone: 'error',
      });
    } finally {
      setRemovingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center p-6 text-xs text-cp-muted">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-cp-yellow border-t-transparent animate-spin" />
            <span>Loading student account...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 section-container py-8 md:py-10 space-y-6">
        <div>
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Student Overview</span>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E2E8F0]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider">
              <Bookmark className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Saved Bookmarks</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">Saved Opportunities</h1>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Opportunities you&apos;ve bookmarked for later review. Track deadlines and application details.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/explore"
              className="btn-primary text-xs py-2 px-3.5 shadow-xs flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Browse Catalog</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-72 bg-white rounded-xl border border-[#E2E8F0] animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 rounded-xl bg-white border border-[#FECACA] text-center space-y-3 max-w-md mx-auto shadow-xs">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#0F172A]">Unable to Load Bookmarks</h3>
              <p className="text-xs text-[#64748B]">{error}</p>
            </div>
            <button
              type="button"
              onClick={loadBookmarks}
              className="btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-10 sm:p-14 text-center max-w-lg mx-auto space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto">
              <Bookmark className="w-6 h-6 text-[#D97706]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#0F172A]">No saved opportunities yet</h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
                When you discover competitions, hackathons, or workshops you like, bookmark them to track dates here.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/explore"
                className="btn-primary text-xs py-2 px-5 inline-flex items-center gap-1.5 shadow-xs"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Explore Opportunities</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <span>
                Showing <strong className="text-[#0F172A] font-semibold">{events.length}</strong> saved opportunity{events.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map((event) => (
                <div key={event.id} className="relative group">
                  <EventCard event={event} />
                  <button
                    type="button"
                    disabled={removingId === event.id}
                    onClick={(e) => handleRemoveBookmark(event.id, e)}
                    aria-label={`Remove ${event.title} from saved`}
                    title="Remove from saved opportunities"
                    className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-lg bg-white/95 border border-[#E2E8F0] text-[#64748B] hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-xs flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
