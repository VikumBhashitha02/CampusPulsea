'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Calendar,
  Building2,
  X,
  Lock,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { adminService } from '../../../services/admin.service';
import type { AdminReportItem } from '@campuspulse/types';
import { ReportStatus, ReportTarget, RoleType } from '@campuspulse/types';
import { useAuth } from '../../../lib/auth/auth-context';
import { PageHeader } from '../../../components/ui/page-header';
import { Button } from '../../../components/ui/button';

export default function AdminReportsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [reports, setReports] = useState<AdminReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | ReportStatus>(ReportStatus.PENDING);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  const [resolvingReport, setResolvingReport] = useState<AdminReportItem | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [resolveType, setResolveType] = useState<ReportStatus.RESOLVED | ReportStatus.DISMISSED>(
    ReportStatus.RESOLVED,
  );
  const [submitting, setSubmitting] = useState(false);

  const isAuthorized =
    user?.roles?.some((r) =>
      [RoleType.ADMIN, RoleType.SUPER_ADMIN].includes(r as RoleType),
    );

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await adminService.getReports(
        selectedFilter === 'ALL' ? undefined : selectedFilter,
      );
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin/reports');
      return;
    }

    if (isAuthenticated && isAuthorized) {
      loadReports();
    } else if (isAuthenticated && !isAuthorized) {
      setLoading(false);
    }
  }, [selectedFilter, authLoading, isAuthenticated, isAuthorized]);

  const handleOpenResolve = (
    report: AdminReportItem,
    type: ReportStatus.RESOLVED | ReportStatus.DISMISSED,
  ) => {
    setResolvingReport(report);
    setResolveType(type);
    setActionNotes('');
  };

  const handleConfirmResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingReport) return;

    setSubmitting(true);
    try {
      await adminService.resolveReport(resolvingReport.id, resolveType, actionNotes);
      setReports((prev) =>
        prev.map((r) =>
          r.id === resolvingReport.id
            ? { ...r, status: resolveType, actionNotes: actionNotes || null }
            : r,
        ),
      );
      setResolvingReport(null);
      setNotification({
        type: 'success',
        message: `Report marked as ${resolveType.toLowerCase()} with audit notes recorded.`,
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to record report resolution.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || (loading && reports.length === 0)) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-cp-yellow border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-cp-muted">Loading reports queue...</p>
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
            Safety & Policy Abuse Reports are reserved for platform administrators and moderators.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Link href="/" className="btn-secondary text-xs">
              Return Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 section-container py-8 sm:py-10 space-y-6">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-cp-muted hover:text-cp-navy transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Dashboard</span>
          </Link>
        </div>

        <PageHeader
          title="Safety & Abuse Reports"
          description="Investigate community reports regarding phishing links, unauthorized listings, or policy violations."
          eyebrow="Safety & Policy Moderation"
          actions={
            <button
              onClick={loadReports}
              disabled={loading}
              className="p-2.5 rounded-xl border border-cp-border bg-cp-surface text-cp-muted hover:text-cp-navy transition-colors"
              title="Refresh Reports"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          }
        />

        {notification && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
              notification.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="font-bold ml-2">
              ✕
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: ReportStatus.PENDING, label: 'Active Reports' },
            { id: ReportStatus.RESOLVED, label: 'Resolved' },
            { id: ReportStatus.DISMISSED, label: 'Dismissed' },
            { id: 'ALL', label: 'All History' },
          ].map((tab) => {
            const active = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-cp-navy text-cp-yellow shadow-xs'
                    : 'bg-cp-surface text-cp-muted hover:text-cp-navy border border-cp-border'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="bg-cp-surface rounded-2xl border border-cp-border p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {rep.status === ReportStatus.PENDING ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          <Clock className="w-3 h-3 text-rose-600" />
                          <span>Investigation Required</span>
                        </span>
                      ) : rep.status === ReportStatus.RESOLVED ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Resolved</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                          <XCircle className="w-3 h-3 text-slate-500" />
                          <span>Dismissed</span>
                        </span>
                      )}

                      <span className="text-xs text-cp-muted font-mono">
                        Target: {rep.targetType} (ID: {rep.targetId})
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-cp-navy flex items-center gap-2">
                      {rep.targetType === ReportTarget.EVENT ? (
                        <Calendar className="w-4 h-4 text-purple-600" />
                      ) : rep.targetType === ReportTarget.ORGANIZATION ? (
                        <Building2 className="w-4 h-4 text-blue-600" />
                      ) : (
                        <User className="w-4 h-4 text-indigo-600" />
                      )}
                      <span>{rep.reason}</span>
                    </h3>

                    <div className="text-xs text-cp-muted">
                      <span>Reported by {rep.reporter?.name || 'Community Member'}</span>
                      {rep.reporter?.email && (
                        <span className="text-cp-muted ml-1">({rep.reporter.email})</span>
                      )}
                      <span className="ml-2">• {new Date(rep.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {rep.status === ReportStatus.PENDING && (
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Button size="sm" onClick={() => handleOpenResolve(rep, ReportStatus.RESOLVED)}>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Resolve</span>
                      </Button>

                      <Button size="sm" variant="secondary" onClick={() => handleOpenResolve(rep, ReportStatus.DISMISSED)} className="text-cp-muted hover:text-cp-navy">
                        <XCircle className="w-4 h-4" />
                        <span>Dismiss</span>
                      </Button>
                    </div>
                  )}
                </div>

                {rep.details && (
                  <div className="p-3.5 rounded-xl bg-cp-bg border border-cp-border text-xs text-cp-navy space-y-1">
                    <span className="font-bold text-cp-muted block">Details from Reporter:</span>
                    <p className="leading-relaxed">{rep.details}</p>
                  </div>
                )}

                {rep.actionNotes && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <span className="font-bold text-emerald-950 block">Moderator Resolution Notes:</span>
                    <p className="leading-relaxed">{rep.actionNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 rounded-2xl bg-cp-surface border border-cp-border text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-cp-navy">No Reports in Queue</h3>
            <p className="text-xs text-cp-muted max-w-md mx-auto">
              There are currently no community reports awaiting administrative review under this filter status.
            </p>
          </div>
        )}

        {resolvingReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-cp-surface border border-cp-border p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-cp-border pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-cp-navy">
                    {resolveType === ReportStatus.RESOLVED ? 'Resolve Community Report' : 'Dismiss Report'}
                  </h3>
                  <p className="text-xs text-cp-muted">
                    Target: {resolvingReport.targetType} • {resolvingReport.reason}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setResolvingReport(null)}
                  className="p-1.5 rounded-lg text-cp-muted hover:text-cp-navy"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmResolve} className="space-y-4">
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-cp-navy">Administrative Action Notes *</label>
                  <textarea
                    rows={3}
                    required
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Document actions taken (e.g. verified legitimate club, removed third-party link, suspended listing)..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-cp-bg border border-cp-border text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
                  />
                </div>

                <div className="pt-2 border-t border-cp-border flex items-center justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setResolvingReport(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-cp-muted hover:text-cp-navy"
                  >
                    Cancel
                  </button>
                  <Button size="sm" onClick={handleConfirmResolve} disabled={submitting}>
                    {submitting ? 'Recording...' : `Confirm ${resolveType}`}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
