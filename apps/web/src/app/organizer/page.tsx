'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PlusCircle,
  Eye,
  CheckCircle2,
  Clock,
  FileText,
  XCircle,
  Calendar,
  ArrowUpRight,
  Layers,
  ChevronRight,
  AlertCircle,
  Ticket,
  Bookmark,
} from 'lucide-react';
import type { OrganizerAnalyticsData } from '@campuspulse/types';
import { EventStatus, RoleType } from '@campuspulse/types';
import { useAuth } from '../../lib/auth/auth-context';
import { eventsService } from '../../services/events.service';
import { organizationsService } from '../../services/organizations.service';
import { PageHeader } from '../../components/ui/page-header';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { EmptyState } from '../../components/ui/empty-state';

export default function OrganizerDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [analytics, setAnalytics] = useState<OrganizerAnalyticsData | null>(null);
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string; role: string; title?: string }>>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthorized =
    user?.roles?.some((r) =>
      [RoleType.ORGANIZER, RoleType.ADMIN, RoleType.SUPER_ADMIN, RoleType.UNIVERSITY_ADMIN].includes(
        r as RoleType,
      ),
    ) || (user?.organizations && user.organizations.length > 0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/organizer');
      return;
    }

    if (!authLoading && isAuthenticated && !isAuthorized) {
      setError('You must have an Organizer role or belong to a campus organization to access this portal.');
      setLoading(false);
      return;
    }

    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [authLoading, isAuthenticated, isAuthorized]);

  const loadDashboardData = async (orgId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsData, myOrgs] = await Promise.all([
        eventsService.getOrganizerAnalytics(orgId),
        organizationsService.getMyOrganizations(),
      ]);

      setAnalytics(analyticsData);
      setOrganizations(myOrgs);
      if (!selectedOrgId && myOrgs.length > 0) {
        setSelectedOrgId(myOrgs[0]!.id);
      }
    } catch (err: any) {
      console.error('Failed to load organizer dashboard:', err);
      setError(err?.message || 'Failed to load organizer data.');
    } finally {
      setLoading(false);
    }
  };

  const handleOrgChange = (orgId: string) => {
    setSelectedOrgId(orgId);
    loadDashboardData(orgId);
  };

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case EventStatus.PUBLISHED:
        return (
          <Badge tone="success" className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Published</span>
          </Badge>
        );
      case EventStatus.PENDING_REVIEW:
        return (
          <Badge tone="warning" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Pending Review</span>
          </Badge>
        );
      case EventStatus.DRAFT:
        return (
          <Badge tone="neutral" className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            <span>Draft</span>
          </Badge>
        );
      case EventStatus.REJECTED:
        return (
          <Badge tone="danger" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </Badge>
        );
      case EventStatus.CANCELLED:
        return (
          <Badge tone="neutral" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </Badge>
        );
      default:
        return <Badge tone="neutral">{status}</Badge>;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center p-6 text-xs text-cp-muted">
          <div className="w-4 h-4 rounded-full border-2 border-cp-yellow border-t-transparent animate-spin mr-2" />
          <span>Loading Organizer Portal...</span>
        </main>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-page-title text-cp-navy mb-2">Organizer Access Required</h1>
          <p className="text-body text-cp-muted max-w-md mb-6">{error}</p>
          <div className="flex items-center gap-3">
            <Link href="/account" className="btn-secondary text-xs">
              Go to Student Account
            </Link>
            <Link href="/explore" className="btn-primary text-xs">
              Explore Opportunities
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const currentOrg = organizations.find((o) => o.id === selectedOrgId) || organizations[0];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 section-container py-8 space-y-8">
        <PageHeader
          title="Organizer Dashboard"
          description="Create, manage, and track your university opportunities."
          eyebrow="Organizer Portal"
          actions={
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link href="/organizer/events" className="btn-secondary text-xs flex-1 sm:flex-initial">
                <Layers className="w-4 h-4" />
                <span>My Events</span>
              </Link>
              <Link href="/organizer/events/create" className="btn-primary text-xs flex-1 sm:flex-initial">
                <PlusCircle className="w-4 h-4" />
                <span>Create Event</span>
              </Link>
            </div>
          }
        />

        {currentOrg && (
          <Card className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-cp-navy text-cp-yellow flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                {currentOrg.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-cp-navy">{currentOrg.name}</h2>
                  <Badge tone="accent">
                    Verified Organization
                  </Badge>
                </div>
                <p className="text-xs text-cp-muted">
                  Your Role: <span className="font-semibold text-cp-navy">{currentOrg.title || currentOrg.role}</span>
                </p>
              </div>
            </div>

            {organizations.length > 1 && (
              <div className="flex items-center gap-2">
                <label htmlFor="org-picker" className="text-xs font-semibold text-cp-muted shrink-0">
                  Switch Org:
                </label>
                <select
                  id="org-picker"
                  value={selectedOrgId}
                  onChange={(e) => handleOrgChange(e.target.value)}
                  className="px-3 py-1.5 bg-cp-bg border border-cp-border rounded-lg text-xs font-semibold text-cp-navy focus:outline-none focus:border-cp-yellow"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-cp-muted">
              <span className="font-semibold">Total Events</span>
              <Calendar className="w-4 h-4 text-cp-navy" />
            </div>
            <div className="text-2xl font-bold text-cp-navy">{analytics?.totalEvents ?? 0}</div>
            <p className="text-[11px] text-cp-muted">Across all statuses</p>
          </Card>

          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-cp-muted">
              <span className="font-semibold">Published</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700">{analytics?.publishedEvents ?? 0}</div>
            <p className="text-[11px] text-cp-muted">Live for students</p>
          </Card>

          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-cp-muted">
              <span className="font-semibold">Pending Review</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-700">{analytics?.pendingEvents ?? 0}</div>
            <p className="text-[11px] text-cp-muted">In moderation queue</p>
          </Card>

          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-cp-muted">
              <span className="font-semibold">Drafts</span>
              <FileText className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-cp-navy">{analytics?.draftEvents ?? 0}</div>
            <p className="text-[11px] text-cp-muted">Unsubmitted events</p>
          </Card>
        </div>

        {analytics && (analytics.totalViews > 0 || analytics.totalRegistrations > 0 || analytics.totalBookmarks > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Eye className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-cp-muted">Total Opportunity Views</p>
                <p className="text-xl font-bold text-cp-navy">{analytics.totalViews.toLocaleString()}</p>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Ticket className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-cp-muted">Student Registrations</p>
                <p className="text-xl font-bold text-cp-navy">{analytics.totalRegistrations.toLocaleString()}</p>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Bookmark className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-cp-muted">Student Bookmarks</p>
                <p className="text-xl font-bold text-cp-navy">{analytics.totalBookmarks.toLocaleString()}</p>
              </div>
            </Card>
          </div>
        )}

        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-section-title text-cp-navy">Recent Opportunities</h3>
              <p className="text-xs text-cp-muted">Your recently created or submitted opportunities</p>
            </div>
            <Link
              href="/organizer/events"
              className="text-xs font-bold text-cp-navy hover:text-black flex items-center gap-1 group"
            >
              <span>View All Events</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 flex items-center justify-center text-xs text-cp-muted">
              <div className="w-4 h-4 rounded-full border-2 border-cp-yellow border-t-transparent animate-spin mr-2" />
              <span>Loading events...</span>
            </div>
          ) : analytics?.recentEvents && analytics.recentEvents.length > 0 ? (
            <div className="divide-y divide-cp-border">
              {analytics.recentEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/organizer/events/${evt.id}`}
                        className="text-sm font-bold text-cp-navy hover:text-cp-accent transition-colors"
                      >
                        {evt.title}
                      </Link>
                      {getStatusBadge(evt.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-cp-muted">
                      <span>{evt.category?.name || 'General'}</span>
                      <span>•</span>
                      <span>{new Date(evt.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {evt._count?.registrations !== undefined && (
                        <>
                          <span>•</span>
                          <span>{evt._count.registrations} registrations</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/organizer/events/${evt.id}`}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Manage
                    </Link>
                    {evt.status === EventStatus.PUBLISHED && (
                      <Link
                        href={`/events/${evt.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-cp-muted hover:text-cp-navy hover:bg-cp-bg transition-colors"
                        title="View Public Page"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No opportunities created yet"
              description="Create your first event, competition, or workshop and reach students across CampusPulse."
              action={{
                label: 'Create Your First Event',
                href: '/organizer/events/create',
              }}
            />
          )}
        </Card>
      </main>
    </div>
  );
}
