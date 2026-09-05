'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  ArrowLeft,
  Search,
  CheckCircle2,
  Lock,
  RefreshCw,
  AlertCircle,
  UserCheck,
  UserX,
  Building2,
} from 'lucide-react';
import { adminService } from '../../../services/admin.service';
import type { AdminUserItem } from '@campuspulse/types';
import { RoleType } from '@campuspulse/types';
import { useAuth } from '../../../lib/auth/auth-context';
import { PageHeader } from '../../../components/ui/page-header';
import { Button } from '../../../components/ui/button';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated, isLoading: authLoading } = useAuth();

  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<'ALL' | RoleType>('ALL');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  const [statusTargetUser, setStatusTargetUser] = useState<AdminUserItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isAuthorized =
    currentUser?.roles?.some((r) =>
      [RoleType.ADMIN, RoleType.SUPER_ADMIN].includes(r as RoleType),
    );

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({
        search: search.trim() || undefined,
        role: selectedRole === 'ALL' ? undefined : selectedRole,
        limit: 50,
      });
      setUsers(res.items || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin/users');
      return;
    }

    if (isAuthenticated && isAuthorized) {
      loadUsers();
    } else if (isAuthenticated && !isAuthorized) {
      setLoading(false);
    }
  }, [selectedRole, authLoading, isAuthenticated, isAuthorized]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleConfirmToggleStatus = async () => {
    if (!statusTargetUser) return;
    const newStatus = !statusTargetUser.isActive;

    setActionLoading(true);
    try {
      await adminService.updateUserStatus(statusTargetUser.id, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === statusTargetUser.id ? { ...u, isActive: newStatus } : u)),
      );
      setNotification({
        type: 'success',
        message: `Account for "${statusTargetUser.name}" has been ${newStatus ? 're-enabled' : 'suspended'}.`,
      });
      setStatusTargetUser(null);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to update account status.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (role: RoleType) => {
    switch (role) {
      case RoleType.SUPER_ADMIN:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-50 text-rose-800 border border-rose-200">
            SUPER_ADMIN
          </span>
        );
      case RoleType.ADMIN:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cp-yellow-light text-amber-800 border border-[#FDE68A]">
            ADMIN
          </span>
        );
      case RoleType.ORGANIZER:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
            ORGANIZER
          </span>
        );
      case RoleType.UNIVERSITY_ADMIN:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
            UNI_ADMIN
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            STUDENT
          </span>
        );
    }
  };

  if (authLoading || (loading && users.length === 0)) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-cp-yellow border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-cp-muted">Loading user directory...</p>
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
            User directory and governance controls are reserved for platform administrators.
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
          title="Platform User Directory"
          description="Inspect registered student and organizer accounts, verify roles, and manage account status."
          eyebrow="User Governance & Directory"
          actions={
            <button
              onClick={loadUsers}
              disabled={loading}
              className="p-2.5 rounded-xl border border-cp-border bg-cp-surface text-cp-muted hover:text-cp-navy transition-colors"
              title="Refresh Directory"
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
              { id: 'ALL', label: 'All Roles' },
              { id: RoleType.STUDENT, label: 'Students' },
              { id: RoleType.ORGANIZER, label: 'Organizers' },
              { id: RoleType.ADMIN, label: 'Admins' },
              { id: RoleType.SUPER_ADMIN, label: 'Super Admins' },
              { id: RoleType.UNIVERSITY_ADMIN, label: 'University Admins' },
            ].map((tab) => {
              const active = selectedRole === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedRole(tab.id as any)}
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

          <form onSubmit={handleSearchSubmit} className="relative max-w-md">
            <Search className="w-4 h-4 text-cp-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user name or email..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-cp-surface border border-cp-border text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
            />
          </form>
        </div>

        {users.length > 0 ? (
          <div className="bg-cp-surface rounded-2xl border border-cp-border overflow-hidden">
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cp-bg border-b border-cp-border text-cp-muted font-bold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">User</th>
                    <th className="py-3.5 px-4">Roles</th>
                    <th className="py-3.5 px-4">Campus / Batch</th>
                    <th className="py-3.5 px-4">Email Status</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cp-border">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-cp-bg transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-cp-yellow-light text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <div className="space-y-0.5">
                            <span className="font-bold text-cp-navy block">{u.name}</span>
                            <span className="text-cp-muted text-[11px]">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((r, idx) => (
                            <span key={idx}>{getRoleBadge(r)}</span>
                          ))}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-cp-navy">
                        {u.studentProfile?.university ? (
                          <div>
                            <span className="font-medium block">{u.studentProfile.university.name}</span>
                            {u.studentProfile.batchYear && (
                              <span className="text-[11px] text-cp-muted">
                                Batch {u.studentProfile.batchYear}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-cp-muted">—</span>
                        )}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        {u.isEmailVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cp-muted">
                            <span>Unverified</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            Suspended
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setStatusTargetUser(u)}
                          className={
                            u.isActive
                              ? 'text-rose-600 hover:text-rose-700 border-rose-200 bg-rose-50 hover:bg-rose-100'
                              : 'text-emerald-700 hover:text-emerald-800 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                          }
                        >
                          {u.isActive ? 'Suspend' : 'Re-enable'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="block lg:hidden divide-y divide-cp-border">
              {users.map((u) => (
                <div key={u.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cp-yellow-light text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-bold text-cp-navy block">{u.name}</span>
                        <span className="text-xs text-cp-muted">{u.email}</span>
                      </div>
                    </div>
                    {u.isActive ? (
                      <span className="badge-yellow text-[10px] font-bold">Active</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                        Suspended
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {u.roles.map((r, idx) => (
                      <span key={idx}>{getRoleBadge(r)}</span>
                    ))}
                  </div>

                  {u.studentProfile?.university && (
                    <div className="text-xs text-cp-muted flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{u.studentProfile.university.name}</span>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setStatusTargetUser(u)}
                      className={
                        u.isActive
                          ? 'text-rose-600 hover:text-rose-700 border-rose-200 bg-rose-50 hover:bg-rose-100'
                          : 'text-emerald-700 hover:text-emerald-800 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                      }
                    >
                      {u.isActive ? 'Suspend Account' : 'Re-enable Account'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-16 rounded-2xl bg-cp-surface border border-cp-border text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cp-yellow-light text-amber-800 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6 text-cp-yellow" />
            </div>
            <h3 className="text-base font-bold text-cp-navy">No Users Found</h3>
            <p className="text-xs text-cp-muted max-w-md mx-auto">
              No platform accounts match your current query or role filter.
            </p>
          </div>
        )}

        {statusTargetUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-cp-surface border border-cp-border p-6 space-y-5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  statusTargetUser.isActive ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                {statusTargetUser.isActive ? <UserX className="w-6 h-6" /> : <UserCheck className="w-6 h-6" />}
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-cp-navy">
                  {statusTargetUser.isActive
                    ? `Suspend Account for ${statusTargetUser.name}?`
                    : `Re-enable Account for ${statusTargetUser.name}?`}
                </h3>
                <p className="text-xs text-cp-muted leading-relaxed">
                  {statusTargetUser.isActive
                    ? 'The user will be immediately logged out and blocked from logging in or creating opportunities until re-enabled.'
                    : 'The user will regain standard platform access to their profile and registrations.'}
                </p>
              </div>

              <div className="pt-3 border-t border-cp-border flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setStatusTargetUser(null)}
                  className="px-4 py-2 rounded-xl font-semibold text-cp-muted hover:text-cp-navy"
                >
                  Cancel
                </button>
                <Button
                  size="sm"
                  onClick={handleConfirmToggleStatus}
                  disabled={actionLoading}
                  className={
                    statusTargetUser.isActive
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }
                >
                  {actionLoading
                    ? 'Updating...'
                    : statusTargetUser.isActive
                      ? 'Confirm Suspension'
                      : 'Re-enable Account'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
