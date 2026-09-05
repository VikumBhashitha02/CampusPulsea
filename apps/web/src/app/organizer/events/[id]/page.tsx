'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Send,
  Trash2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
  Ticket,
  Bookmark,
  Save,
  Clock,
  ArrowUpRight,
  Users,
  Sparkles,
} from 'lucide-react';
import type { EventItem } from '../../../../services/events.service';
import { eventsService } from '../../../../services/events.service';
import { useAuth } from '../../../../lib/auth/auth-context';
import { EventStatus, EventMode, RoleType } from '@campuspulse/types';
import { Button } from '../../../../components/ui/button';

export default function ManageEventPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<EventMode>(EventMode.IN_PERSON);
  const [location, setLocation] = useState('');
  const [venue, setVenue] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [skills, setSkills] = useState('');
  const [prizeInfo, setPrizeInfo] = useState('');
  const [certificateInfo, setCertificateInfo] = useState('');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState<number | ''>('');
  const [currency, setCurrency] = useState('LKR');

  const isAuthorized =
    user?.roles?.some((r) =>
      [RoleType.ORGANIZER, RoleType.ADMIN, RoleType.SUPER_ADMIN, RoleType.UNIVERSITY_ADMIN].includes(
        r as RoleType,
      ),
    ) || (user?.organizations && user.organizations.length > 0);

  const loadEvent = async () => {
    setLoading(true);
    setActionMsg(null);
    try {
      const [fetchedEvent, cats] = await Promise.all([
        eventsService.getEventById(id),
        eventsService.getCategories(),
      ]);

      setEvent(fetchedEvent);
      setCategories(cats);

      setTitle(fetchedEvent.title);
      setSlug(fetchedEvent.slug);
      setCategoryId(fetchedEvent.category?.id || (cats[0]?.id ?? ''));
      setShortDescription(fetchedEvent.shortDescription || '');
      setDescription(fetchedEvent.description);
      setMode(fetchedEvent.mode);
      setLocation(fetchedEvent.location || '');
      setVenue(fetchedEvent.venue || '');
      setMeetingUrl(fetchedEvent.meetingUrl || '');

      if (fetchedEvent.startDate) {
        setStartDate(new Date(fetchedEvent.startDate).toISOString().slice(0, 16));
      }
      if (fetchedEvent.endDate) {
        setEndDate(new Date(fetchedEvent.endDate).toISOString().slice(0, 16));
      }
      if (fetchedEvent.registrationDeadline) {
        setRegistrationDeadline(new Date(fetchedEvent.registrationDeadline).toISOString().slice(0, 16));
      }

      setEligibility(fetchedEvent.eligibility || '');
      setTeamSize(fetchedEvent.teamSize || '');
      setSkills(fetchedEvent.skills ? fetchedEvent.skills.join(', ') : '');
      setPrizeInfo(fetchedEvent.prizeInfo || '');
      setCertificateInfo(fetchedEvent.certificateInfo || '');
      setRegistrationUrl(fetchedEvent.registrationUrl || '');
      setCoverImageUrl(fetchedEvent.coverImageUrl || '');
      setBannerUrl(fetchedEvent.bannerUrl || '');
      setContactInfo(fetchedEvent.contactInfo || '');
      setCapacity(fetchedEvent.capacity !== undefined ? fetchedEvent.capacity : '');
      setIsFree(fetchedEvent.isFree ?? true);
      setPrice(fetchedEvent.price !== undefined ? fetchedEvent.price : '');
      setCurrency(fetchedEvent.currency || 'LKR');
    } catch (err: any) {
      console.error('Failed to load event:', err);
      setActionMsg({ type: 'error', text: err?.message || 'Failed to load event details.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/organizer/events/${id}`);
      return;
    }

    if (!authLoading && isAuthenticated && !isAuthorized) {
      setActionMsg({
        type: 'error',
        text: 'You must have an Organizer role or belong to a campus organization to manage opportunities.',
      });
      setLoading(false);
      return;
    }

    if (isAuthenticated) {
      loadEvent();
    }
  }, [id, authLoading, isAuthenticated, isAuthorized]);

  const handleSubmitForReview = async () => {
    if (!event) return;
    setActionLoading(true);
    setActionMsg(null);
    try {
      await eventsService.submitForReview(event.id);
      setActionMsg({
        type: 'success',
        text: 'Event successfully submitted for administrative moderation! Status is now PENDING REVIEW.',
      });
      await loadEvent();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err?.message || 'Failed to submit event for review.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelEvent = async () => {
    if (!event) return;
    if (
      !confirm(
        'Are you sure you want to cancel this published opportunity? This will inform students that the event has been cancelled.',
      )
    ) {
      return;
    }

    setActionLoading(true);
    setActionMsg(null);
    try {
      await eventsService.cancelEvent(event.id);
      setActionMsg({ type: 'success', text: 'Event marked as CANCELLED.' });
      await loadEvent();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err?.message || 'Failed to cancel event.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDraft = async () => {
    if (!event) return;
    if (!confirm('Are you sure you want to permanently delete this draft? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    try {
      await eventsService.deleteDraft(event.id);
      router.push('/organizer/events');
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err?.message || 'Failed to delete draft.' });
      setActionLoading(false);
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setSaving(true);
    setActionMsg(null);

    try {
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        setActionMsg({ type: 'error', text: 'End date must be after start date.' });
        setSaving(false);
        return;
      }

      await eventsService.updateEvent(event.id, {
        title: title.trim(),
        slug: slug.trim(),
        categoryId: categoryId || undefined,
        shortDescription: shortDescription.trim() || undefined,
        description: description.trim(),
        mode,
        location: location.trim() || undefined,
        venue: venue.trim() || undefined,
        meetingUrl: meetingUrl.trim() || undefined,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        registrationDeadline: registrationDeadline
          ? new Date(registrationDeadline).toISOString()
          : undefined,
        eligibility: eligibility.trim() || undefined,
        teamSize: teamSize.trim() || undefined,
        skills: skillsArray,
        prizeInfo: prizeInfo.trim() || undefined,
        certificateInfo: certificateInfo.trim() || undefined,
        registrationUrl: registrationUrl.trim() || undefined,
        coverImageUrl: coverImageUrl.trim() || undefined,
        bannerUrl: bannerUrl.trim() || undefined,
        contactInfo: contactInfo.trim() || undefined,
        capacity: capacity !== '' ? Number(capacity) : undefined,
        isFree,
        price: !isFree && price !== '' ? Number(price) : undefined,
        currency: !isFree ? currency : undefined,
      });

      setActionMsg({ type: 'success', text: 'Event updated successfully.' });
      await loadEvent();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err?.message || 'Failed to update event.' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center p-6 text-xs text-cp-muted">
          <div className="w-4 h-4 rounded-full border-2 border-cp-yellow border-t-transparent animate-spin mr-2" />
          <span>Loading Opportunity Details...</span>
        </main>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-page-title text-cp-navy">Opportunity Not Found</h1>
          <p className="text-body text-cp-muted">The requested event could not be loaded or you do not have permission to manage it.</p>
          <Link href="/organizer/events" className="btn-secondary text-xs mt-2">
            Back to My Events
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 section-container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/organizer/events"
            className="inline-flex items-center gap-1 text-xs font-bold text-cp-muted hover:text-cp-navy transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Events</span>
          </Link>

          {event.status === EventStatus.PUBLISHED && (
            <Link
              href={`/events/${event.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-xs font-bold text-cp-navy hover:text-black transition-colors"
            >
              <span>View Public Page</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-cp-border">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-page-title text-cp-navy">{event.title}</h1>
            </div>
            <p className="text-xs text-cp-muted">
              Hosted by <span className="font-bold text-cp-navy">{event.organization?.name || 'Organization'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {event.status === EventStatus.DRAFT && (
              <>
                <Button size="sm" onClick={handleSubmitForReview} disabled={actionLoading}>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit for Review</span>
                </Button>
                <Button size="sm" variant="secondary" onClick={handleDeleteDraft} disabled={actionLoading} className="text-rose-600 hover:text-rose-700">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Draft</span>
                </Button>
              </>
            )}

            {event.status === EventStatus.REJECTED && (
              <Button size="sm" onClick={handleSubmitForReview} disabled={actionLoading}>
                <Send className="w-3.5 h-3.5" />
                <span>Resubmit for Review</span>
              </Button>
            )}

            {event.status === EventStatus.PUBLISHED && (
              <Button size="sm" variant="secondary" onClick={handleCancelEvent} disabled={actionLoading} className="text-rose-600 hover:text-rose-700">
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel Event</span>
              </Button>
            )}
          </div>
        </div>

        {actionMsg && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
              actionMsg.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{actionMsg.text}</span>
            </div>
            <button onClick={() => setActionMsg(null)} className="font-bold ml-2">
              ✕
            </button>
          </div>
        )}

        {event.status === EventStatus.DRAFT && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-start gap-3">
            <Clock className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-cp-navy">Status: Draft</p>
              <p className="text-slate-600">
                This opportunity is only visible to your organization officers. Make any necessary updates below, then click &quot;Submit for Review&quot; when ready for administrative moderation.
              </p>
            </div>
          </div>
        )}

        {event.status === EventStatus.PENDING_REVIEW && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Status: In Moderation (Pending Review)</p>
              <p className="text-amber-800">
                Your opportunity has been submitted to CampusPulse administrators for review. Once approved, it will be published and made publicly discoverable to students.
              </p>
            </div>
          </div>
        )}

        {event.status === EventStatus.REJECTED && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-950">Status: Rejected (Needs Revision)</p>
              <p className="text-rose-800 mb-1">
                This event requires revisions before it can be published:
              </p>
              <p className="p-2 rounded bg-white/70 border border-rose-200 font-mono text-[11px] text-rose-900">
                {event.rejectionReason || 'Please review event guidelines, date consistency, and description clarity.'}
              </p>
            </div>
          </div>
        )}

        {event.status === EventStatus.PUBLISHED && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-950">Status: Published (Live)</p>
              <p className="text-emerald-800">
                This opportunity is active and discoverable on the CampusPulse explore catalog. Students can save, bookmark, find teams, and register.
              </p>
            </div>
          </div>
        )}

        {event.status === EventStatus.CANCELLED && (
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 text-xs flex items-start gap-3">
            <XCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-cp-navy">Status: Cancelled</p>
              <p className="text-slate-600">
                This opportunity has been marked as cancelled.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-cp-surface rounded-2xl border border-cp-border p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-cp-muted">
              <span className="font-semibold">Page Views</span>
              <Eye className="w-4 h-4 text-cp-navy" />
            </div>
            <p className="text-xl font-bold text-cp-navy">{event.viewCount || 0}</p>
          </div>

          <div className="bg-cp-surface rounded-2xl border border-cp-border p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-cp-muted">
              <span className="font-semibold">Registrations</span>
              <Ticket className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-emerald-700">{event._count?.registrations || 0}</p>
          </div>

          <div className="bg-cp-surface rounded-2xl border border-cp-border p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-cp-muted">
              <span className="font-semibold">Saved Bookmarks</span>
              <Bookmark className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xl font-bold text-amber-700">{event._count?.bookmarks || 0}</p>
          </div>

          <div className="bg-cp-surface rounded-2xl border border-cp-border p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-cp-muted">
              <span className="font-semibold">Capacity</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-cp-navy">
              {event.capacity ? `${event._count?.registrations || 0} / ${event.capacity}` : 'Unlimited'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-cp-yellow-light border border-[#FDE68A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cp-surface text-cp-yellow font-bold flex items-center justify-center shrink-0">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-cp-navy">
                {event._count?.registrations || 0} Students Registered / RSVP'd
              </p>
              <p className="text-[11px] text-cp-muted">
                {event.registrationUrl
                  ? 'Track student RSVP clicks and view roster notes.'
                  : 'Manage active student attendees and view submitted notes.'}
              </p>
            </div>
          </div>

          <Link
            href={`/organizer/events/${event.id}/registrations`}
            className="px-4 py-2 text-xs font-bold text-cp-navy bg-cp-surface hover:bg-cp-bg border border-cp-border rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0"
          >
            <span>View Registrations</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-cp-muted" />
          </Link>
        </div>

        <form onSubmit={handleSaveChanges} className="space-y-6">
          <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-cp-border">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cp-yellow" />
                <h2 className="text-sm font-bold text-cp-navy">Opportunity Information</h2>
              </div>
              <span className="text-xs text-cp-muted">Edit details and save updates</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">
                  Event Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy focus:outline-none focus:border-cp-yellow"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy focus:outline-none focus:border-cp-yellow"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-cp-navy">Short Tagline</label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy focus:outline-none focus:border-cp-yellow"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-cp-navy">
                Full Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy focus:outline-none focus:border-cp-yellow"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">
                  Start Date & Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy focus:outline-none focus:border-cp-yellow"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">
                  End Date & Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy focus:outline-none focus:border-cp-yellow"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">
                  Registration Cutoff
                </label>
                <input
                  type="datetime-local"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  className="w-full px-3.5 py-2 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy focus:outline-none focus:border-cp-yellow"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as EventMode)}
                  className="w-full px-3.5 py-2 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy focus:outline-none focus:border-cp-yellow"
                >
                  <option value={EventMode.IN_PERSON}>In-Person</option>
                  <option value={EventMode.ONLINE}>Online</option>
                  <option value={EventMode.HYBRID}>Hybrid</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">Location / City</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy focus:outline-none focus:border-cp-yellow"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">Specific Venue</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3.5 py-2 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy focus:outline-none focus:border-cp-yellow"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">
                  Registration Portal URL
                </label>
                <input
                  type="url"
                  value={registrationUrl}
                  onChange={(e) => setRegistrationUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">
                  Target Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. React, Python, AI"
                  className="w-full px-3.5 py-2 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">Prize Info</label>
                <input
                  type="text"
                  value={prizeInfo}
                  onChange={(e) => setPrizeInfo(e.target.value)}
                  className="w-full px-3.5 py-2 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy focus:outline-none focus:border-cp-yellow"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">Certificate Info</label>
                <input
                  type="text"
                  value={certificateInfo}
                  onChange={(e) => setCertificateInfo(e.target.value)}
                  className="w-full px-3.5 py-2 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy focus:outline-none focus:border-cp-yellow"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">Cover Image URL</label>
                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy focus:outline-none focus:border-cp-yellow"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">Contact Details</label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="w-full px-3.5 py-2 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy focus:outline-none focus:border-cp-yellow"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link href="/organizer/events" className="btn-secondary text-xs">
              Cancel
            </Link>
            <Button type="submit" disabled={saving} className="text-xs">
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
