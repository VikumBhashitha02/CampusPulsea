'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  Clock,
  Building2,
  CheckCircle2,
  Bookmark,
  ArrowLeft,
  Compass,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  MapPin,
  ListOrdered,
  CalendarDays,
} from 'lucide-react';
import { useAuth } from '../../../lib/auth/auth-context';
import { registrationsService } from '../../../services/registrations.service';
import { bookmarksService } from '../../../services/bookmarks.service';
import type { EventItem } from '../../../services/events.service';
import { PageHeader } from '../../../components/ui/page-header';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { EmptyState } from '../../../components/ui/empty-state';

interface TimelineItem {
  id: string;
  title: string;
  slug: string;
  date: string;
  itemType: 'EVENT_START' | 'REGISTRATION_DEADLINE';
  source: 'REGISTERED' | 'SAVED';
  organizationName?: string;
  venue?: string | null;
  mode?: string | null;
}

export default function StudentCalendarPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'MONTH'>('UPCOMING');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [savedEvents, setSavedEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login?redirect=/account/calendar');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadCalendarData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [saved, regs] = await Promise.all([
        bookmarksService.getMyBookmarks().catch(() => []),
        registrationsService.getMyRegistrations().catch(() => []),
      ]);
      setSavedEvents(saved);
      setRegistrations(regs);
    } catch (err: any) {
      console.error('Failed to load student calendar data:', err);
      setError('Unable to load your personal calendar. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadCalendarData();
    }
  }, [isAuthenticated, loadCalendarData]);

  const timelineItems = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [];

    registrations.forEach((reg) => {
      if (reg.status === 'CANCELLED') return;
      const ev = reg.event;
      if (ev?.startDate) {
        items.push({
          id: `reg-start-${reg.id}`,
          title: ev.title,
          slug: ev.slug,
          date: ev.startDate,
          itemType: 'EVENT_START',
          source: 'REGISTERED',
          organizationName: ev.organization?.name,
          venue: ev.venue,
          mode: ev.mode,
        });
      }
    });

    savedEvents.forEach((ev) => {
      const isRegistered = registrations.some(
        (r) => r.eventId === ev.id && r.status !== 'CANCELLED',
      );

      if (ev.startDate && !isRegistered) {
        items.push({
          id: `saved-start-${ev.id}`,
          title: ev.title,
          slug: ev.slug,
          date: ev.startDate,
          itemType: 'EVENT_START',
          source: 'SAVED',
          organizationName: ev.organization?.name,
          venue: ev.venue,
          mode: String(ev.mode || ''),
        });
      }

      if (ev.registrationDeadline) {
        items.push({
          id: `saved-deadline-${ev.id}`,
          title: ev.title,
          slug: ev.slug,
          date: ev.registrationDeadline,
          itemType: 'REGISTRATION_DEADLINE',
          source: isRegistered ? 'REGISTERED' : 'SAVED',
          organizationName: ev.organization?.name,
          venue: ev.venue,
          mode: String(ev.mode || ''),
        });
      }
    });

    return items.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [registrations, savedEvents]);

  const { upcomingDeadlines, upcomingSessions } = useMemo(() => {
    const deadlines = timelineItems.filter(
      (item) => item.itemType === 'REGISTRATION_DEADLINE',
    );
    const sessions = timelineItems.filter(
      (item) => item.itemType === 'EVENT_START',
    );
    return {
      upcomingDeadlines: deadlines,
      upcomingSessions: sessions,
    };
  }, [timelineItems]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDay(null);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDay(today.getDate());
  };

  const monthItems = useMemo(() => {
    return timelineItems.filter((item) => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getFullYear() === currentYear &&
        itemDate.getMonth() === currentMonth
      );
    });
  }, [timelineItems, currentYear, currentMonth]);

  const displayedMonthItems = useMemo(() => {
    if (!selectedDay) return monthItems;
    return monthItems.filter(
      (item) => new Date(item.date).getDate() === selectedDay,
    );
  }, [monthItems, selectedDay]);

  const getDeadlineBadge = (deadlineIso: string) => {
    const deadline = new Date(deadlineIso);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
      return <Badge tone="neutral">Closed</Badge>;
    }
    if (diffDays === 0 || diffDays === 1) {
      return <Badge tone="danger">Closing Soon</Badge>;
    }
    if (diffDays <= 7) {
      return <Badge tone="warning">Closes in {diffDays}d</Badge>;
    }
    return <Badge tone="neutral">Closes in {diffDays}d</Badge>;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center p-6 text-xs text-cp-muted">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-cp-yellow border-t-transparent animate-spin" />
            <span>Loading student calendar...</span>
          </div>
        </main>
      </div>
    );
  }

  const isEmpty = timelineItems.length === 0;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 section-container py-8 space-y-8">
        <div>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-xs font-bold text-cp-muted hover:text-cp-navy transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Account</span>
          </Link>
        </div>

        <PageHeader
          title="My Calendar"
          description="Keep track of events, registration deadlines, and important dates."
          eyebrow="Student Calendar"
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('UPCOMING')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'UPCOMING'
                    ? 'bg-cp-navy text-cp-yellow shadow-xs'
                    : 'bg-cp-surface text-cp-muted hover:text-cp-navy border border-cp-border'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Upcoming List</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('MONTH')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'MONTH'
                    ? 'bg-cp-navy text-cp-yellow shadow-xs'
                    : 'bg-cp-surface text-cp-muted hover:text-cp-navy border border-cp-border'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Month Matrix</span>
              </button>
            </div>
          }
        />

        {loading ? (
          <div className="space-y-4">
            <div className="h-40 bg-cp-surface rounded-2xl border border-cp-border animate-pulse" />
            <div className="h-60 bg-cp-surface rounded-2xl border border-cp-border animate-pulse" />
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-cp-surface border border-cp-border text-center space-y-4 max-w-md mx-auto">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-cp-navy">Unable to Load Calendar</h3>
              <p className="text-xs text-cp-muted">{error}</p>
            </div>
            <button
              type="button"
              onClick={loadCalendarData}
              className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        ) : isEmpty ? (
          <EmptyState
            icon={CalendarIcon}
            title="Your calendar is empty"
            description="Save or register for opportunities to keep track of important dates and deadlines here."
            action={{
              label: 'Explore Opportunities',
              href: '/explore',
            }}
          />
        ) : activeTab === 'UPCOMING' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-cp-border">
                <h2 className="text-sm font-extrabold text-cp-navy uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-500" />
                  <span>Registration Deadlines</span>
                </h2>
                <Badge tone="neutral">
                  {upcomingDeadlines.length} deadline{upcomingDeadlines.length === 1 ? '' : 's'}
                </Badge>
              </div>

              {upcomingDeadlines.length === 0 ? (
                <Card className="p-6 text-center text-xs text-cp-muted">
                  No upcoming registration deadlines for your saved opportunities.
                </Card>
              ) : (
                <div className="space-y-3">
                  {upcomingDeadlines.map((item) => {
                    const itemDate = new Date(item.date);
                    const formatted = itemDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });

                    return (
                      <Card
                        key={item.id}
                        hover
                        className="p-4 space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge tone="danger">Deadline</Badge>
                            {getDeadlineBadge(item.date)}
                          </div>
                          <span className="text-xs font-semibold text-cp-navy">
                            {formatted}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <Link
                            href={`/events/${item.slug}`}
                            className="text-sm font-bold text-cp-navy hover:text-cp-accent transition-colors line-clamp-1"
                          >
                            {item.title}
                          </Link>
                          {item.organizationName && (
                            <p className="text-xs text-cp-muted flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-cp-yellow" />
                              <span>{item.organizationName}</span>
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-cp-border flex items-center justify-between text-xs">
                          <span className="text-cp-muted">
                            Source: <strong className="text-cp-navy">{item.source === 'REGISTERED' ? 'Registered' : 'Saved Opportunity'}</strong>
                          </span>
                          <Link
                            href={`/events/${item.slug}`}
                            className="text-xs font-bold text-amber-800 hover:underline inline-flex items-center gap-1"
                          >
                            <span>View Event</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-cp-border">
                <h2 className="text-sm font-extrabold text-cp-navy uppercase tracking-wider flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-cp-yellow" />
                  <span>Events & Sessions</span>
                </h2>
                <Badge tone="neutral">
                  {upcomingSessions.length} session{upcomingSessions.length === 1 ? '' : 's'}
                </Badge>
              </div>

              {upcomingSessions.length === 0 ? (
                <Card className="p-6 text-center text-xs text-cp-muted">
                  No upcoming event sessions on your calendar.
                </Card>
              ) : (
                <div className="space-y-3">
                  {upcomingSessions.map((item) => {
                    const itemDate = new Date(item.date);
                    const formatted = itemDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                    const isRegistered = item.source === 'REGISTERED';

                    return (
                      <Card
                        key={item.id}
                        hover
                        className={`p-4 space-y-2.5 ${
                          isRegistered ? 'border-emerald-200 bg-emerald-50/20' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {isRegistered ? (
                              <Badge tone="success" className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Registered Event</span>
                              </Badge>
                            ) : (
                              <Badge tone="accent" className="flex items-center gap-1">
                                <Bookmark className="w-3 h-3" />
                                <span>Saved Opportunity</span>
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-cp-navy">
                            {formatted}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <Link
                            href={`/events/${item.slug}`}
                            className="text-sm font-bold text-cp-navy hover:text-cp-accent transition-colors line-clamp-1"
                          >
                            {item.title}
                          </Link>
                          <div className="flex items-center gap-3 text-xs text-cp-muted flex-wrap">
                            {item.organizationName && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-cp-yellow" />
                                <span>{item.organizationName}</span>
                              </span>
                            )}
                            {item.venue && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-cp-muted" />
                                <span>{item.venue}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-cp-border flex items-center justify-between text-xs">
                          <span className="text-cp-muted">
                            Mode: <strong className="text-cp-navy">{item.mode || 'In-Person'}</strong>
                          </span>
                          <Link
                            href={`/events/${item.slug}`}
                            className="text-xs font-bold text-amber-800 hover:underline inline-flex items-center gap-1"
                          >
                            <span>Event Details</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <Card className="lg:col-span-7 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-cp-navy">
                  {monthNames[currentMonth]} {currentYear}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToday}
                    className="px-3 py-1 rounded-md bg-cp-bg border border-cp-border text-xs font-semibold text-cp-navy hover:bg-slate-100 transition-colors"
                  >
                    Today
                  </button>
                  <div className="flex items-center border border-cp-border rounded-lg">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1.5 hover:bg-cp-bg rounded-l-lg transition-colors"
                      aria-label="Previous Month"
                    >
                      <ChevronLeft className="w-4 h-4 text-cp-muted" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1.5 hover:bg-cp-bg rounded-r-lg transition-colors border-l border-cp-border"
                      aria-label="Next Month"
                    >
                      <ChevronRight className="w-4 h-4 text-cp-muted" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-7 text-center font-semibold text-[11px] text-cp-muted pb-2 border-b border-cp-border">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-14 sm:h-16 bg-cp-bg/50 rounded-lg" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const isSelected = selectedDay === dayNum;
                  const isToday =
                    new Date().getDate() === dayNum &&
                    new Date().getMonth() === currentMonth &&
                    new Date().getFullYear() === currentYear;

                  const dayEntries = monthItems.filter(
                    (e) => new Date(e.date).getDate() === dayNum,
                  );

                  const hasDeadline = dayEntries.some(
                    (e) => e.itemType === 'REGISTRATION_DEADLINE',
                  );
                  const hasRegistered = dayEntries.some(
                    (e) => e.source === 'REGISTERED' && e.itemType === 'EVENT_START',
                  );
                  const hasSaved = dayEntries.some(
                    (e) => e.source === 'SAVED' && e.itemType === 'EVENT_START',
                  );

                  return (
                    <button
                      key={`day-${dayNum}`}
                      type="button"
                      onClick={() => setSelectedDay(isSelected ? null : dayNum)}
                      className={`h-14 sm:h-16 p-1.5 rounded-lg text-left flex flex-col justify-between transition-all border ${
                        isSelected
                          ? 'bg-amber-50 border-amber-300 shadow-xs'
                          : isToday
                            ? 'bg-cp-bg border-cp-navy'
                            : 'bg-cp-surface border-cp-border hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`text-xs font-bold ${
                            isToday
                              ? 'w-5 h-5 rounded-full bg-cp-navy text-white flex items-center justify-center text-[10px]'
                              : isSelected
                                ? 'text-amber-800 font-black'
                                : 'text-cp-navy'
                          }`}
                        >
                          {dayNum}
                        </span>

                        {dayEntries.length > 0 && (
                          <span className="text-[10px] text-cp-muted font-semibold hidden sm:inline">
                            {dayEntries.length}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {hasRegistered && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Registered event" />
                        )}
                        {hasSaved && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Saved opportunity" />
                        )}
                        {hasDeadline && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Deadline" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-cp-border flex items-center gap-4 text-[11px] text-cp-muted flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Registered Event</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Saved Event</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Registration Deadline</span>
                </div>
              </div>
            </Card>

            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-cp-border">
                <h3 className="text-sm font-bold text-cp-navy">
                  {selectedDay
                    ? `${monthNames[currentMonth]} ${selectedDay} Agenda`
                    : `Month Overview (${monthItems.length} entries)`}
                </h3>
                {selectedDay && (
                  <button
                    type="button"
                    onClick={() => setSelectedDay(null)}
                    className="text-xs font-bold text-amber-800 hover:underline"
                  >
                    View Entire Month
                  </button>
                )}
              </div>

              {displayedMonthItems.length === 0 ? (
                <Card className="p-6 text-center text-xs text-cp-muted">
                  No opportunities or deadlines scheduled for this selection.
                </Card>
              ) : (
                <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                  {displayedMonthItems.map((item) => {
                    const isDeadline = item.itemType === 'REGISTRATION_DEADLINE';
                    const isRegistered = item.source === 'REGISTERED';

                    return (
                      <Card
                        key={item.id}
                        className={`p-4 space-y-2 ${
                          isDeadline
                            ? 'border-rose-200 bg-rose-50/20'
                            : isRegistered
                              ? 'border-emerald-200 bg-emerald-50/20'
                              : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Badge
                            tone={isDeadline ? 'danger' : isRegistered ? 'success' : 'neutral'}
                          >
                            {isDeadline ? 'DEADLINE' : isRegistered ? 'REGISTERED' : 'SAVED'}
                          </Badge>
                          <span className="text-xs font-semibold text-cp-muted">
                            {new Date(item.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        <Link
                          href={`/events/${item.slug}`}
                          className="text-xs font-bold text-cp-navy hover:text-cp-accent line-clamp-1 block"
                        >
                          {item.title}
                        </Link>

                        {item.organizationName && (
                          <p className="text-[11px] text-cp-muted flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-cp-yellow" />
                            <span>{item.organizationName}</span>
                          </p>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
