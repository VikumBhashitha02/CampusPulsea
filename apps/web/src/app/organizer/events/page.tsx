'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PlusCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  XCircle,
  Eye,
  Trash2,
  ArrowUpRight,
  Search,
  RefreshCw,
  Ticket,
  AlertCircle,
} from 'lucide-react';
import type { EventItem } from '../../../services/events.service';
import { eventsService } from '../../../services/events.service';
import { useAuth } from '../../../lib/auth/auth-context';
import { EventStatus, RoleType } from '@campuspulse/types';
import { PageHeader } from '../../../components/ui/page-header';

export default function OrganizerEventsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | EventStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isAuthorized =
    user?.roles?.some((r) =>
      [RoleType.ORGANIZER, RoleType.ADMIN, RoleType.SUPER_ADMIN, RoleType.UNIVERSITY_ADMIN].includes(
        r as RoleType,
      ),
    ) || (user?.organizations && user.organizations.length > 0);

  const loadEvents = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await eventsService.getOrganizerEvents();
      setEvents(data);
    } catch (err: any) {
      console.error('Failed to load organizer events:', err);
      setErrorMessage(err?.message || 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/organizer/events');
      return;
    }

    if (!authLoading && isAuthenticated && !isAuthorized) {
      setErrorMessage('You must have an Organizer role or belong to a campus organization to access this portal.');
      setLoading(false);
      return;
    }

    if (isAuthenticated) {
      loadEvents();
    }
  }, [authLoading, isAuthenticated, isAuthorized]);

  const handleSubmitForReview = async (eventId: string) => {
    setActionLoadingId(eventId);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await eventsService.submitForReview(eventId);
      setSuccessMessage('Event submitted for review! It will become public after administrative moderation.');
      await loadEvents();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to submit event for review.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelEvent = async (eventId: string, title: string) => {
    if (
      !confirm(
        `Are you sure you want to cancel "${title}"? Registered students will see that the event has been cancelled.`,
      )
    ) {
      return;
    }

    setActionLoadingId(eventId);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await eventsService.cancelEvent(eventId);
      setSuccessMessage('Event marked as CANCELLED.');
      await loadEvents();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to cancel event.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteDraft = async (eventId: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete draft "${title}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoadingId(eventId);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await eventsService.deleteDraft(eventId);
      setSuccessMessage('Draft deleted successfully.');
      await loadEvents();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to delete draft.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesTab = activeTab === 'ALL' || e.status === activeTab;
    const matchesSearch =
      !searchQuery.trim() ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case EventStatus.PUBLISHED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Published</span>
          </span>
        );
      case EventStatus.PENDING_REVIEW:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>Pending Review</span>
          </span>
        );
      case EventStatus.DRAFT:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <FileText className="w-3 h-3" />
            <span>Draft</span>
          </span>
        );
      case EventStatus.REJECTED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        );
      case EventStatus.CANCELLED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
            <XCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const getTabCount = (status: 'ALL' | EventStatus) => {
    if (status === 'ALL') return events.length;
    return events.filter((e) => e.status === status).length;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center p-6 text-xs text-cp-muted">
          <div className="w-4 h-4 rounded-full border-2 border-cp-yellow border-t-transparent animate-spin mr-2" />
          <span>Loading Opportunities...</span>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 section-container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/organizer"
            className="inline-flex items-center gap-1 text-xs font-bold text-cp-muted hover:text-cp-navy transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <PageHeader
          title="My Events"
          description="Track, edit, submit, and manage opportunities hosted by your organization."
          eyebrow="Event Operations"
          actions={
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={loadEvents}
                disabled={loading}
                className="p-2.5 rounded-xl border border-cp-border bg-cp-surface text-cp-muted hover:text-cp-navy hover:border-cp-yellow transition-colors"
                title="Refresh Events"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <Link href="/organizer/events/create" className="btn-primary text-xs flex-1 sm:flex-initial">
                <PlusCircle className="w-4 h-4" />
                <span>Create Event</span>
              </Link>
            </div>
          }
        />

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-950 font-bold ml-2">
              ✕
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-700 hover:text-rose-950 font-bold ml-2">
              ✕
            </button>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
              {(
                [
                  { key: 'ALL', label: 'All Events' },
                  { key: EventStatus.PUBLISHED, label: 'Published' },
                  { key: EventStatus.PENDING_REVIEW, label: 'Pending Review' },
                  { key: EventStatus.DRAFT, label: 'Drafts' },
                  { key: EventStatus.REJECTED, label: 'Rejected' },
                  { key: EventStatus.CANCELLED, label: 'Cancelled' },
                ] as const
              ).map((tab) => {
                const count = getTabCount(tab.key);
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-cp-navy text-cp-yellow shadow-xs'
                        : 'bg-cp-surface text-cp-muted hover:text-cp-navy border border-cp-border'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                        isActive ? 'bg-cp-yellow text-cp-navy' : 'bg-cp-bg text-cp-muted'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cp-muted" />
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-cp-surface border border-cp-border rounded-xl text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-16 rounded-2xl bg-cp-surface border border-cp-border flex flex-col items-center justify-center text-center space-y-2 text-xs text-cp-muted">
            <div className="w-5 h-5 rounded-full border-2 border-cp-yellow border-t-transparent animate-spin" />
            <span>Loading opportunities...</span>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="bg-cp-surface rounded-2xl border border-cp-border overflow-hidden">
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs text-cp-navy">
                <thead className="bg-cp-bg border-b border-cp-border text-cp-muted font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Opportunity</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Event Dates</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Engagement</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cp-border">
                  {filteredEvents.map((evt) => {
                    const isActing = actionLoadingId === evt.id;
                    return (
                      <tr key={evt.id} className="hover:bg-cp-bg transition-colors">
                        <td className="py-4 px-4 max-w-xs">
                          <div className="space-y-1">
                            <Link
                              href={`/organizer/events/${evt.id}`}
                              className="font-bold text-cp-navy hover:underline block truncate"
                            >
                              {evt.title}
                            </Link>
                            {evt.rejectionReason && evt.status === EventStatus.REJECTED && (
                              <p className="text-[11px] text-rose-600 line-clamp-1">
                                Reason: {evt.rejectionReason}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-cp-muted">
                          <span className="px-2 py-0.5 rounded bg-cp-bg border border-cp-border text-[11px]">
                            {evt.category?.name || 'General'}
                          </span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-cp-muted">
                          <div>{new Date(evt.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                          {evt.registrationDeadline && (
                            <div className="text-[10px] text-amber-700">
                              Cutoff: {new Date(evt.registrationDeadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          {getStatusBadge(evt.status)}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-cp-muted">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1" title="Views">
                              <Eye className="w-3.5 h-3.5" />
                              <span>{evt.viewCount || 0}</span>
                            </span>
                            <span className="flex items-center gap-1" title="Registrations">
                              <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{evt._count?.registrations || 0}</span>
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {evt.status === EventStatus.DRAFT && (
                              <>
                                <button
                                  onClick={() => handleSubmitForReview(evt.id)}
                                  disabled={isActing}
                                  className="px-2.5 py-1.5 rounded-lg bg-cp-navy text-cp-yellow text-[11px] font-bold hover:bg-black transition-colors"
                                  title="Submit for Review"
                                >
                                  Submit
                                </button>
                                <Link
                                  href={`/organizer/events/${evt.id}`}
                                  className="px-2.5 py-1.5 rounded-lg bg-cp-bg border border-cp-border text-[11px] font-semibold text-cp-navy hover:border-cp-yellow transition-colors"
                                >
                                  Edit
                                </Link>
                                <button
                                  onClick={() => handleDeleteDraft(evt.id, evt.title)}
                                  disabled={isActing}
                                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Delete Draft"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {evt.status === EventStatus.REJECTED && (
                              <>
                                <button
                                  onClick={() => handleSubmitForReview(evt.id)}
                                  disabled={isActing}
                                  className="px-2.5 py-1.5 rounded-lg bg-cp-navy text-cp-yellow text-[11px] font-bold hover:bg-black transition-colors"
                                >
                                  Resubmit
                                </button>
                                <Link
                                  href={`/organizer/events/${evt.id}`}
                                  className="px-2.5 py-1.5 rounded-lg bg-cp-bg border border-cp-border text-[11px] font-semibold text-cp-navy hover:border-cp-yellow transition-colors"
                                >
                                  Edit
                                </Link>
                              </>
                            )}

                            {evt.status === EventStatus.PENDING_REVIEW && (
                              <Link
                                href={`/organizer/events/${evt.id}`}
                                className="px-2.5 py-1.5 rounded-lg bg-cp-bg border border-cp-border text-[11px] font-semibold text-cp-navy hover:border-cp-yellow transition-colors"
                              >
                                View Details
                              </Link>
                            )}

                            {evt.status === EventStatus.PUBLISHED && (
                              <>
                                <Link
                                  href={`/organizer/events/${evt.id}/registrations`}
                                  className="px-2.5 py-1.5 rounded-lg bg-cp-yellow-light border border-[#FDE68A] text-[11px] font-bold text-amber-800 hover:bg-[#FFFDF5] transition-colors flex items-center gap-1"
                                  title="View Registrations"
                                >
                                  <Ticket className="w-3 h-3 text-cp-yellow" />
                                  <span>Regs ({evt._count?.registrations || 0})</span>
                                </Link>
                                <Link
                                  href={`/events/${evt.slug}`}
                                  target="_blank"
                                  className="p-1.5 rounded-lg text-cp-muted hover:text-cp-navy hover:bg-cp-bg transition-colors"
                                  title="View Public Event"
                                >
                                  <ArrowUpRight className="w-4 h-4" />
                                </Link>
                                <Link
                                  href={`/organizer/events/${evt.id}`}
                                  className="px-2.5 py-1.5 rounded-lg bg-cp-bg border border-cp-border text-[11px] font-semibold text-cp-navy hover:border-cp-yellow transition-colors"
                                >
                                  Manage
                                </Link>
                                <button
                                  onClick={() => handleCancelEvent(evt.id, evt.title)}
                                  disabled={isActing}
                                  className="px-2 py-1.5 rounded-lg text-rose-600 text-[11px] font-semibold hover:bg-rose-50 transition-colors"
                                  title="Cancel Event"
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                            {evt.status === EventStatus.CANCELLED && (
                              <Link
                                href={`/organizer/events/${evt.id}`}
                                className="px-2.5 py-1.5 rounded-lg bg-cp-bg border border-cp-border text-[11px] font-semibold text-cp-navy hover:border-cp-yellow transition-colors"
                              >
                                View
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="block lg:hidden divide-y divide-cp-border">
              {filteredEvents.map((evt) => {
                const isActing = actionLoadingId === evt.id;
                return (
                  <div key={evt.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <Link
                          href={`/organizer/events/${evt.id}`}
                          className="text-sm font-bold text-cp-navy hover:underline"
                        >
                          {evt.title}
                        </Link>
                        <p className="text-xs text-cp-muted">
                          {evt.category?.name || 'General'} • {new Date(evt.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      {getStatusBadge(evt.status)}
                    </div>

                    {evt.rejectionReason && evt.status === EventStatus.REJECTED && (
                      <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                        <p className="font-semibold">Rejection reason:</p>
                        <p>{evt.rejectionReason}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-cp-border text-xs text-cp-muted">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{evt.viewCount || 0}</span>
                        </span>
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <Ticket className="w-3.5 h-3.5" />
                          <span>{evt._count?.registrations || 0} regs</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {evt.status === EventStatus.DRAFT && (
                          <button
                            onClick={() => handleSubmitForReview(evt.id)}
                            disabled={isActing}
                            className="px-3 py-1 rounded-lg bg-cp-navy text-cp-yellow text-xs font-bold"
                          >
                            Submit
                          </button>
                        )}
                        {evt.status === EventStatus.REJECTED && (
                          <button
                            onClick={() => handleSubmitForReview(evt.id)}
                            disabled={isActing}
                            className="px-3 py-1 rounded-lg bg-cp-navy text-cp-yellow text-xs font-bold"
                          >
                            Resubmit
                          </button>
                        )}
                        {evt.status === EventStatus.PUBLISHED && (
                          <Link
                            href={`/organizer/events/${evt.id}/registrations`}
                            className="px-3 py-1 rounded-lg bg-cp-yellow-light border border-[#FDE68A] text-xs font-bold text-amber-800"
                          >
                            Regs ({evt._count?.registrations || 0})
                          </Link>
                        )}
                        <Link
                          href={`/organizer/events/${evt.id}`}
                          className="px-3 py-1 rounded-lg bg-cp-bg border border-cp-border text-xs font-semibold text-cp-navy"
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-16 rounded-2xl bg-cp-surface border border-cp-border flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cp-yellow-light text-amber-800 flex items-center justify-center">
              <FileText className="w-6 h-6 text-cp-yellow" />
            </div>
            <h3 className="text-base font-bold text-cp-navy">
              {searchQuery ? 'No matching opportunities found' : 'No opportunities in this tab'}
            </h3>
            <p className="text-xs text-cp-muted max-w-sm">
              {searchQuery
                ? `No opportunities match your filter "${searchQuery}". Try a different keyword.`
                : 'Create and submit new events to engage students across universities.'}
            </p>
            {!searchQuery && (
              <Link href="/organizer/events/create" className="btn-primary text-xs mt-2">
                Create Event
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
