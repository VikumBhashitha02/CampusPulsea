'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  Building2,
  ArrowLeft,
  Clock,
  Search,
  RefreshCw,
  Calendar,
  MapPin,
  ExternalLink,
  Award,
  Lock,
  AlertCircle,
  X,
} from 'lucide-react';
import type { EventItem } from '../../../services/events.service';
import { adminService } from '../../../services/admin.service';
import { useAuth } from '../../../lib/auth/auth-context';
import { EventStatus, RoleType } from '@campuspulse/types';
import { PageHeader } from '../../../components/ui/page-header';
import { Button } from '../../../components/ui/button';

export default function AdminEventsModerationPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | EventStatus>(
    EventStatus.PENDING_REVIEW,
  );
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  const [inspectingEvent, setInspectingEvent] = useState<EventItem | null>(null);
  const [rejectingEvent, setRejectingEvent] = useState<EventItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [approvingEvent, setApprovingEvent] = useState<EventItem | null>(null);

  const isAuthorized =
    user?.roles?.some((r) =>
      [RoleType.ADMIN, RoleType.SUPER_ADMIN].includes(r as RoleType),
    );

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await adminService.getEvents({
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        search: search.trim() || undefined,
        limit: 50,
      });
      setEvents(res.items || []);
    } catch (err) {
      console.error('Failed to load events for moderation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin/events');
      return;
    }

    if (isAuthenticated && isAuthorized) {
      loadEvents();
    } else if (isAuthenticated && !isAuthorized) {
      setLoading(false);
    }
  }, [selectedStatus, authLoading, isAuthenticated, isAuthorized]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadEvents();
  };

  const handleApprove = async () => {
    if (!approvingEvent) return;
    setActionLoading(true);
    try {
      await adminService.approveEvent(approvingEvent.id);
      setEvents((prev) =>
        prev.map((e) =>
          e.id === approvingEvent.id ? { ...e, status: EventStatus.PUBLISHED, rejectionReason: undefined } : e,
        ),
      );
      setNotification({
        type: 'success',
        message: `Opportunity "${approvingEvent.title}" approved successfully and published live.`,
      });
      setApprovingEvent(null);
      if (inspectingEvent?.id === approvingEvent.id) {
        setInspectingEvent((prev) => (prev ? { ...prev, status: EventStatus.PUBLISHED } : null));
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to approve event.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingEvent) return;
    if (!rejectReason.trim()) {
      setNotification({
        type: 'error',
        message: 'A rejection reason is required to give actionable feedback to the organizer.',
      });
      return;
    }

    setActionLoading(true);
    try {
      await adminService.rejectEvent(rejectingEvent.id, rejectReason.trim());
      setEvents((prev) =>
        prev.map((e) =>
          e.id === rejectingEvent.id
            ? { ...e, status: EventStatus.REJECTED, rejectionReason: rejectReason.trim() }
            : e,
        ),
      );
      setNotification({
        type: 'success',
        message: `Opportunity "${rejectingEvent.title}" was declined and feedback recorded for the organizer.`,
      });
      setRejectingEvent(null);
      setRejectReason('');
      if (inspectingEvent?.id === rejectingEvent.id) {
        setInspectingEvent((prev) =>
          prev ? { ...prev, status: EventStatus.REJECTED, rejectionReason: rejectReason.trim() } : null,
        );
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to reject event.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDetectExpired = async () => {
    setActionLoading(true);
    try {
      const res = await adminService.detectExpiredEvents();
      setNotification({
        type: 'success',
        message: res.message,
      });
      loadEvents();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to scan catalog for expired events.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case EventStatus.PUBLISHED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Published</span>
          </span>
        );
      case EventStatus.PENDING_REVIEW:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cp-yellow-light text-amber-800 border border-[#FDE68A]">
            <Clock className="w-3 h-3 text-cp-yellow" />
            <span>Pending Review</span>
          </span>
        );
      case EventStatus.REJECTED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        );
      case EventStatus.CANCELLED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <span>Cancelled</span>
          </span>
        );
      case EventStatus.EXPIRED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <span>Concluded</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <span>Draft</span>
          </span>
        );
    }
  };

  if (authLoading || (loading && events.length === 0)) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-cp-yellow border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-cp-muted">Loading moderation queue...</p>
          </div>
        </main>
      </div>
    );
  }

  if (isAuthenticated && !isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 max-w-lg w-full mx-auto px-4 py-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-page-title text-cp-navy">Access Restricted</h1>
          <p className="text-body text-cp-muted leading-relaxed">
            Event Moderation is reserved for authorized platform administrators and moderators.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Link href="/" className="btn-secondary text-xs">
              Return Home
            </Link>
            <Link href="/organizer/events" className="btn-primary text-xs">
              Organizer Hub
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 section-container py-8 sm:py-10 space-y-6">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-cp-muted hover:text-cp-navy transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Dashboard</span>
          </Link>
        </div>

        <PageHeader
          title="Event Moderation Queue"
          description="Inspect, verify, approve, or reject student opportunities submitted across universities."
          eyebrow="Moderation Review Center"
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm" onClick={handleDetectExpired} disabled={actionLoading} variant="secondary">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                <span>Scan Expired Events</span>
              </Button>
              <button
                onClick={loadEvents}
                disabled={loading}
                className="p-2.5 rounded-xl border border-cp-border bg-cp-surface text-cp-muted hover:text-cp-navy transition-colors"
                title="Refresh Queue"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          }
        />

        {notification && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
              notification.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="font-bold ml-2">
              ✕
            </button>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: EventStatus.PENDING_REVIEW, label: 'Pending Review' },
              { id: EventStatus.PUBLISHED, label: 'Published' },
              { id: EventStatus.REJECTED, label: 'Rejected' },
              { id: EventStatus.CANCELLED, label: 'Cancelled' },
              { id: EventStatus.EXPIRED, label: 'Concluded' },
              { id: 'ALL', label: 'All Events' },
            ].map((tab) => {
              const active = selectedStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatus(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-cp-navy text-cp-yellow shadow-xs'
                      : 'bg-cp-surface text-cp-muted hover:text-cp-navy border border-cp-border'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSearchSubmit} className="relative max-w-md">
            <Search className="w-4 h-4 text-cp-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search opportunity by title..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-cp-surface border border-cp-border text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
            />
          </form>
        </div>

        {events.length > 0 ? (
          <div className="bg-cp-surface rounded-2xl border border-cp-border overflow-hidden">
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cp-bg border-b border-cp-border text-cp-muted font-bold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Opportunity</th>
                    <th className="py-3.5 px-4">Organizer</th>
                    <th className="py-3.5 px-4">Category / Mode</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-6 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cp-border">
                  {events.map((evt) => (
                    <tr key={evt.id} className="hover:bg-cp-bg transition-colors">
                      <td className="py-4 px-6">
                        <div className="space-y-1 max-w-xs">
                          <button
                            type="button"
                            onClick={() => setInspectingEvent(evt)}
                            className="font-bold text-cp-navy hover:text-amber-800 transition-colors text-left line-clamp-1 block"
                          >
                            {evt.title}
                          </button>
                          <p className="text-[11px] text-cp-muted line-clamp-1">
                            {evt.shortDescription || evt.description}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-cp-navy font-medium">
                          <Building2 className="w-3.5 h-3.5 text-cp-muted" />
                          <span>{evt.organization?.name || 'Club Organizer'}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="px-2 py-0.5 rounded bg-cp-bg border border-cp-border text-[11px] font-semibold text-cp-navy">
                            {evt.category?.name || 'General'}
                          </span>
                          <div className="text-[10px] text-cp-muted uppercase font-bold">{evt.mode}</div>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-cp-muted">
                        <div>
                          {new Date(evt.startDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        {evt.registrationDeadline && (
                          <div className="text-[10px] text-amber-700 font-medium">
                            Deadline:{' '}
                            {new Date(evt.registrationDeadline).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">{getStatusBadge(evt.status)}</td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setInspectingEvent(evt)}
                            className="px-2.5 py-1.5 rounded-lg bg-cp-bg border border-cp-border text-[11px] font-semibold text-cp-navy hover:border-cp-yellow transition-colors"
                          >
                            Inspect
                          </button>

                          {evt.status === EventStatus.PENDING_REVIEW && (
                            <>
                              <button
                                type="button"
                                onClick={() => setApprovingEvent(evt)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-500 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectingEvent(evt);
                                  setRejectReason('');
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold hover:bg-rose-100 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="block lg:hidden divide-y divide-cp-border">
              {events.map((evt) => (
                <div key={evt.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => setInspectingEvent(evt)}
                        className="font-bold text-cp-navy text-sm text-left hover:underline line-clamp-1"
                      >
                        {evt.title}
                      </button>
                      <p className="text-xs text-cp-muted">
                        By <span className="font-semibold text-cp-navy">{evt.organization?.name || 'Club'}</span>
                      </p>
                    </div>
                    {getStatusBadge(evt.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-cp-muted">
                    <span>Mode: <strong className="text-cp-navy">{evt.mode}</strong></span>
                    <span>•</span>
                    <span>
                      {new Date(evt.startDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setInspectingEvent(evt)}
                      className="px-3 py-1.5 rounded-lg bg-cp-bg border border-cp-border text-xs font-semibold text-cp-navy"
                    >
                      Inspect Details
                    </button>
                    {evt.status === EventStatus.PENDING_REVIEW && (
                      <>
                        <button
                          type="button"
                          onClick={() => setApprovingEvent(evt)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRejectingEvent(evt);
                            setRejectReason('');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-16 rounded-2xl bg-cp-surface border border-cp-border text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cp-yellow-light text-amber-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-cp-yellow" />
            </div>
            <h3 className="text-base font-bold text-cp-navy">
              {selectedStatus === EventStatus.PENDING_REVIEW
                ? 'Review Queue is All Caught Up!'
                : 'No Opportunities Found'}
            </h3>
            <p className="text-xs text-cp-muted max-w-md mx-auto">
              {selectedStatus === EventStatus.PENDING_REVIEW
                ? 'There are currently no new student opportunities waiting for moderation. New submissions will appear here.'
                : 'No opportunities match your current filter criteria.'}
            </p>
          </div>
        )}

        {inspectingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-cp-surface border border-cp-border overflow-hidden">
              <div className="p-5 border-b border-cp-border flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(inspectingEvent.status)}
                    <span className="text-xs text-cp-muted">Mode: {inspectingEvent.mode}</span>
                  </div>
                  <h3 className="text-lg font-bold text-cp-navy">{inspectingEvent.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectingEvent(null)}
                  className="p-1.5 rounded-lg text-cp-muted hover:text-cp-navy hover:bg-cp-bg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-5 text-xs text-cp-navy">
                {inspectingEvent.rejectionReason && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                    <p className="font-bold">Prior Rejection Reason:</p>
                    <p className="font-mono text-[11px]">{inspectingEvent.rejectionReason}</p>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-cp-bg border border-cp-border space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-cp-navy">
                      <Building2 className="w-4 h-4 text-cp-yellow" />
                      <span>{inspectingEvent.organization?.name || 'Club Organizer'}</span>
                    </div>
                    {inspectingEvent.organization?.isVerified && (
                      <span className="badge-yellow text-[10px] font-bold">
                        Verified Club
                      </span>
                    )}
                  </div>
                  <p className="text-cp-muted">
                    Category: <strong className="text-cp-navy">{inspectingEvent.category?.name || 'General'}</strong>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-cp-bg border border-cp-border space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-cp-muted">
                      <Calendar className="w-3.5 h-3.5 text-cp-navy" />
                      <span>Timeline</span>
                    </div>
                    <p>
                      <strong>Starts:</strong> {new Date(inspectingEvent.startDate).toLocaleString()}
                    </p>
                    <p>
                      <strong>Ends:</strong> {new Date(inspectingEvent.endDate).toLocaleString()}
                    </p>
                    {inspectingEvent.registrationDeadline && (
                      <p className="text-amber-800 font-semibold">
                        <strong>Registration Cutoff:</strong>{' '}
                        {new Date(inspectingEvent.registrationDeadline).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-cp-bg border border-cp-border space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-cp-muted">
                      <MapPin className="w-3.5 h-3.5 text-cp-navy" />
                      <span>Location / Venue</span>
                    </div>
                    <p><strong>Mode:</strong> {inspectingEvent.mode}</p>
                    {inspectingEvent.location && <p><strong>Location:</strong> {inspectingEvent.location}</p>}
                    {inspectingEvent.venue && <p><strong>Venue:</strong> {inspectingEvent.venue}</p>}
                    {inspectingEvent.meetingUrl && (
                      <p className="truncate text-blue-700">
                        <strong>Virtual Link:</strong> {inspectingEvent.meetingUrl}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-cp-navy">Opportunity Overview</h4>
                  <p className="p-4 rounded-xl bg-cp-bg border border-cp-border text-cp-muted leading-relaxed whitespace-pre-line">
                    {inspectingEvent.description || inspectingEvent.shortDescription}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {inspectingEvent.skills && inspectingEvent.skills.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-cp-navy">Skills & Tags</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {inspectingEvent.skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-cp-yellow-light border border-[#FDE68A] text-[11px] font-semibold text-amber-800"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {inspectingEvent.teamSize && (
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-cp-navy">Team Requirements</h4>
                      <p className="p-2.5 rounded-xl bg-cp-bg border border-cp-border text-cp-muted">
                        {inspectingEvent.teamSize}
                      </p>
                    </div>
                  )}
                </div>

                {(inspectingEvent.prizeInfo || inspectingEvent.certificateInfo) && (
                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-amber-950">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>Incentives & Credentials</span>
                    </div>
                    {inspectingEvent.prizeInfo && (
                      <p className="text-amber-900">
                        <strong>Prize Pool:</strong> {inspectingEvent.prizeInfo}
                      </p>
                    )}
                    {inspectingEvent.certificateInfo && (
                      <p className="text-amber-900">
                        <strong>Certificates:</strong> {inspectingEvent.certificateInfo}
                      </p>
                    )}
                  </div>
                )}

                {inspectingEvent.registrationUrl && (
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-blue-900">
                    <div>
                      <span className="font-bold block">Official External Portal:</span>
                      <span className="text-[11px] text-blue-700 truncate block max-w-sm">
                        {inspectingEvent.registrationUrl}
                      </span>
                    </div>
                    <a
                      href={inspectingEvent.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center gap-1 shrink-0"
                    >
                      <span>Test URL</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-cp-border bg-cp-bg flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setInspectingEvent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-cp-muted hover:text-cp-navy"
                >
                  Close
                </button>

                {inspectingEvent.status === EventStatus.PENDING_REVIEW && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => {
                      setRejectingEvent(inspectingEvent);
                      setRejectReason('');
                    }} className="text-rose-600 hover:text-rose-700">
                      Reject Submission
                    </Button>
                    <Button size="sm" onClick={() => setApprovingEvent(inspectingEvent)}>
                      Approve & Publish Live
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {approvingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-cp-surface border border-cp-border p-6 space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-cp-navy">Approve this opportunity?</h3>
                <p className="text-xs text-cp-muted leading-relaxed">
                  &quot;{approvingEvent.title}&quot; will become publicly discoverable on the CampusPulse explore catalog and student feeds.
                </p>
              </div>

              <div className="pt-3 border-t border-cp-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setApprovingEvent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-cp-muted hover:text-cp-navy"
                >
                  Cancel
                </button>
                <Button size="sm" onClick={handleApprove} disabled={actionLoading}>
                  {actionLoading ? 'Approving...' : 'Approve & Publish'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {rejectingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-cp-surface border border-cp-border p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-cp-border pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-cp-navy">Decline Opportunity</h3>
                  <p className="text-xs text-cp-muted">
                    Provide actionable feedback so the organizer can revise their draft.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRejectingEvent(null)}
                  className="p-1.5 rounded-lg text-cp-muted hover:text-cp-navy"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleReject} className="space-y-4">
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-cp-navy">Reason for Rejection *</label>
                  <textarea
                    rows={3}
                    required
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Please clarify exact venue capacity and include contact phone number..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-cp-bg border border-cp-border text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="pt-2 border-t border-cp-border flex items-center justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setRejectingEvent(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-cp-muted hover:text-cp-navy"
                  >
                    Cancel
                  </button>
                  <Button size="sm" onClick={handleReject} disabled={actionLoading} className="bg-rose-600 hover:bg-rose-500 text-white">
                    {actionLoading ? 'Recording...' : 'Confirm Rejection'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
