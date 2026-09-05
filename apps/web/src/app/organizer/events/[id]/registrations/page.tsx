'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  Users,
  Ticket,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  ExternalLink,
  Info,
  GraduationCap,
} from 'lucide-react';
import { eventsService } from '../../../../../services/events.service';
import type {
  EventRegistrationItem,
  EventRegistrationsResponse,
} from '../../../../../services/events.service';
import { useAuth } from '../../../../../lib/auth/auth-context';
import { RegistrationStatus, RoleType } from '@campuspulse/types';
import { Button } from '../../../../../components/ui/button';

export default function OrganizerEventRegistrationsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [data, setData] = useState<EventRegistrationsResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | RegistrationStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedReg, setSelectedReg] = useState<EventRegistrationItem | null>(null);

  const isAuthorized =
    user?.roles?.some((r) =>
      [RoleType.ORGANIZER, RoleType.ADMIN, RoleType.SUPER_ADMIN, RoleType.UNIVERSITY_ADMIN].includes(
        r as RoleType,
      ),
    ) || (user?.organizations && user.organizations.length > 0);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const res = await eventsService.getEventRegistrations(
        id,
        activeTab === 'ALL' ? undefined : activeTab,
        searchQuery || undefined,
      );
      setData(res);
    } catch (err) {
      console.error('Failed to load event registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/organizer/events/${id}/registrations`);
      return;
    }

    if (!authLoading && isAuthenticated && !isAuthorized) {
      setLoading(false);
      return;
    }

    if (isAuthenticated) {
      loadRegistrations();
    }
  }, [id, activeTab, authLoading, isAuthenticated, isAuthorized]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadRegistrations();
  };

  const getStatusBadge = (status: RegistrationStatus) => {
    switch (status) {
      case RegistrationStatus.REGISTERED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Registered
          </span>
        );
      case RegistrationStatus.CANCELLED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-500" />
            Cancelled
          </span>
        );
      case RegistrationStatus.WAITLISTED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Waitlisted
          </span>
        );
      case RegistrationStatus.ATTENDED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            Attended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const event = data?.event;
  const summary = data?.summary;
  const items = data?.items || [];

  const registeredCount = summary?.registered || 0;
  const capacity = summary?.capacity ?? null;
  const capacityPercent =
    capacity && capacity > 0 ? Math.min(Math.round((registeredCount / capacity) * 100), 100) : 0;

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center p-6 text-xs text-cp-muted">
          <div className="w-4 h-4 rounded-full border-2 border-cp-yellow border-t-transparent animate-spin mr-2" />
          <span>Loading registrations...</span>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 section-container py-8 space-y-8">
        <div className="space-y-1">
          <Link
            href={`/organizer/events/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-cp-muted hover:text-cp-navy transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Opportunity Details</span>
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-page-title text-cp-navy">Registrations</h1>
            {event && (
              <span className="text-xs font-bold text-cp-muted bg-cp-surface px-2.5 py-1 rounded-lg border border-cp-border">
                {event.title}
              </span>
            )}
          </div>
          <p className="text-body text-cp-muted">
            View and manage students registered for this opportunity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {event?.slug && (
            <Link
              href={`/events/${event.slug}`}
              target="_blank"
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              <span>View Public Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {event?.registrationUrl && (
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-blue-900">
              <p className="font-bold">External Registration Link Active</p>
              <p className="text-blue-700 leading-relaxed">
                Official registrations for this opportunity are managed on an external portal (
                <span className="font-semibold underline truncate inline-block max-w-xs align-bottom">
                  {event.registrationUrl}
                </span>
                ). The records below represent CampusPulse students who clicked RSVP to register and track this event.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-cp-muted font-semibold">
              <span>Total Registrations</span>
              <Ticket className="w-4 h-4 text-cp-navy" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-cp-navy">
              {(summary?.total || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-cp-muted">All-time student records</p>
          </div>

          <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-cp-muted font-semibold">
              <span>Active Confirmed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-700">
              {(summary?.registered || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-cp-muted">Current active RSVPs</p>
          </div>

          <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-cp-muted font-semibold">
              <span>Cancelled</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-rose-700">
              {(summary?.cancelled || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-cp-muted">Withdrawn registrations</p>
          </div>

          <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-cp-muted font-semibold">
              <span>Capacity Occupancy</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-blue-700">
              {capacity ? `${registeredCount} / ${capacity}` : `${registeredCount} (Unlimited)`}
            </div>
            {capacity ? (
              <div className="w-full bg-cp-border rounded-full h-1.5 overflow-hidden mt-1">
                <div
                  className="bg-cp-yellow h-full rounded-full transition-all duration-500"
                  style={{ width: `${capacityPercent}%` }}
                />
              </div>
            ) : (
              <p className="text-[11px] text-cp-muted">No attendee cap set</p>
            )}
          </div>
        </div>

        <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
              {(['ALL', RegistrationStatus.REGISTERED, RegistrationStatus.CANCELLED, RegistrationStatus.WAITLISTED, RegistrationStatus.ATTENDED] as const).map(
                (tab) => {
                  const isActive = activeTab === tab;
                  const label =
                    tab === 'ALL'
                      ? `All (${summary?.total || 0})`
                      : tab === RegistrationStatus.REGISTERED
                        ? `Registered (${summary?.registered || 0})`
                        : tab === RegistrationStatus.CANCELLED
                          ? `Cancelled (${summary?.cancelled || 0})`
                          : tab === RegistrationStatus.WAITLISTED
                            ? `Waitlisted (${summary?.waitlisted || 0})`
                            : `Attended (${summary?.attended || 0})`;

                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-cp-navy text-white shadow-xs'
                          : 'bg-cp-bg text-cp-muted hover:text-cp-navy hover:bg-cp-border/50'
                      }`}
                    >
                      {label}
                    </button>
                  );
                },
              )}
            </div>

            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-cp-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
              />
            </form>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <div className="w-6 h-6 rounded-full border-2 border-cp-yellow border-t-transparent animate-spin" />
              <p className="text-xs text-cp-muted">Loading registrations...</p>
            </div>
          ) : items.length > 0 ? (
            <div className="space-y-4">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-cp-border text-cp-muted font-bold">
                      <th className="pb-3 px-3">Student</th>
                      <th className="pb-3 px-3">University & Faculty</th>
                      <th className="pb-3 px-3">Registered Date</th>
                      <th className="pb-3 px-3">Notes</th>
                      <th className="pb-3 px-3">Status</th>
                      <th className="pb-3 px-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cp-border">
                    {items.map((reg) => (
                      <tr key={reg.id} className="hover:bg-cp-bg transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-cp-yellow-light text-amber-800 font-bold flex items-center justify-center shrink-0 overflow-hidden text-xs">
                              {reg.user.avatarUrl ? (
                                <img
                                  src={reg.user.avatarUrl}
                                  alt={reg.user.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                reg.user.name?.charAt(0) || 'S'
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-cp-navy">{reg.user.name}</p>
                              <p className="text-[11px] text-cp-muted">{reg.user.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-cp-muted">
                          <p className="font-semibold text-cp-navy">
                            {reg.user.studentProfile?.university?.name || 'Affiliated Campus'}
                          </p>
                          <p className="text-[11px] text-cp-muted">
                            {reg.user.studentProfile?.faculty?.name ||
                              reg.user.studentProfile?.department?.name ||
                              'General Student'}
                          </p>
                        </td>

                        <td className="py-3.5 px-3 text-cp-muted whitespace-nowrap">
                          {new Date(reg.registeredAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>

                        <td className="py-3.5 px-3 text-cp-muted max-w-xs truncate">
                          {reg.notes ? (
                            <span className="italic text-cp-navy">"{reg.notes}"</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">{getStatusBadge(reg.status)}</td>

                        <td className="py-3.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedReg(reg)}
                            className="px-2.5 py-1 text-xs font-semibold text-cp-navy bg-cp-bg hover:bg-cp-yellow-light border border-cp-border rounded-lg transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3">
                {items.map((reg) => (
                  <div
                    key={reg.id}
                    onClick={() => setSelectedReg(reg)}
                    className="p-4 rounded-xl bg-cp-bg border border-cp-border space-y-3 cursor-pointer hover:border-cp-yellow transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-cp-yellow-light text-amber-800 font-bold flex items-center justify-center shrink-0 text-xs">
                          {reg.user.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-cp-navy">{reg.user.name}</p>
                          <p className="text-[11px] text-cp-muted">{reg.user.email}</p>
                        </div>
                      </div>
                      {getStatusBadge(reg.status)}
                    </div>

                    <div className="text-[11px] text-cp-muted space-y-1">
                      <p className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-cp-muted" />
                        <span>{reg.user.studentProfile?.university?.name || 'Affiliated Campus'}</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-cp-muted" />
                        <span>
                          Registered{' '}
                          {new Date(reg.registeredAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </p>
                      {reg.notes && (
                        <p className="italic text-cp-navy pt-1">"{reg.notes}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cp-yellow-light text-amber-800 flex items-center justify-center">
                <Users className="w-6 h-6 text-cp-yellow" />
              </div>
              <p className="text-xs font-bold text-cp-navy">No registrations found</p>
              <p className="text-xs text-cp-muted max-w-sm">
                {searchQuery
                  ? `No registrations match your search term "${searchQuery}".`
                  : activeTab !== 'ALL'
                    ? `No registrations with status "${activeTab}".`
                    : 'Students have not registered for this opportunity yet.'}
              </p>
            </div>
          )}
        </div>

        {selectedReg && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-cp-surface rounded-3xl border border-cp-border max-w-md w-full p-6 space-y-5 shadow-xl">
              <div className="flex items-start justify-between pb-3 border-b border-cp-border">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-cp-navy">Registration Details</h3>
                  <p className="text-[11px] text-cp-muted">
                    Student RSVP information for this opportunity.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReg(null)}
                  className="p-1.5 rounded-lg text-cp-muted hover:bg-cp-bg hover:text-cp-navy"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-cp-bg border border-cp-border">
                  <div className="w-10 h-10 rounded-full bg-cp-yellow-light text-amber-800 font-bold flex items-center justify-center text-sm">
                    {selectedReg.user.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <p className="font-bold text-cp-navy">{selectedReg.user.name}</p>
                    <p className="text-cp-muted text-[11px]">{selectedReg.user.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-cp-border">
                    <span className="text-cp-muted">Status</span>
                    {getStatusBadge(selectedReg.status)}
                  </div>
                  <div className="flex justify-between py-1 border-b border-cp-border">
                    <span className="text-cp-muted">University</span>
                    <span className="font-semibold text-cp-navy">
                      {selectedReg.user.studentProfile?.university?.name || 'General Campus'}
                    </span>
                  </div>
                  {selectedReg.user.studentProfile?.faculty?.name && (
                    <div className="flex justify-between py-1 border-b border-cp-border">
                      <span className="text-cp-muted">Faculty</span>
                      <span className="font-semibold text-cp-navy">
                        {selectedReg.user.studentProfile.faculty.name}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-cp-border">
                    <span className="text-cp-muted">Registered At</span>
                    <span className="font-semibold text-cp-navy">
                      {new Date(selectedReg.registeredAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {selectedReg.notes && (
                  <div className="p-3 rounded-xl bg-cp-yellow-light border border-[#FDE68A] space-y-1">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                      Student Notes
                    </span>
                    <p className="text-xs text-cp-navy italic">"{selectedReg.notes}"</p>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Button variant="secondary" onClick={() => setSelectedReg(null)} className="w-full text-xs">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
