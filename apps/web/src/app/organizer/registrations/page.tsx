'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ticket, ArrowUpRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../lib/auth/auth-context';
import { eventsService } from '../../../services/events.service';
import type { EventItem } from '../../../services/events.service';
import { isOrganizerUser } from '../../../lib/navigation';
import { PageHeader } from '../../../components/ui/page-header';

export default function OrganizerRegistrationsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthorized = isOrganizerUser(user);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/organizer/registrations');
      return;
    }

    if (!authLoading && isAuthenticated && !isAuthorized) {
      setError('You must have an Organizer role or belong to a campus organization to access this portal.');
      setLoading(false);
      return;
    }

    if (isAuthenticated && isAuthorized) {
      eventsService
        .getOrganizerEvents()
        .then((data) => setEvents(data))
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : 'Failed to load registrations.');
        })
        .finally(() => setLoading(false));
    }
  }, [authLoading, isAuthenticated, isAuthorized, router]);

  if (authLoading || loading) {
    return (
      <main className="flex-1 flex items-center justify-center p-6 text-sm text-cp-muted">
        Loading registrations...
      </main>
    );
  }

  if (error && events.length === 0) {
    return (
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-page-title text-cp-navy">Organizer access required</h1>
        <p className="text-body text-cp-muted">{error}</p>
        <Link href="/account" className="btn-secondary text-sm inline-flex">
          Go to student account
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 section-container py-8 space-y-6">
      <PageHeader
        title="Registrations"
        description="Review who has registered for your opportunities."
      />

      {events.length === 0 ? (
        <div className="rounded-2xl border border-cp-border bg-cp-surface p-10 text-center space-y-2">
          <Ticket className="w-6 h-6 text-cp-muted mx-auto" />
          <h2 className="text-section-title text-cp-navy">No opportunities yet</h2>
          <p className="text-body text-cp-muted">Create an opportunity to start collecting registrations.</p>
          <Link href="/organizer/events/create" className="btn-primary text-sm inline-flex mt-2">
            Create opportunity
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <li
              key={event.id}
              className="rounded-2xl border border-cp-border bg-cp-surface p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-cp-navy truncate">{event.title}</h2>
                <p className="text-meta text-cp-muted">
                  {event._count?.registrations ?? 0} registrations
                  {event.status ? ` · ${String(event.status).replaceAll('_', ' ')}` : ''}
                </p>
              </div>
              <Link
                href={`/organizer/events/${event.id}/registrations`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-cp-navy hover:text-black"
              >
                View registrations
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
