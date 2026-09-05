'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Building2,
  ExternalLink,
  Clock,
  Search,
  RefreshCw,
  Lock,
  AlertCircle,
  X,
  FileText,
  ShieldCheck,
  User,
} from 'lucide-react';
import { adminService } from '../../../services/admin.service';
import type { AdminVerificationItem } from '@campuspulse/types';
import { VerificationStatus, RoleType } from '@campuspulse/types';
import { useAuth } from '../../../lib/auth/auth-context';
import { PageHeader } from '../../../components/ui/page-header';
import { Button } from '../../../components/ui/button';

export default function AdminOrganizationsVerificationPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [verifications, setVerifications] = useState<AdminVerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | VerificationStatus>(
    VerificationStatus.PENDING,
  );
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  const [activeReq, setActiveReq] = useState<AdminVerificationItem | null>(null);
  const [decisionType, setDecisionType] = useState<VerificationStatus.APPROVED | VerificationStatus.REJECTED>(
    VerificationStatus.APPROVED,
  );
  const [decisionNotes, setDecisionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAuthorized =
    user?.roles?.some((r) =>
      [RoleType.ADMIN, RoleType.SUPER_ADMIN].includes(r as RoleType),
    );

  const loadVerifications = async () => {
    setLoading(true);
    try {
      const data = await adminService.getVerificationRequests(
        selectedFilter === 'ALL' ? undefined : selectedFilter,
      );
      setVerifications(data);
    } catch (err) {
      console.error('Failed to load verifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin/organizations');
      return;
    }

    if (isAuthenticated && isAuthorized) {
      loadVerifications();
    } else if (isAuthenticated && !isAuthorized) {
      setLoading(false);
    }
  }, [selectedFilter, authLoading, isAuthenticated, isAuthorized]);

  const handleOpenDecision = (
    req: AdminVerificationItem,
    status: VerificationStatus.APPROVED | VerificationStatus.REJECTED,
  ) => {
    setActiveReq(req);
    setDecisionType(status);
    setDecisionNotes('');
  };

  const handleConfirmDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReq) return;

    setSubmitting(true);
    try {
      await adminService.respondVerification(activeReq.id, decisionType, decisionNotes || undefined);
      setVerifications((prev) =>
        prev.map((v) =>
          v.id === activeReq.id
            ? { ...v, status: decisionType, reviewNotes: decisionNotes || null }
            : v,
        ),
      );
      setNotification({
        type: 'success',
        message: `Verification request for "${activeReq.organization?.name}" has been ${decisionType.toLowerCase()} successfully.`,
      });
      setActiveReq(null);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to record verification decision.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVerifications = verifications.filter((v) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      v.organization?.name.toLowerCase().includes(q) ||
      v.organization?.university?.name.toLowerCase().includes(q) ||
      v.requestedBy?.name.toLowerCase().includes(q) ||
      v.requestedBy?.email.toLowerCase().includes(q)
    );
  });

  if (authLoading || (loading && verifications.length === 0)) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-cp-yellow border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-cp-muted">Loading verification queue...</p>
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
            Organization Verifications are reserved for platform administrators and campus moderators.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Link href="/" className="btn-secondary text-xs">
              Return Home
            </Link>
            <Link href="/organizer" className="btn-primary text-xs">
              Organizer Portal
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
          title="Organization Verification"
          description="Review student club registration documents, faculty endorsement letters, and assign verified status."
          eyebrow="Campus Credentials & Trust"
          actions={
            <button
              onClick={loadVerifications}
              disabled={loading}
              className="p-2.5 rounded-xl border border-cp-border bg-cp-surface text-cp-muted hover:text-cp-navy transition-colors"
              title="Refresh Verifications"
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

        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: VerificationStatus.PENDING, label: 'Pending Review' },
              { id: VerificationStatus.APPROVED, label: 'Verified Clubs' },
              { id: VerificationStatus.REJECTED, label: 'Declined Requests' },
              { id: 'ALL', label: 'All Requests' },
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

          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-cp-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search club name, campus, or applicant..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-cp-surface border border-cp-border text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
            />
          </div>
        </div>

        {filteredVerifications.length > 0 ? (
          <div className="space-y-4">
            {filteredVerifications.map((req) => (
              <div
                key={req.id}
                className="bg-cp-surface rounded-2xl border border-cp-border p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {req.status === VerificationStatus.PENDING ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cp-yellow-light text-amber-800 border border-[#FDE68A]">
                          <Clock className="w-3 h-3 text-cp-yellow" />
                          <span>Pending Verification</span>
                        </span>
                      ) : req.status === VerificationStatus.APPROVED ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>✓ Verified Club</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          <span>Declined</span>
                        </span>
                      )}
                      <span className="text-xs text-cp-muted">
                        Submitted {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-cp-navy">
                      {req.organization?.name || 'Student Club'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-cp-muted">
                      <span className="flex items-center gap-1 font-medium text-cp-navy">
                        <Building2 className="w-3.5 h-3.5 text-cp-muted" />
                        <span>{req.organization?.university?.name || 'Campus'}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-cp-muted" />
                        <span>Applicant: {req.requestedBy?.name || 'Officer'}</span>
                        <span className="text-cp-muted">({req.requestedBy?.email})</span>
                      </span>
                    </div>
                  </div>

                  {req.status === VerificationStatus.PENDING && (
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Button size="sm" onClick={() => handleOpenDecision(req, VerificationStatus.APPROVED)}>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve</span>
                      </Button>

                      <Button size="sm" variant="secondary" onClick={() => handleOpenDecision(req, VerificationStatus.REJECTED)} className="text-rose-600 hover:text-rose-700">
                        <XCircle className="w-4 h-4" />
                        <span>Decline</span>
                      </Button>
                    </div>
                  )}
                </div>

                {req.notes && (
                  <div className="p-3.5 rounded-xl bg-cp-bg border border-cp-border text-xs text-cp-navy space-y-1">
                    <span className="font-bold text-cp-muted block">Applicant Endorsement Note:</span>
                    <p className="leading-relaxed">{req.notes}</p>
                  </div>
                )}

                {req.reviewNotes && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <span className="font-bold text-emerald-950 block">Moderator Audit Note:</span>
                    <p className="leading-relaxed">{req.reviewNotes}</p>
                  </div>
                )}

                {req.documentUrl && (
                  <div className="pt-3 flex items-center justify-between border-t border-cp-border text-xs">
                    <span className="text-cp-muted font-medium">Official Endorsement Attachment:</span>
                    <a
                      href={req.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-blue-700 hover:underline"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Open Document PDF</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 rounded-2xl bg-cp-surface border border-cp-border text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-cp-navy">No Verification Requests</h3>
            <p className="text-xs text-cp-muted max-w-md mx-auto">
              There are currently no verification submissions under this filter status.
            </p>
          </div>
        )}

        {activeReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-cp-surface border border-cp-border p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-cp-border pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-cp-navy">
                    {decisionType === VerificationStatus.APPROVED
                      ? 'Approve Organization Verification'
                      : 'Decline Verification Request'}
                  </h3>
                  <p className="text-xs text-cp-muted">{activeReq.organization?.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveReq(null)}
                  className="p-1.5 rounded-lg text-cp-muted hover:text-cp-navy"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmDecision} className="space-y-4">
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-cp-navy">
                    {decisionType === VerificationStatus.APPROVED
                      ? 'Approval Notes (Optional)'
                      : 'Reason for Declining (Visible to Organization) *'}
                  </label>
                  <textarea
                    rows={3}
                    required={decisionType === VerificationStatus.REJECTED}
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    placeholder={
                      decisionType === VerificationStatus.APPROVED
                        ? 'e.g. Endorsed by Student Affairs Division on Feb 2026...'
                        : 'e.g. Please attach an official signed Dean letter or Student Union letter...'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-cp-bg border border-cp-border text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
                  />
                </div>

                <div className="pt-2 border-t border-cp-border flex items-center justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveReq(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-cp-muted hover:text-cp-navy"
                  >
                    Cancel
                  </button>
                  <Button size="sm" onClick={handleConfirmDecision} disabled={submitting}>
                    {submitting ? 'Recording...' : `Confirm ${decisionType}`}
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
