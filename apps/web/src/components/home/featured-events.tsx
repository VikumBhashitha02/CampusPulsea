'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, CalendarDays } from 'lucide-react';
import { EventCard } from '../events/event-card';
import { apiClient } from '../../lib/api/client';
import { EmptyState } from '../ui/empty-state';

export function FeaturedEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await apiClient<any>('/events?limit=6');
      if (response && response.items) {
        setEvents(response.items);
      } else if (Array.isArray(response)) {
        setEvents(response);
      } else {
        setEvents([]);
      }
    } catch (err: any) {
      console.warn('Could not fetch events from backend, using fallback data:', err?.message);
      setEvents([
        {
          id: 'sample-1',
          title: 'MoraHack 2026: Inter-University Software Hackathon',
          slug: 'morahack-2026',
          shortDescription: 'National 24-hour product build challenge for student developers.',
          mode: 'HYBRID',
          startDate: '2026-10-15T09:00:00Z',
          registrationDeadline: '2026-10-01T23:59:59Z',
          isFree: true,
          category: { name: 'Hackathons', slug: 'hackathons' },
          organization: { name: 'IEEE Student Branch', slug: 'ieee-uom', university: { name: 'University of Moratuwa' } },
        },
        {
          id: 'sample-2',
          title: 'Undergraduate AI & Computer Vision Research Fellowship',
          slug: 'ai-fellowship-2026',
          shortDescription: 'Faculty-guided 6-month research grant with stipend and international publication.',
          mode: 'ONLINE',
          startDate: '2026-11-01T09:00:00Z',
          registrationDeadline: '2026-10-15T23:59:59Z',
          isFree: true,
          category: { name: 'Research', slug: 'research' },
          organization: { name: 'ACM Student Chapter', slug: 'acm-uoc', university: { name: 'University of Colombo' } },
        },
        {
          id: 'sample-3',
          title: 'National Collegiate Case Study & FinTech Summit',
          slug: 'fintech-summit-2026',
          shortDescription: 'Solve real-world corporate strategy challenges with industry mentors.',
          mode: 'IN_PERSON',
          location: 'Main Auditorium, Faculty of Management',
          startDate: '2026-11-20T09:00:00Z',
          registrationDeadline: '2026-11-05T23:59:59Z',
          isFree: true,
          category: { name: 'Competitions', slug: 'competitions' },
          organization: { name: 'Finance Association', slug: 'fin-usjp', university: { name: 'University of Sri Jayewardenepura' } },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <section className="bg-white border-b border-[#E2E8F0]">
      <div className="section-container py-14 md:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Trending Opportunities</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] tracking-tight">
              Upcoming Campus Events & Deadlines
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-xl">
              Verified competitions, workshops, and calls for student applications across Sri Lanka.
            </p>
          </div>
          <Link
            href="/explore"
            className="btn-primary text-xs py-2 px-4 shadow-xs self-start sm:self-auto"
          >
            <span>Explore all events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-72 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] animate-pulse"
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            title="No Published Events Yet"
            description="Opportunities are currently being submitted and verified by university student organizers."
            icon={<CalendarDays className="w-5 h-5 text-[#94A3B8]" />}
            action={
              <Link href="/explore" className="btn-secondary text-xs">
                Browse catalog
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.slice(0, 6).map((event) => (
              <EventCard key={event.id || event.slug} event={event} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
