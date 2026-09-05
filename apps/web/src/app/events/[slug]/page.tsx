import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Award,
  Building2,
  Mail,
  ShieldCheck,
  ArrowLeft,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { EventCard } from '../../../components/events/event-card';
import { EventActionBox } from '../../../components/events/event-action-box';
import type { EventItem } from '../../../services/events.service';
import { eventsService } from '../../../services/events.service';
import { EventMode } from '@campuspulse/types';

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const event = await eventsService.getEventBySlug(slug);
    return {
      title: `${event.title} | CampusPulse`,
      description:
        event.shortDescription ||
        event.description?.slice(0, 160) ||
        'Discover university opportunities on CampusPulse.',
    };
  } catch {
    return {
      title: 'Opportunity Details | CampusPulse',
    };
  }
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;

  let event: EventItem;
  try {
    event = await eventsService.getEventBySlug(slug);
  } catch {
    notFound();
  }

  if (!event) {
    notFound();
  }

  let relatedEvents: EventItem[] = [];
  try {
    const relatedRes = await eventsService.getEvents({
      categorySlug: event.category?.slug,
      limit: 4,
    });
    relatedEvents = (relatedRes.items || []).filter((e) => e.id !== event.id && e.slug !== event.slug).slice(0, 3);
  } catch {
    relatedEvents = [];
  }

  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;
  const deadlineDate = event.registrationDeadline ? new Date(event.registrationDeadline) : null;
  const now = new Date();

  const formattedDate = !isNaN(startDate.getTime())
    ? startDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const formattedTime = !isNaN(startDate.getTime())
    ? `${startDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })}${
        endDate && !isNaN(endDate.getTime())
          ? ` - ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
          : ''
      }`
    : null;

  const formattedDeadline = deadlineDate && !isNaN(deadlineDate.getTime())
    ? deadlineDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const isDeadlinePassed = deadlineDate ? deadlineDate.getTime() < now.getTime() : false;
  const isDeadlineSoon = deadlineDate && !isDeadlinePassed
    ? (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 7
    : false;

  const modeBadge = {
    [EventMode.IN_PERSON]: {
      label: 'In-Person Event',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    [EventMode.ONLINE]: {
      label: 'Online / Virtual',
      color: 'bg-sky-50 text-sky-800 border-sky-200',
    },
    [EventMode.HYBRID]: {
      label: 'Hybrid (Campus & Online)',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
  }[event.mode as EventMode] || { label: String(event.mode || 'Campus Event'), color: 'bg-slate-100 text-slate-800 border-slate-200' };

  const hostUniversity = event.university?.name || event.organization?.university?.name;
  const heroImage = event.bannerUrl || event.coverImageUrl;
  const locationDisplay = event.venue || event.location;

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 section-container py-8 space-y-6">
        <div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Opportunities Catalog</span>
          </Link>
        </div>

        <section className="rounded-xl bg-white border border-[#E2E8F0] shadow-xs overflow-hidden">
          {heroImage ? (
            <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-slate-100 border-b border-[#E2E8F0]">
              <img
                src={heroImage}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-20 bg-[#0F172A] border-b border-[#E2E8F0]" />
          )}

          <div className="p-6 sm:p-7 space-y-3.5">
            <div className="flex flex-wrap items-center gap-2">
              {event.category && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
                  {event.category.name}
                </span>
              )}
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${modeBadge.color}`}>
                {modeBadge.label}
              </span>
              {event.isFree ? (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                  Free Registration
                </span>
              ) : event.price ? (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-[#0F172A] border border-slate-200">
                  {event.currency || 'Rs.'} {event.price.toLocaleString()}
                </span>
              ) : null}
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight leading-snug">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#64748B] pt-2 border-t border-[#F1F5F9]">
              {event.organization && (
                <div className="flex items-center gap-2 font-semibold text-[#0F172A]">
                  <Building2 className="w-4 h-4 text-[#D97706]" />
                  <span>{event.organization.name}</span>
                  {event.organization.isVerified && (
                    <span title="Verified Organization" className="inline-flex items-center">
                      <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                    </span>
                  )}
                </div>
              )}
              {hostUniversity && (
                <div className="flex items-center gap-1.5 text-[#64748B]">
                  <span>•</span>
                  <span>{hostUniversity}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            {event.description && (
              <div className="p-6 sm:p-7 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">About this Opportunity</h2>
                <div className="text-xs sm:text-sm text-[#475569] leading-relaxed whitespace-pre-line">
                  {event.description}
                </div>

                {event.skills && event.skills.length > 0 && (
                  <div className="pt-5 border-t border-cp-border space-y-2.5">
                    <h3 className="text-xs font-bold text-cp-muted uppercase tracking-wider">
                      Relevant Skills & Focus Areas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {event.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 rounded-md text-xs font-semibold bg-cp-bg text-cp-navy border border-cp-border"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {(event.eligibility || event.teamSize) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {event.eligibility && (
                  <div className="p-6 rounded-2xl bg-cp-surface border border-cp-border space-y-2.5">
                    <div className="w-10 h-10 rounded-xl bg-cp-yellow-light border border-amber-200 flex items-center justify-center text-amber-800">
                      <ShieldCheck className="w-5 h-5 text-cp-yellow" />
                    </div>
                    <h3 className="text-sm font-bold text-cp-navy">Eligibility</h3>
                    <p className="text-xs text-cp-muted leading-relaxed">{event.eligibility}</p>
                  </div>
                )}

                {event.teamSize && (
                  <div className="p-6 rounded-2xl bg-cp-surface border border-cp-border space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-cp-bg border border-cp-border flex items-center justify-center text-cp-navy">
                        <Users className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cp-yellow-light text-amber-800 border border-amber-200">
                        Team Finder
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-cp-navy">Team Participation</h3>
                      <p className="text-xs text-cp-muted leading-relaxed">{event.teamSize}</p>
                    </div>
                    <div className="pt-2 border-t border-cp-border flex items-center gap-2">
                      <Link
                        href={`/account/teams?eventId=${event.id}`}
                        className="btn-primary text-xs py-1.5 px-3 flex-1 text-center"
                      >
                        Find Teammates
                      </Link>
                      <Link
                        href={`/account/teams?eventId=${event.id}&create=true`}
                        className="btn-secondary text-xs py-1.5 px-3 flex-1 text-center"
                      >
                        Create Team
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(event.prizeInfo || event.certificateInfo) && (
              <div className="p-6 sm:p-8 rounded-2xl bg-cp-surface border border-cp-border space-y-6">
                <h2 className="text-section-title text-cp-navy">Awards & Recognition</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {event.prizeInfo && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-cp-yellow-light border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
                        <Trophy className="w-5 h-5 text-cp-yellow" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                          Prizes & Perks
                        </h4>
                        <p className="text-xs text-cp-muted leading-relaxed">{event.prizeInfo}</p>
                      </div>
                    </div>
                  )}

                  {event.certificateInfo && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                        <Award className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                          Certification
                        </h4>
                        <p className="text-xs text-cp-muted leading-relaxed">
                          {event.certificateInfo}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {event.organization && (
              <div className="p-6 rounded-2xl bg-cp-surface border border-cp-border space-y-3">
                <h3 className="text-xs font-bold text-cp-muted uppercase tracking-wider">
                  Organized By
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cp-navy text-cp-yellow flex items-center justify-center font-bold text-base">
                    {event.organization.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-cp-navy">
                      {event.organization.name}
                    </h4>
                    {hostUniversity && (
                      <p className="text-xs text-cp-muted">{hostUniversity}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-6 sticky top-28" aria-label="Registration and schedule sidebar">
            <EventActionBox
              eventId={event.id}
              slug={event.slug}
              isFree={event.isFree}
              price={event.price}
              currency={event.currency || 'Rs.'}
              registrationUrl={event.registrationUrl}
              registrationDeadline={event.registrationDeadline}
              title={event.title}
            />

            <div className="p-6 rounded-2xl bg-cp-surface border border-cp-border space-y-4">
              <h3 className="text-xs font-bold text-cp-muted uppercase tracking-wider pb-2 border-b border-cp-border">
                Schedule & Location
              </h3>

              {formattedDate && (
                <div className="flex items-start gap-3 text-cp-navy">
                  <Calendar className="w-4 h-4 text-cp-yellow shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-cp-navy">{formattedDate}</div>
                    {formattedTime && (
                      <div className="text-cp-muted mt-0.5">{formattedTime}</div>
                    )}
                  </div>
                </div>
              )}

              {formattedDeadline && (
                <div className="flex items-start gap-3">
                  <Clock className={`w-4 h-4 shrink-0 mt-0.5 ${isDeadlineSoon ? 'text-amber-500' : isDeadlinePassed ? 'text-rose-500' : 'text-cp-yellow'}`} />
                  <div>
                    <div className="font-bold text-cp-navy">Registration Deadline</div>
                    <div className={`mt-0.5 font-semibold ${isDeadlineSoon ? 'text-amber-600' : isDeadlinePassed ? 'text-rose-600' : 'text-cp-muted'}`}>
                      {formattedDeadline}
                      {isDeadlineSoon && ' (Closing Soon!)'}
                      {isDeadlinePassed && ' (Closed)'}
                    </div>
                  </div>
                </div>
              )}

              {locationDisplay && (
                <div className="flex items-start gap-3 text-cp-navy">
                  <MapPin className="w-4 h-4 text-cp-muted shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-cp-navy">Venue / Location</div>
                    <div className="text-cp-muted mt-0.5">{locationDisplay}</div>
                  </div>
                </div>
              )}

              {event.contactInfo && (
                <div className="flex items-start gap-3 text-cp-navy pt-2 border-t border-cp-border">
                  <Mail className="w-4 h-4 text-cp-yellow shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-cp-navy">Contact Organizers</div>
                    <div className="text-cp-muted mt-0.5 break-all">{event.contactInfo}</div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {relatedEvents.length > 0 && (
          <section className="pt-12 border-t border-cp-border space-y-6" aria-label="Related Opportunities">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-section-title text-cp-navy">
                  Related Opportunities
                </h2>
                <p className="text-xs text-cp-muted mt-1">
                  More events in {event.category?.name || 'this category'}
                </p>
              </div>
              <Link
                href={`/explore?categorySlug=${event.category?.slug || ''}`}
                className="text-xs font-bold text-cp-navy hover:text-amber-800 transition-colors"
              >
                Browse all →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedEvents.map((related) => (
                <EventCard key={related.id || related.slug} event={related} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
