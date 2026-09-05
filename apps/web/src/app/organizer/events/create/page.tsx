'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  ArrowLeft,
  AlertCircle,
  MapPin,
  Users,
  Award,
  Link as LinkIcon,
  FileText,
  Save,
} from 'lucide-react';
import { eventsService } from '../../../../services/events.service';
import { organizationsService } from '../../../../services/organizations.service';
import { useAuth } from '../../../../lib/auth/auth-context';
import { EventMode, RoleType } from '@campuspulse/types';
import { PageHeader } from '../../../../components/ui/page-header';
import { Button } from '../../../../components/ui/button';

export default function CreateEventPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [myOrganizations, setMyOrganizations] = useState<Array<{ id: string; name: string; role: string }>>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [fetchingMeta, setFetchingMeta] = useState(true);

  const [organizationId, setOrganizationId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
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
  const [teamSize, setTeamSize] = useState('1 - 4 Members');
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

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isAuthorized =
    user?.roles?.some((r) =>
      [RoleType.ORGANIZER, RoleType.ADMIN, RoleType.SUPER_ADMIN, RoleType.UNIVERSITY_ADMIN].includes(
        r as RoleType,
      ),
    ) || (user?.organizations && user.organizations.length > 0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/organizer/events/create');
      return;
    }

    if (!authLoading && isAuthenticated && !isAuthorized) {
      setError('You must have an Organizer role or belong to a campus organization to create opportunities.');
      setFetchingMeta(false);
      return;
    }

    if (isAuthenticated) {
      loadMetadata();
    }
  }, [authLoading, isAuthenticated, isAuthorized]);

  const loadMetadata = async () => {
    setFetchingMeta(true);
    try {
      const [orgs, cats] = await Promise.all([
        organizationsService.getMyOrganizations(),
        eventsService.getCategories(),
      ]);

      setMyOrganizations(orgs);
      if (orgs.length > 0) {
        setOrganizationId(orgs[0]!.id);
      }

      setCategories(cats);
      if (cats.length > 0) {
        setCategoryId(cats[0]!.id);
      }
    } catch (err: any) {
      console.error('Failed to load creation metadata:', err);
    } finally {
      setFetchingMeta(false);
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Opportunity title is required.');
      return;
    }

    if (!slug.trim()) {
      setError('A unique URL slug is required.');
      return;
    }

    if (!description.trim()) {
      setError('Full event description is required.');
      return;
    }

    if (!startDate || !endDate) {
      setError('Event start date and end date are required.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      setError('Event end date must be after the start date.');
      return;
    }

    if (registrationDeadline) {
      const deadline = new Date(registrationDeadline);
      if (deadline > start) {
        setError('Registration deadline must be on or before the event start date.');
        return;
      }
    }

    if (!organizationId) {
      setError('Please select a hosting organization.');
      return;
    }

    if (!categoryId) {
      setError('Please select an opportunity category.');
      return;
    }

    setSubmitting(true);

    try {
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await eventsService.createEvent({
        organizationId,
        categoryId,
        title: title.trim(),
        slug: slug.trim(),
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

      router.push('/organizer/events');
    } catch (err: any) {
      setError(err?.message || 'Failed to save event draft.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || fetchingMeta) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center p-6 text-xs text-cp-muted">
          <div className="w-4 h-4 rounded-full border-2 border-cp-yellow border-t-transparent animate-spin mr-2" />
          <span>Preparing Event Creator...</span>
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
        </div>

        <PageHeader
          title="Create New Opportunity"
          description="Draft your event details. All opportunities are created in Draft status, allowing you to review before submitting for moderation."
          eyebrow="Opportunity Builder"
        />

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-cp-border">
              <FileText className="w-4 h-4 text-cp-yellow" />
              <h2 className="text-sm font-bold text-cp-navy">1. Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">
                  Hosting Organization <span className="text-rose-500">*</span>
                </label>
                <select
                  value={organizationId}
                  onChange={(e) => setOrganizationId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy focus:outline-none focus:border-cp-yellow"
                  required
                >
                  {myOrganizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy focus:outline-none focus:border-cp-yellow"
                  required
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
              <label className="block text-xs font-bold text-cp-navy">
                Event Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. MoraHack 2026: National AI Hackathon"
                className="w-full px-3.5 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-cp-navy">
                URL Slug <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 bg-cp-bg border border-r-0 border-cp-border rounded-l-xl text-xs text-cp-muted">
                  /events/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                  placeholder="morahack-2026"
                  className="w-full px-3.5 py-2.5 bg-cp-bg border border-cp-border rounded-r-xl text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
                  required
                />
              </div>
              <p className="text-[11px] text-cp-muted">Unique public link for student sharing.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-cp-navy">
                Short Tagline / Summary
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="e.g. 24-hour inter-university competitive artificial intelligence hackathon"
                className="w-full px-3.5 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
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
                placeholder="Comprehensive details about the event, rules, schedule, tracks, guidelines..."
                className="w-full px-3.5 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
                required
              />
            </div>
          </div>

          <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-cp-border">
              <Calendar className="w-4 h-4 text-cp-yellow" />
              <h2 className="text-sm font-bold text-cp-navy">2. Schedule & Deadlines</h2>
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
                  className="w-full px-3.5 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy focus:outline-none focus:border-cp-yellow"
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
                  className="w-full px-3.5 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy focus:outline-none focus:border-cp-yellow"
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
                  className="w-full px-3.5 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy focus:outline-none focus:border-cp-yellow"
                />
              </div>
            </div>
          </div>

          <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-cp-border">
              <MapPin className="w-4 h-4 text-cp-yellow" />
              <h2 className="text-sm font-bold text-cp-navy">3. Mode & Location</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">
                  Event Mode <span className="text-rose-500">*</span>
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as EventMode)}
                  className="w-full px-3.5 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy focus:outline-none focus:border-cp-yellow"
                >
                  <option value={EventMode.IN_PERSON}>In-Person</option>
                  <option value={EventMode.ONLINE}>Online / Virtual</option>
                  <option value={EventMode.HYBRID}>Hybrid</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">City / Region</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Colombo, Moratuwa, Kandy"
                  className="w-full px-3.5 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">Specific Venue</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Civil Auditorium / Main Hall"
                  className="w-full px-3.5 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
                />
              </div>
            </div>

            {(mode === EventMode.ONLINE || mode === EventMode.HYBRID) && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">Meeting / Stream URL</label>
                <input
                  type="url"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                  className="w-full px-3.5 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
                />
              </div>
            )}
          </div>

          <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-cp-border">
              <Users className="w-4 h-4 text-cp-yellow" />
              <h2 className="text-sm font-bold text-cp-navy">4. Eligibility & Team Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">
                  Eligibility Criteria
                </label>
                <input
                  type="text"
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  placeholder="e.g. Open to all registered Sri Lankan undergraduate students"
                  className="w-full px-3.5 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">
                  Team Size Guidelines
                </label>
                <input
                  type="text"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  placeholder="e.g. 3 to 5 Members per team"
                  className="w-full px-3.5 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-cp-navy">
                Target Skills / Domains (Comma separated)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React, Python, Machine Learning, UI/UX, Cloud"
                className="w-full px-3.5 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
              />
              <p className="text-[11px] text-cp-muted">Used for student recommendation matching and Team Finder.</p>
            </div>
          </div>

          <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-cp-border">
              <LinkIcon className="w-4 h-4 text-cp-yellow" />
              <h2 className="text-sm font-bold text-cp-navy">5. Registration & Capacity</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">
                  External Registration Portal Link
                </label>
                <input
                  type="url"
                  value={registrationUrl}
                  onChange={(e) => setRegistrationUrl(e.target.value)}
                  placeholder="https://forms.gle/... or https://your-portal.com"
                  className="w-full px-3.5 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
                />
                <p className="text-[11px] text-cp-muted">If specified, students clicking register are routed to this link.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">Attendee Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 150"
                  className="w-full px-3.5 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-cp-navy cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="w-4 h-4 rounded border-cp-border text-cp-navy focus:ring-cp-yellow"
                />
                <span>This opportunity is Free for attendees</span>
              </label>
            </div>

            {!isFree && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-cp-navy">Ticket Price</label>
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 1500"
                    className="w-full px-3.5 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-cp-navy">Currency</label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="LKR"
                    className="w-full px-3.5 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-cp-border">
              <Award className="w-4 h-4 text-cp-yellow" />
              <h2 className="text-sm font-bold text-cp-navy">6. Prizes, Certificates & Media</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">Prize Pool / Awards</label>
                <input
                  type="text"
                  value={prizeInfo}
                  onChange={(e) => setPrizeInfo(e.target.value)}
                  placeholder="e.g. LKR 300,000 Cash Prize Pool & Trophies"
                  className="w-full px-3.5 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">
                  Certificate Details
                </label>
                <input
                  type="text"
                  value={certificateInfo}
                  onChange={(e) => setCertificateInfo(e.target.value)}
                  placeholder="e.g. IEEE Official Digital Certificate of Participation"
                  className="w-full px-3.5 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-cp-navy">
                  Banner Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-cp-navy">
                Organizer Contact Info
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="e.g. kasun@ieee.uom.lk / +94 77 123 4567"
                className="w-full px-3.5 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Link href="/organizer/events" className="btn-secondary text-xs">
              Cancel
            </Link>
            <Button type="submit" disabled={submitting} className="text-xs">
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  <span>Saving Draft...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Draft</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
