'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Ticket,
  Calendar,
  MapPin,
  Building2,
  ArrowLeft,
  Compass,
  ArrowUpRight,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
} from 'lucide-react';
import { useAuth } from '../../../lib/auth/auth-context';
import type { EventRegistrationItem } from '../../../services/registrations.service';
import { registrationsService } from '../../../services/registrations.service';
import { useToast } from '../../../components/ui/toast';
import { PageHeader } from '../../../components/ui/page-header';

export default function MyRegistrationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [registrations, setRegistrations] = useState<EventRegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login?redirect=/account/registrations');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadRegistrations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await registrationsService.getMyRegistrations();
      setRegistrations(data);
    } catch (err: any) {
      console.error('Failed to load registrations:', err);
      setError('Unable to load your registrations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadRegistrations();
    }
  }, [isAuthenticated, loadRegistrations]);

  const handleCancelRegistration = async (registrationId: string, title: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel your registration for "${title}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setCancellingId(registrationId);
    try {
      await registrationsService.cancelRegistration(registrationId);
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.id === registrationId ? { ...reg, status: 'CANCELLED' } : reg,
        ),
      );
      toast({
        title: 'Registration cancelled',
        description: 'Your registration has been cancelled.',
        tone: 'info',
      });
    } catch (err: any) {
      console.error('Failed to cancel registration:', err);
      toast({
        title: 'Unable to cancel',
        description: 'Please try again later.',
        tone: 'error',
      });
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'REGISTERED':
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Confirmed</span>
          </span>
        );
      case 'PENDING':
      case 'WAITLISTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{status}</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Cancelled</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <Ban className="w-3.5 h-3.5 text-rose-600" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            <span>{status}</span>
          </span>
        );
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
    <div className="flex-1 flex flex-col">
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <Ticket className="w-3.5 h-3.5 text-emerald-600" />
              <span>Event RSVPs</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">My Event Registrations</h1>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Track your confirmed spots, upcoming competition dates, and RSVP details.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/explore"
              className="btn-primary text-xs py-2 px-3.5 shadow-xs flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Catalog</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-28 bg-white rounded-xl border border-[#E2E8F0] animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 rounded-xl bg-white border border-[#FECACA] text-center space-y-3 max-w-md mx-auto shadow-xs">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#0F172A]">Unable to Load Registrations</h3>
              <p className="text-xs text-[#64748B]">{error}</p>
            </div>
            <button
              type="button"
              onClick={loadRegistrations}
              className="btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        ) : registrations.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-10 sm:p-14 text-center max-w-lg mx-auto space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
              <Ticket className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#0F172A]">No registrations yet</h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
                You haven&apos;t registered for any events or opportunities yet. Discover hackathons, workshops, and competitions to get started.
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
                Showing <strong className="text-[#0F172A] font-semibold">{registrations.length}</strong> registration{registrations.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="space-y-3">
              {registrations.map((reg) => {
                const event = reg.event;
                const regDate = new Date(reg.registeredAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const eventDate = event.startDate
                  ? new Date(event.startDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : null;

                const isCancelled = reg.status === 'CANCELLED';

                return (
                  <div
                    key={reg.id}
                    className={`p-5 rounded-xl border transition-all shadow-xs ${
                      isCancelled
                        ? 'border-[#E2E8F0] bg-[#F8FAFC] opacity-75'
                        : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusBadge(reg.status)}
                          {event.organization && (
                            <span className="text-xs font-semibold text-cp-muted flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-cp-yellow" />
                              <span>{event.organization.name}</span>
                            </span>
                          )}
                        </div>
                        <h2 className="text-lg font-bold text-cp-navy hover:text-black transition-colors">
                          <Link href={`/events/${event.slug}`}>{event.title}</Link>
                        </h2>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/events/${event.slug}`}
                          className="btn-secondary text-xs py-2 px-3 inline-flex items-center gap-1.5"
                        >
                          <span>View Opportunity</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                        {!isCancelled && (
                          <button
                            type="button"
                            disabled={cancellingId === reg.id}
                            onClick={() => handleCancelRegistration(reg.id, event.title)}
                            className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                          >
                            {cancellingId === reg.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-cp-border text-xs text-cp-muted">
                      {eventDate && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-cp-yellow shrink-0" />
                          <span>Event Date: <strong className="text-cp-navy font-medium">{eventDate}</strong></span>
                        </div>
                      )}

                      {event.venue && (
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-cp-muted shrink-0" />
                          <span className="truncate">{event.venue}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cp-muted shrink-0" />
                        <span>Registered on {regDate}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
