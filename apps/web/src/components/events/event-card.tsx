import React from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Building2, ArrowRight, Clock } from 'lucide-react';
import { EventMode } from '@campuspulse/types';
import { Badge } from '../ui/badge';

export interface EventCardProps {
  event: {
    id: string;
    title: string;
    slug: string;
    shortDescription?: string | null;
    description?: string;
    mode?: string | EventMode;
    location?: string | null;
    venue?: string | null;
    bannerUrl?: string | null;
    coverImageUrl?: string | null;
    startDate: string | Date;
    endDate?: string | Date;
    registrationDeadline?: string | Date | null;
    isFree?: boolean;
    price?: number | null;
    currency?: string;
    featured?: boolean;
    category?: { name: string; slug: string } | null;
    organization?: { name: string; slug: string; university?: { name: string } | null } | null;
    university?: { name: string } | null;
  };
}

export function EventCard({ event }: EventCardProps) {
  const formatDate = (dateInput: string | Date | undefined | null) => {
    if (!dateInput) return null;
    try {
      const d = new Date(dateInput);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  };

  const startDateFormatted = formatDate(event.startDate);
  const deadlineFormatted = formatDate(event.registrationDeadline);
  const uniName = event.university?.name || event.organization?.university?.name;
  const imageSrc = event.bannerUrl || event.coverImageUrl;
  const locationText = event.venue || event.location;

  const modeBadgeText =
    {
      [EventMode.IN_PERSON]: 'In Person',
      [EventMode.ONLINE]: 'Online',
      [EventMode.HYBRID]: 'Hybrid',
    }[event.mode as EventMode] || (event.mode ? event.mode.replace('_', ' ') : null);

  const eventHref = `/events/${event.slug || event.id}`;

  return (
    <article className="group bg-white rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">
      {imageSrc ? (
        <div className="relative h-40 w-full overflow-hidden bg-slate-100 border-b border-[#E2E8F0]">
          <img
            src={imageSrc}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {event.isFree && (
            <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-600 text-white shadow-xs">
              Free
            </span>
          )}
        </div>
      ) : null}

      <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col">
        {/* Category & Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {event.category && <Badge kind="category">{event.category.name}</Badge>}
            {modeBadgeText && <Badge kind="mode">{modeBadgeText}</Badge>}
          </div>
          {!imageSrc && event.isFree ? (
            <Badge kind="free">Free</Badge>
          ) : event.price ? (
            <span className="text-xs font-bold text-[#0F172A]">
              {event.currency || 'Rs.'} {event.price.toLocaleString()}
            </span>
          ) : null}
        </div>

        {/* Title */}
        <div>
          <h3 className="text-sm sm:text-[15px] font-bold text-[#0F172A] group-hover:text-amber-700 transition-colors leading-snug">
            <Link href={eventHref} className="focus:outline-none">
              {event.title}
            </Link>
          </h3>

          {event.shortDescription && (
            <p className="mt-1.5 text-xs text-[#64748B] line-clamp-2 leading-relaxed">
              {event.shortDescription}
            </p>
          )}
        </div>

        {/* Meta / Details footer */}
        <div className="pt-3 space-y-2 text-xs text-[#64748B] border-t border-[#F1F5F9] mt-auto">
          {event.organization && (
            <div className="flex items-center gap-1.5 truncate">
              <Building2 className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
              <span className="truncate font-semibold text-[#0F172A]">
                {event.organization.name}
              </span>
              {uniName && <span className="text-[#94A3B8] truncate">· {uniName}</span>}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {startDateFormatted && (
              <div className="flex items-center gap-1.5 text-[#0F172A] font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                <span>{startDateFormatted}</span>
              </div>
            )}

            {locationText && (
              <div className="flex items-center gap-1.5 truncate text-[#64748B]">
                <MapPin className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                <span className="truncate">{locationText}</span>
              </div>
            )}
          </div>

          {deadlineFormatted && (
            <div className="flex items-center gap-1.5 text-amber-800 font-medium bg-amber-50/80 border border-amber-200/60 px-2 py-0.5 rounded-md w-fit text-[11px]">
              <Clock className="w-3 h-3 shrink-0 text-[#D97706]" />
              <span>Deadline: {deadlineFormatted}</span>
            </div>
          )}
        </div>
      </div>

      <Link
        href={eventHref}
        className="px-4 py-2.5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between text-xs font-semibold text-[#0F172A] group-hover:bg-amber-50/70 group-hover:text-amber-900 transition-colors"
        aria-label={`View details for ${event.title}`}
      >
        <span>View opportunity</span>
        <ArrowRight className="w-3.5 h-3.5 text-[#D97706] transform group-hover:translate-x-1 transition-transform" />
      </Link>
    </article>
  );
}
