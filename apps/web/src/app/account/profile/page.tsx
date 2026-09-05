'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Building2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  X,
} from 'lucide-react';
import { useAuth } from '../../../lib/auth/auth-context';
import { authService } from '../../../services/auth.service';
import { PageHeader } from '../../../components/ui/page-header';
import { Button } from '../../../components/ui/button';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login?redirect=/account/profile');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Full name cannot be empty.');
      return;
    }

    setIsSaving(true);
    try {
      await authService.updateProfile({ name: name.trim() });
      await refreshUser();
      setSuccessMsg('Your profile details have been saved successfully.');
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setErrorMsg(err?.message || 'Unable to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center p-6 text-xs text-cp-muted">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-cp-yellow border-t-transparent animate-spin" />
            <span>Loading profile...</span>
          </div>
        </main>
      </div>
    );
  }

  const universityName = user.studentProfile?.university?.name || null;
  const facultyName = user.studentProfile?.faculty?.name || null;
  const departmentName = user.studentProfile?.department?.name || null;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 section-container py-8 space-y-8">
        <div>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-xs font-bold text-cp-muted hover:text-cp-navy transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Account</span>
          </Link>
        </div>

        <PageHeader
          title="Profile Details"
          description="Keep your account information accurate and up to date."
          eyebrow="Student Settings"
          actions={
            <Button size="sm" onClick={() => router.back()} variant="secondary">
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </Button>
          }
        />

        {successMsg && (
          <div
            className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-800"
            role="status"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div
            className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 sm:p-8 space-y-6">
                <div className="space-y-1.5">
                  <label htmlFor="name-input" className="block text-xs font-bold text-cp-navy">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-cp-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="name-input"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cp-border bg-cp-bg text-sm text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow focus:ring-2 focus:ring-cp-yellow/20 transition-all max-w-lg"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email-display" className="block text-xs font-bold text-cp-navy">
                    Email Address
                  </label>
                  <div className="relative max-w-lg">
                    <Mail className="w-4 h-4 text-cp-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="email-display"
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cp-border bg-cp-bg text-sm text-cp-muted cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-cp-muted">
                    Email address is tied to your login credentials and cannot be modified.
                  </p>
                </div>

                <div className="pt-4 border-t border-cp-border flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Profile</span>
                      </>
                    )}
                  </Button>
                  <Link
                    href="/account"
                    className="px-4 py-2.5 rounded-lg text-sm font-semibold text-cp-muted hover:text-cp-navy hover:bg-cp-bg transition-colors text-center"
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 space-y-4">
              <h3 className="text-sm font-extrabold text-cp-navy uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cp-yellow" />
                <span>Academic Affiliation</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-cp-muted text-[11px] uppercase tracking-wide">University</span>
                  <span className="font-semibold text-cp-navy">
                    {universityName || 'Not linked to an academic institution'}
                  </span>
                </div>

                {facultyName && (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-cp-muted text-[11px] uppercase tracking-wide">Faculty</span>
                    <span className="text-cp-navy">{facultyName}</span>
                  </div>
                )}

                {departmentName && (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-cp-muted text-[11px] uppercase tracking-wide">Department</span>
                    <span className="text-cp-navy">{departmentName}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 space-y-3">
              <h3 className="text-sm font-extrabold text-cp-navy uppercase tracking-wider">
                Account Info
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-cp-muted">Member since</span>
                  <span className="font-semibold text-cp-navy">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cp-muted">Email verified</span>
                  <span className="font-semibold text-cp-navy">
                    {user.isEmailVerified ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cp-muted">Status</span>
                  <span className={`font-semibold ${user.isActive ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
