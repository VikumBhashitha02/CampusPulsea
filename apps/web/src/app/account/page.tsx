'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Building2,
  Calendar,
  ShieldCheck,
  Edit3,
  LogOut,
  Sparkles,
  Bookmark,
  Ticket,
  Bell,
  Users,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/auth-context';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login?redirect=/account');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-xs text-[#64748B]">
        <div className="flex items-center gap-2 font-medium">
          <div className="w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          <span>Loading student account...</span>
        </div>
      </div>
    );
  }

  const firstName = (user.name ? user.name.split(' ')[0] : '') || 'Student';
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Recently';

  const universityName = user.studentProfile?.university?.name || null;
  const facultyName = user.studentProfile?.faculty?.name || null;

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 section-container py-8 md:py-10 space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E2E8F0]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Student Command Center</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              Welcome back, {firstName}!
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Track your campus registrations, saved opportunities, and team rosters.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/explore"
              className="btn-primary text-xs py-2 px-3.5 shadow-xs"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Catalog</span>
            </Link>
            <Link
              href="/account/profile"
              className="btn-secondary text-xs py-2 px-3.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Profile Card & Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Identity Pill Card */}
          <div className="md:col-span-1 rounded-xl bg-white border border-[#E2E8F0] p-6 text-center space-y-3.5 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#0F172A] text-[#FEB703] flex items-center justify-center text-xl font-bold mx-auto shadow-xs">
              {firstName.charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">{user.name}</h2>
              <p className="text-xs text-[#64748B] truncate mt-0.5">{user.email}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                {user.roles?.[0] || 'STUDENT'}
              </span>
            </div>
          </div>

          {/* Academic Affiliation & Overview */}
          <div className="md:col-span-2 p-5 sm:p-6 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              Academic & Account Summary
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#64748B]">
                  <User className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Full Name</span>
                </div>
                <div className="font-semibold text-sm text-[#0F172A]">{user.name}</div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#64748B]">
                  <Mail className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Email Address</span>
                </div>
                <div className="font-semibold text-sm text-[#0F172A] truncate">{user.email}</div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#64748B]">
                  <Building2 className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>University Institution</span>
                </div>
                <div className="font-semibold text-sm text-[#0F172A]">
                  {universityName || <span className="text-[#94A3B8] font-normal">Not specified</span>}
                </div>
                {facultyName && <p className="text-[11px] text-[#64748B]">{facultyName}</p>}
              </div>

              <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#64748B]">
                  <Calendar className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Member Since</span>
                </div>
                <div className="font-semibold text-sm text-[#0F172A]">{memberSince}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Account Status: <strong className="text-emerald-700 font-semibold">Active & Verified</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Shortcuts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/account/saved"
            className="p-5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all flex items-start gap-3.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
              <Bookmark className="w-4 h-4 text-[#D97706]" />
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-amber-800 transition-colors">
                  Saved Opportunities
                </h4>
                <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-[#64748B]">
                View bookmarked competitions and hackathons.
              </p>
            </div>
          </Link>

          <Link
            href="/account/registrations"
            className="p-5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all flex items-start gap-3.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
              <Ticket className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-emerald-800 transition-colors">
                  My Registrations
                </h4>
                <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-[#64748B]">
                Check registration status, tickets, and RSVP details.
              </p>
            </div>
          </Link>

          <Link
            href="/account/calendar"
            className="p-5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all flex items-start gap-3.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-blue-800 transition-colors">
                  My Calendar
                </h4>
                <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-[#64748B]">
                Track upcoming deadlines, rounds, and workshops.
              </p>
            </div>
          </Link>

          <Link
            href="/account/teams"
            className="p-5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all flex items-start gap-3.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-purple-800 transition-colors">
                  Team Finder
                </h4>
                <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-[#64748B]">
                Find teammates and manage competition squads.
              </p>
            </div>
          </Link>

          <Link
            href="/account/notifications"
            className="p-5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all flex items-start gap-3.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-[#D97706]" />
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-amber-800 transition-colors">
                  Notifications
                </h4>
                <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-[#64748B]">
                Deadline reminders and team request updates.
              </p>
            </div>
          </Link>

          <Link
            href="/account/profile"
            className="p-5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all flex items-start gap-3.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Edit3 className="w-4 h-4 text-[#0F172A]" />
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-slate-950 transition-colors">
                  Profile Details
                </h4>
                <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-[#64748B]">
                Update bio, student skills, and university info.
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
