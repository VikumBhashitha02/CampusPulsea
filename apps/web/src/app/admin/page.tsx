'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Calendar,
  Users,
  Building2,
  ArrowRight,
  AlertTriangle,
  FileCheck2,
  Trophy,
  MousePointerClick,
  Sparkles,
  Clock,
  CheckCircle2,
  RefreshCw,
  Eye,
  Lock,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import type { AdminPlatformStats } from '../../services/admin.service';
import { useAuth } from '../../lib/auth/auth-context';
import { RoleType } from '@campuspulse/types';
import { PageHeader } from '../../components/ui/page-header';
import { Button } from '../../components/ui/button';

export default function AdminOverviewPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<AdminPlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const isAuthorized =
    user?.roles?.some((r) =>
      [RoleType.ADMIN, RoleType.SUPER_ADMIN].includes(r as RoleType),
    );

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin');
      return;
    }

    if (isAuthenticated && isAuthorized) {
      loadStats();
    } else if (isAuthenticated && !isAuthorized) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, isAuthorized]);

  const handleDetectExpired = async () => {
    setScanning(true);
    setScanMessage(null);
    try {
      const res = await adminService.detectExpiredEvents();
      setScanMessage(res.message);
      loadStats();
    } catch (err: any) {
      setScanMessage(err?.message || 'Failed to scan catalog for expired events.');
    } finally {
      setScanning(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-cp-yellow border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-cp-muted">Loading administrative console...</p>
          </div>
        </main>
      </div>
    );
  }

  if (isAuthenticated && !isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 max-w-lg w-full mx-auto px-4 py-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-page-title text-cp-navy">Access Restricted</h1>
          <p className="text-body text-cp-muted leading-relaxed">
            The CampusPulse Admin Center is strictly reserved for authorized platform administrators and moderators.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Link href="/" className="btn-secondary text-xs">
              Return Home
            </Link>
            <Link href="/account" className="btn-primary text-xs">
              My Student Account
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const totalPending = stats
    ? (stats.moderationQueue.pendingEvents || 0) +
      (stats.moderationQueue.pendingReports || 0) +
      (stats.moderationQueue.pendingVerifications || 0)
    : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 section-container py-8 sm:py-10 space-y-8">
        <PageHeader
          title="Admin Dashboard"
          description="Monitor and manage the CampusPulse platform."
          eyebrow="Platform Administration"
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm" onClick={handleDetectExpired} disabled={scanning} variant="secondary">
                <Clock className={`w-3.5 h-3.5 text-cp-yellow ${scanning ? 'animate-spin' : ''}`} />
                <span>{scanning ? 'Scanning...' : 'Scan & Expire Concluded Events'}</span>
              </Button>
              <button
                onClick={loadStats}
                disabled={loading}
                className="p-2.5 rounded-xl border border-cp-border bg-cp-surface text-cp-muted hover:text-cp-navy transition-colors"
                title="Refresh Stats"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          }
        />

        {scanMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{scanMessage}</span>
            </div>
            <button onClick={() => setScanMessage(null)} className="font-bold ml-2 text-emerald-800">
              ✕
            </button>
          </div>
        )}

        {totalPending > 0 && (
          <div className="p-5 rounded-2xl bg-cp-yellow-light border border-[#FDE68A] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-cp-surface text-cp-yellow font-bold flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-cp-navy">
                  {totalPending} Moderation Action Item{totalPending !== 1 ? 's' : ''} Awaiting Attention
                </h3>
                <p className="text-xs text-cp-muted">
                  Review submissions to keep student feeds safe, accurate, and up-to-date.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {stats && stats.moderationQueue.pendingEvents > 0 && (
                <Link
                  href="/admin/events"
                  className="px-3 py-1.5 rounded-lg bg-cp-surface border border-[#FDE68A] text-xs font-bold text-amber-800 hover:bg-[#FFFDF5] transition-colors"
                >
                  {stats.moderationQueue.pendingEvents} Pending Event{stats.moderationQueue.pendingEvents !== 1 ? 's' : ''}
                </Link>
              )}
              {stats && stats.moderationQueue.pendingVerifications > 0 && (
                <Link
                  href="/admin/organizations"
                  className="px-3 py-1.5 rounded-lg bg-cp-surface border border-[#FDE68A] text-xs font-bold text-amber-800 hover:bg-[#FFFDF5] transition-colors"
                >
                  {stats.moderationQueue.pendingVerifications} Pending Verification{stats.moderationQueue.pendingVerifications !== 1 ? 's' : ''}
                </Link>
              )}
              {stats && stats.moderationQueue.pendingReports > 0 && (
                <Link
                  href="/admin/reports"
                  className="px-3 py-1.5 rounded-lg bg-cp-surface border border-rose-200 text-xs font-bold text-rose-700 hover:bg-[#FFFDF5] transition-colors"
                >
                  {stats.moderationQueue.pendingReports} Active Report{stats.moderationQueue.pendingReports !== 1 ? 's' : ''}
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-cp-surface rounded-2xl border border-cp-border p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-cp-muted font-semibold">
              <span>Platform Users</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-cp-navy">
              {(stats?.overview.users || 0).toLocaleString()}
            </div>
          </div>

          <div className="bg-cp-surface rounded-2xl border border-cp-border p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-cp-muted font-semibold">
              <span>Universities</span>
              <Building2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-cp-navy">
              {stats?.overview.universities || 0}
            </div>
          </div>

          <div className="bg-cp-surface rounded-2xl border border-cp-border p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-cp-muted font-semibold">
              <span>Clubs & Societies</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-cp-navy">
              {stats?.overview.organizations || 0}
            </div>
          </div>

          <div className="bg-cp-surface rounded-2xl border border-cp-border p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-cp-muted font-semibold">
              <span>Opportunities</span>
              <Calendar className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-cp-navy">
              {stats?.overview.events || 0}
            </div>
          </div>

          <div className="bg-cp-surface rounded-2xl border border-cp-border p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-cp-muted font-semibold">
              <span>Registrations</span>
              <MousePointerClick className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700">
              {(stats?.overview.registrations || 0).toLocaleString()}
            </div>
          </div>

          <div className="bg-cp-surface rounded-2xl border border-cp-border p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-cp-muted font-semibold">
              <span>Squads Formed</span>
              <Trophy className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-700">
              {stats?.overview.teams || 0}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-section-title text-cp-navy flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cp-yellow" />
            <span>Governance Operations Hubs</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/admin/events"
              className="bg-cp-surface rounded-2xl border border-cp-border hover:border-cp-yellow transition-all space-y-3 group p-6"
            >
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-cp-yellow-light text-amber-800 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-cp-yellow" />
                </div>
                {stats && stats.moderationQueue.pendingEvents > 0 && (
                  <span className="badge-yellow text-[10px] font-bold">
                    {stats.moderationQueue.pendingEvents} Pending
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-cp-navy group-hover:text-black transition-colors">
                Event Moderation Queue
              </h3>
              <p className="text-xs text-cp-muted leading-relaxed">
                Review submissions, approve hackathons, reject with feedback notes, or scan for expired events.
              </p>
              <div className="pt-2 flex items-center gap-1 text-xs font-bold text-amber-800">
                <span>Manage Submissions</span>
                <ArrowRight className="w-3.5 h-3.5 text-cp-yellow" />
              </div>
            </Link>

            <Link
              href="/admin/organizations"
              className="bg-cp-surface rounded-2xl border border-cp-border hover:border-emerald-500/50 transition-all space-y-3 group p-6"
            >
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5 text-emerald-600" />
                </div>
                {stats && stats.moderationQueue.pendingVerifications > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {stats.moderationQueue.pendingVerifications} Pending
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-cp-navy group-hover:text-emerald-950 transition-colors">
                Organization Verification
              </h3>
              <p className="text-xs text-cp-muted leading-relaxed">
                Review registration letters and university student body endorsements to issue verification badges.
              </p>
              <div className="pt-2 flex items-center gap-1 text-xs font-bold text-emerald-700">
                <span>Review Credentials</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href="/admin/reports"
              className="bg-cp-surface rounded-2xl border border-cp-border hover:border-rose-500/50 transition-all space-y-3 group p-6"
            >
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                {stats && stats.moderationQueue.pendingReports > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                    {stats.moderationQueue.pendingReports} Active
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-cp-navy group-hover:text-rose-950 transition-colors">
                Safety & Abuse Reports
              </h3>
              <p className="text-xs text-cp-muted leading-relaxed">
                Investigate user-flagged opportunities, phishing links, and unauthorized impersonations with audit notes.
              </p>
              <div className="pt-2 flex items-center gap-1 text-xs font-bold text-rose-700">
                <span>Resolve Reports</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href="/admin/users"
              className="bg-cp-surface rounded-2xl border border-cp-border hover:border-blue-500/50 transition-all space-y-3 group p-6"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-cp-navy group-hover:text-blue-950 transition-colors">
                User Directory & Roles
              </h3>
              <p className="text-xs text-cp-muted leading-relaxed">
                Inspect registered student and organizer identities, verify roles, or suspend policy-violating accounts.
              </p>
              <div className="pt-2 flex items-center gap-1 text-xs font-bold text-blue-700">
                <span>Manage Users</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href="/admin/universities"
              className="bg-cp-surface rounded-2xl border border-cp-border hover:border-indigo-500/50 transition-all space-y-3 group p-6"
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-base font-bold text-cp-navy group-hover:text-indigo-950 transition-colors">
                Campuses & Hierarchy
              </h3>
              <p className="text-xs text-cp-muted leading-relaxed">
                Oversee university institutional profiles, faculty hierarchies, department structures, and domains.
              </p>
              <div className="pt-2 flex items-center gap-1 text-xs font-bold text-indigo-700">
                <span>Manage Institutions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href="/explore"
              className="bg-cp-surface rounded-2xl border border-cp-border hover:border-amber-500/50 transition-all space-y-3 group p-6"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Eye className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-base font-bold text-cp-navy group-hover:text-amber-950 transition-colors">
                Live Public Catalog Audit
              </h3>
              <p className="text-xs text-cp-muted leading-relaxed">
                View opportunities exactly as displayed to students nationwide with multi-faceted search filters.
              </p>
              <div className="pt-2 flex items-center gap-1 text-xs font-bold text-amber-800">
                <span>Open Live Catalog</span>
                <ArrowRight className="w-3.5 h-3.5 text-cp-yellow" />
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
