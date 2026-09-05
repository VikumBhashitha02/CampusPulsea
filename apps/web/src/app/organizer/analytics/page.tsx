'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Eye,
  Bookmark,
  Ticket,
  TrendingUp,
  Building2,
} from 'lucide-react';
import { eventsService } from '../../../services/events.service';
import { organizationsService } from '../../../services/organizations.service';
import { useAuth } from '../../../lib/auth/auth-context';
import type { OrganizerAnalyticsData } from '@campuspulse/types';
import { RoleType } from '@campuspulse/types';

export default function OrganizerAnalyticsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [analytics, setAnalytics] = useState<OrganizerAnalyticsData | null>(null);
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string; role: string }>>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const isAuthorized =
    user?.roles?.some((r) =>
      [RoleType.ORGANIZER, RoleType.ADMIN, RoleType.SUPER_ADMIN, RoleType.UNIVERSITY_ADMIN].includes(
        r as RoleType,
      ),
    ) || (user?.organizations && user.organizations.length > 0);

  const loadAnalytics = async (orgId?: string) => {
    setLoading(true);
    try {
      const [data, myOrgs] = await Promise.all([
        eventsService.getOrganizerAnalytics(orgId),
        organizationsService.getMyOrganizations(),
      ]);
      setAnalytics(data);
      setOrganizations(myOrgs);
      if (!selectedOrgId && myOrgs.length > 0) {
        setSelectedOrgId(myOrgs[0]!.id);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/organizer/analytics');
      return;
    }

    if (isAuthenticated && isAuthorized) {
      loadAnalytics();
    } else if (isAuthenticated && !isAuthorized) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, isAuthorized]);

  const totalViews = analytics?.totalViews || 0;
  const totalRegistrations = analytics?.totalRegistrations || 0;
  const totalBookmarks = analytics?.totalBookmarks || 0;
  const overallCtr = totalViews > 0 ? Math.round((totalRegistrations / totalViews) * 100) : 0;

  const maxViews = analytics?.eventBreakdown
    ? Math.max(...analytics.eventBreakdown.map((e) => e.views), 1)
    : 1;

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center p-6 text-xs text-cp-muted">
          <div className="w-4 h-4 rounded-full border-2 border-cp-yellow border-t-transparent animate-spin mr-2" />
          <span>Loading Analytics...</span>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 section-container py-8 space-y-8">
        <div className="space-y-1">
          <Link
            href="/organizer"
            className="inline-flex items-center gap-1 text-xs font-bold text-cp-muted hover:text-cp-navy transition-colors mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-page-title text-cp-navy">Opportunity Engagement Analytics</h1>
          <p className="text-body text-cp-muted">
            Track student discovery, bookmarks, and registration funnel performance.
          </p>
        </div>

        {organizations.length > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cp-yellow-light border border-[#FDE68A] text-xs font-bold text-amber-800">
            <Building2 className="w-4 h-4" />
            <span>{organizations[0]?.name}</span>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-cp-muted font-semibold">
              <span>Total Impressions</span>
              <Eye className="w-4 h-4 text-cp-navy" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-cp-navy">
              {totalViews.toLocaleString()}
            </div>
            <p className="text-[11px] text-cp-muted">Student opportunity views</p>
          </div>

          <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-cp-muted font-semibold">
              <span>Registrations</span>
              <Ticket className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-700">
              {totalRegistrations.toLocaleString()}
            </div>
            <p className="text-[11px] text-cp-muted">RSVP & portal conversions</p>
          </div>

          <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-cp-muted font-semibold">
              <span>Saved Bookmarks</span>
              <Bookmark className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-amber-700">
              {totalBookmarks.toLocaleString()}
            </div>
            <p className="text-[11px] text-cp-muted">Saved to student accounts</p>
          </div>

          <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-cp-muted font-semibold">
              <span>Overall Conversion</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-700">{overallCtr}%</div>
            <p className="text-[11px] text-cp-muted">Views to registration rate</p>
          </div>
        </div>

        <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-section-title text-cp-navy">Per-Opportunity Breakdown</h2>
            <p className="text-xs text-cp-muted">Compare views, bookmarks, and registration rate across your events.</p>
          </div>

          {loading ? (
            <div className="py-12 flex items-center justify-center text-xs text-cp-muted">
              <div className="w-4 h-4 rounded-full border-2 border-cp-yellow border-t-transparent animate-spin mr-2" />
              <span>Loading performance data...</span>
            </div>
          ) : analytics?.eventBreakdown && analytics.eventBreakdown.length > 0 ? (
            <div className="space-y-4">
              {analytics.eventBreakdown.map((evt) => {
                const widthPercent = Math.max(Math.round((evt.views / maxViews) * 100), 4);
                return (
                  <div
                    key={evt.id}
                    className="p-4 rounded-xl bg-cp-bg border border-cp-border space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <Link
                          href={`/organizer/events/${evt.id}`}
                          className="text-xs sm:text-sm font-bold text-cp-navy hover:underline"
                        >
                          {evt.title}
                        </Link>
                        <p className="text-[11px] text-cp-muted">
                          Status: <span className="font-semibold text-cp-navy">{evt.status}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="text-right">
                          <span className="text-cp-muted">Views: </span>
                          <span className="font-bold text-cp-navy">{evt.views}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-cp-muted">Regs: </span>
                          <span className="font-bold text-emerald-700">{evt.registrations}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-cp-muted">Conv: </span>
                          <span className="font-bold text-blue-700">{evt.conversionRate}%</span>
                        </div>
                        <Link
                          href={`/organizer/events/${evt.id}/registrations`}
                          className="px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-cp-yellow-light hover:bg-[#FFFDF5] border border-[#FDE68A] rounded-lg transition-colors"
                        >
                          View Roster
                        </Link>
                      </div>
                    </div>

                    <div className="w-full bg-cp-border rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-cp-yellow h-full rounded-full transition-all duration-500"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cp-yellow-light text-amber-800 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-cp-yellow" />
              </div>
              <p className="text-xs font-bold text-cp-navy">No analytics yet</p>
              <p className="text-xs text-cp-muted max-w-sm">
                Publish your first opportunity to start seeing student engagement, views, bookmarks, and registration conversions.
              </p>
              <Link href="/organizer/events/create" className="btn-primary text-xs mt-2">
                Create Event
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
