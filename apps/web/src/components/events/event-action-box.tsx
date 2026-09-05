'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bookmark,
  ExternalLink,
  CheckCircle2,
  Share2,
  Loader2,
  AlertCircle,
  Ticket,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/auth-context';
import { bookmarksService } from '../../services/bookmarks.service';
import { registrationsService } from '../../services/registrations.service';
import { useToast } from '../../components/ui/toast';

interface EventActionBoxProps {
  eventId: string;
  slug: string;
  isFree?: boolean;
  price?: number;
  currency?: string;
  registrationUrl?: string | null;
  registrationDeadline?: string | null;
  title: string;
}

export function EventActionBox({
  eventId,
  slug,
  isFree = true,
  price,
  currency = 'LKR',
  registrationUrl,
  registrationDeadline,
  title: _title,
}: EventActionBoxProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkStudentState() {
      if (authLoading) return;
      if (!isAuthenticated) {
        setCheckingStatus(false);
        return;
      }

      try {
        setCheckingStatus(true);
        const [savedEvents, myRegistrations] = await Promise.all([
          bookmarksService.getMyBookmarks().catch(() => []),
          registrationsService.getMyRegistrations().catch(() => []),
        ]);

        if (isMounted) {
          const hasSaved = savedEvents.some((ev) => ev.id === eventId);
          setIsBookmarked(hasSaved);

          const hasReg = myRegistrations.some(
            (reg) => reg.eventId === eventId && reg.status !== 'CANCELLED',
          );
          setIsRegistered(hasReg);
        }
      } catch (err) {
        console.error('Error fetching student opportunity status:', err);
      } finally {
        if (isMounted) {
          setCheckingStatus(false);
        }
      }
    }

    checkStudentState();

    return () => {
      isMounted = false;
    };
  }, [eventId, isAuthenticated, authLoading]);

  const handleBookmarkToggle = async () => {
    setErrorMsg(null);
    if (!isAuthenticated) {
      router.push(`/login?redirect=/events/${encodeURIComponent(slug)}`);
      return;
    }

    setBookmarkLoading(true);
    const prevState = isBookmarked;
    setIsBookmarked(!prevState);

    try {
      const res = await bookmarksService.toggleBookmark(eventId);
      setIsBookmarked(res.bookmarked);
      toast({
        title: res.bookmarked ? 'Opportunity saved' : 'Removed from saved',
        description: res.bookmarked ? 'Added to your saved opportunities.' : 'Removed from your saved opportunities.',
        tone: 'success',
      });
    } catch (err: any) {
      console.error('Bookmark toggle failed:', err);
      setIsBookmarked(prevState);
      setErrorMsg('Unable to update bookmark. Please try again.');
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleRegister = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isAuthenticated && !registrationUrl) {
      router.push(`/login?redirect=/events/${encodeURIComponent(slug)}`);
      return;
    }

    if (isAuthenticated) {
      setRegisterLoading(true);
      try {
        await registrationsService.register({ eventId });
        setIsRegistered(true);
        setSuccessMsg("You're registered! Your spot is recorded for this opportunity.");

        if (registrationUrl) {
          window.open(registrationUrl, '_blank', 'noopener,noreferrer');
        }
      } catch (err: any) {
        console.error('Registration failed:', err);
        const message =
          err?.statusCode === 409
            ? 'You are already registered for this opportunity.'
            : err?.message || 'Unable to complete registration. Please try again.';
        setErrorMsg(message);
        if (err?.statusCode === 409) {
          setIsRegistered(true);
        }
      } finally {
        setRegisterLoading(false);
      }
    } else if (registrationUrl) {
      window.open(registrationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const isDeadlinePassed = registrationDeadline
    ? new Date(registrationDeadline) < new Date()
    : false;

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 sm:p-6 space-y-4 shadow-xs sticky top-24">
      <div className="space-y-1 pb-3.5 border-b border-[#F1F5F9]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
            Admission & Cost
          </span>
          {isFree ? (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
              Free Access
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
              Ticketed
            </span>
          )}
        </div>
        <div className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
          {isFree ? 'Free of Charge' : `${currency} ${price?.toLocaleString() || 0}`}
        </div>
      </div>

      {successMsg && (
        <div
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800"
          role="status"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div
          className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {isRegistered && !successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>You are registered!</span>
          </div>
          <Link
            href="/account/registrations"
            className="font-bold underline text-emerald-900 hover:text-emerald-700 text-[11px]"
          >
            My Registrations
          </Link>
        </div>
      )}

      <div className="space-y-2">
        {isRegistered ? (
          <div className="space-y-2">
            <Link
              href="/account/registrations"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Registered — View Details</span>
            </Link>
            {registrationUrl && (
              <a
                href={registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold text-cp-navy bg-cp-bg border border-cp-border hover:bg-slate-100 transition-colors"
              >
                <span>Re-open Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5 text-cp-muted" />
              </a>
            )}
          </div>
        ) : isDeadlinePassed ? (
          <div className="w-full py-3 px-4 rounded-xl text-center font-bold text-sm bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed">
            Registration Closed
          </div>
        ) : (
          <div className="space-y-1.5">
            <button
              type="button"
              disabled={registerLoading || checkingStatus}
              onClick={handleRegister}
              className="w-full btn-primary py-3.5 px-4 text-sm font-bold justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {registerLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Registration...</span>
                </>
              ) : registrationUrl ? (
                <>
                  <span>Track & Register on Official Portal</span>
                  <ExternalLink className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Ticket className="w-4 h-4" />
                  <span>RSVP & Track on CampusPulse</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-cp-muted">
              {registrationUrl
                ? 'Saves to your CampusPulse schedule and opens the official host portal.'
                : 'Directly records your participation on your CampusPulse calendar.'}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-cp-border">
        <button
          type="button"
          disabled={bookmarkLoading || checkingStatus}
          onClick={handleBookmarkToggle}
          aria-label={isBookmarked ? 'Remove saved opportunity' : 'Save opportunity'}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border ${
            isBookmarked
              ? 'bg-cp-yellow-light text-amber-800 border-amber-200 hover:bg-cp-yellow-soft'
              : 'bg-cp-surface text-cp-navy border-cp-border hover:bg-cp-bg'
          }`}
        >
          {bookmarkLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-cp-muted" />
          ) : (
            <Bookmark
              className={`w-4 h-4 ${
                isBookmarked ? 'fill-cp-yellow text-cp-yellow' : 'text-cp-muted'
              }`}
            />
          )}
          <span>{isBookmarked ? 'Saved to Bookmarks' : 'Save Opportunity'}</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          title="Share Opportunity"
          aria-label="Share Opportunity"
          className="p-2.5 rounded-xl border border-cp-border bg-cp-surface hover:bg-cp-bg text-cp-muted hover:text-cp-navy transition-colors relative"
        >
          <Share2 className="w-4 h-4" />
          {copied && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-cp-navy text-white text-[10px] font-bold rounded shadow-md whitespace-nowrap">
              Copied!
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
