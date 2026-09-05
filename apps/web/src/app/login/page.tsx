'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Fraunces } from 'next/font/google';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Loader2,
  ArrowLeft,
  Users,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/auth-context';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
});

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const redirectUrl = searchParams.get('redirect') || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [portalType, setPortalType] = useState<'student' | 'organizer'>('student');

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(redirectUrl);
    }
  }, [authLoading, isAuthenticated, redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both your university/student email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      router.push(redirectUrl);
    } catch (err: any) {
      console.error('Login error:', err);

      const message =
        err?.statusCode === 401
          ? 'Invalid email or password. Please verify your credentials.'
          : err?.statusCode === 403
            ? 'Your account is suspended or inactive. Please contact support.'
            : err?.message || 'Unable to sign in. Please verify your internet connection and try again.';

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-[#F8F6F0] selection:bg-[#FEB703] selection:text-[#12151F]">
      {/* =====================================================
          LEFT — CAMPUS NOTICE BOARD PANEL
      ====================================================== */}
      <section className="hidden lg:flex lg:w-[46%] xl:w-[44%] relative overflow-hidden bg-[#12151F] text-[#F5F3EC] flex-col justify-between px-12 py-12 xl:px-16 xl:py-14">
        {/* one restrained ambient glow, no scattered blobs */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#FEB703]/10 blur-[110px] pointer-events-none" />

        {/* Logo row */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src="/logo-white.svg"
              alt="CampusPulse"
              width={180}
              height={44}
              priority
              className="h-9 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-2 text-xs font-medium text-[#F5F3EC]/60">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FEB703] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FEB703]" />
            </span>
            Live across 25+ universities
          </div>
        </div>

        {/* Headline + ticket */}
        <div className="relative z-10 my-auto py-8 max-w-md">
          <h1 className={`${fraunces.className} text-[2.6rem] xl:text-5xl leading-[1.1] font-medium text-[#F5F3EC]`}>
            One gateway to
            <br />
            <span className="italic">every campus opportunity.</span>
          </h1>

          <p className="mt-5 text-[15px] text-[#F5F3EC]/60 leading-relaxed max-w-sm">
            Verified inter-university hackathons, research grants, case competitions and faculty workshops — curated in one place, free for students.
          </p>

          {/* Event pass ticket */}
          <div className="mt-10 -rotate-1">
            <div className="relative bg-[#F5F3EC] text-[#12151F] rounded-xl shadow-[0_18px_40px_-12px_rgba(0,0,0,0.5)] px-6 pt-5 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A23B2E]">
                    Hackathon pass
                  </p>
                  <p className="mt-1 text-[13px] font-semibold text-[#12151F]/80">
                    University of Moratuwa
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#5B6472]">
                    Prize pool
                  </p>
                  <p className={`${fraunces.className} text-base font-semibold text-[#12151F]`}>
                    Rs. 1,000,000
                  </p>
                </div>
              </div>

              {/* Perforated tear line with punch-hole notches */}
              <div className="relative my-4">
                <div className="border-t border-dashed border-[#12151F]/25" />
                <span className="absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#12151F]" />
                <span className="absolute -right-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#12151F]" />
              </div>

              <h4 className={`${fraunces.className} text-lg font-medium leading-snug`}>
                MoraHack 2026: Inter-University Software Sprint
              </h4>
              <p className="mt-1.5 text-[13px] text-[#5B6472] leading-relaxed">
                A 24-hour national hackathon bringing together Sri Lanka&apos;s top student innovators.
              </p>

              <div className="mt-4 flex items-center justify-between text-[11px] pt-3 border-t border-dashed border-[#12151F]/15">
                <span className="inline-flex items-center gap-1.5 font-medium text-[#A23B2E]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A23B2E]" />
                  Registration closing soon
                </span>
                <span className="text-[#5B6472]">180+ teams registered</span>
              </div>
            </div>
          </div>

          {/* Scoreboard strip */}
          <div className="mt-9 flex items-center gap-6">
            <div className="flex items-baseline gap-1.5">
              <span className={`${fraunces.className} text-2xl font-medium text-[#F5F3EC]`}>25+</span>
              <span className="text-xs text-[#F5F3EC]/45">universities</span>
            </div>
            <span className="h-4 w-px bg-[#F5F3EC]/15" />
            <div className="flex items-baseline gap-1.5">
              <span className={`${fraunces.className} text-2xl font-medium text-[#FEB703]`}>100%</span>
              <span className="text-xs text-[#F5F3EC]/45">free for students</span>
            </div>
            <span className="h-4 w-px bg-[#F5F3EC]/15" />
            <div className="flex items-baseline gap-1.5">
              <span className={`${fraunces.className} text-2xl font-medium text-[#F5F3EC]`}>LKR 5M+</span>
              <span className="text-xs text-[#F5F3EC]/45">in prizes</span>
            </div>
          </div>
        </div>

        {/* Trust footnote */}
        <div className="relative z-10 pt-4 flex items-center justify-between text-[11px] text-[#F5F3EC]/40 border-t border-[#F5F3EC]/10">
          <span>Official Sri Lankan higher-ed network</span>
          <span>Encrypted student auth</span>
        </div>
      </section>

      {/* =====================================================
          RIGHT — FORM PANEL
      ====================================================== */}
      <section className="flex-1 flex flex-col justify-between px-6 py-10 sm:px-12 lg:px-16 xl:px-20 bg-[#F8F6F0] relative">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between pb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.svg"
              alt="CampusPulse"
              width={170}
              height={42}
              priority
              className="h-8 w-auto object-contain"
            />
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-[#5B6472] hover:text-[#12151F] inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
        </div>

        {/* Centered card */}
        <div className="w-full max-w-[420px] mx-auto my-auto">
          <div className="mb-8">
            <div
              className="inline-flex -rotate-6 items-center justify-center w-16 h-16 rounded-full border border-dashed border-[#A23B2E]/50 text-center mb-5"
              aria-hidden="true"
            >
              <span className="text-[8px] font-semibold uppercase tracking-[0.1em] leading-tight text-[#A23B2E]">
                Verified
                <br />
                Network
              </span>
            </div>

            <h2 className={`${fraunces.className} text-4xl font-medium text-[#12151F] tracking-tight`}>
              Welcome back.
            </h2>
            <p className="mt-2 text-sm text-[#5B6472] leading-relaxed">
              Sign in to manage your registrations, track deadlines, and connect with event teams.
            </p>
          </div>

          {/* Ticket-counter tabs */}
          <div className="mb-8 flex items-center gap-6 border-b border-[#DED9CB]">
            <button
              type="button"
              onClick={() => setPortalType('student')}
              className={`relative pb-3 text-sm font-semibold inline-flex items-center gap-1.5 transition-colors ${portalType === 'student' ? 'text-[#12151F]' : 'text-[#9A968A] hover:text-[#5B6472]'
                }`}
            >
              <Users className="w-3.5 h-3.5" />
              Student
              {portalType === 'student' && (
                <span className="absolute inset-x-0 -bottom-px h-[2px] bg-[#FEB703]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setPortalType('organizer')}
              className={`relative pb-3 text-sm font-semibold inline-flex items-center gap-1.5 transition-colors ${portalType === 'organizer' ? 'text-[#12151F]' : 'text-[#9A968A] hover:text-[#5B6472]'
                }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Club / organizer
              {portalType === 'organizer' && (
                <span className="absolute inset-x-0 -bottom-px h-[2px] bg-[#FEB703]" />
              )}
            </button>
          </div>

          {error && (
            <div
              className="mb-5 p-3.5 rounded-lg bg-[#A23B2E]/[0.06] border border-[#A23B2E]/25 flex items-start gap-2.5"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-[#A23B2E] shrink-0 mt-0.5" />
              <div className="text-xs font-medium leading-relaxed text-[#7C2E23]">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email-input" className="block text-xs font-semibold text-[#12151F]">
                {portalType === 'student' ? 'Student email' : 'Organizer account email'}
              </label>
              <div className="flex items-center gap-3 border-b border-[#DAD5C8] focus-within:border-[#12151F] transition-colors">
                <Mail className="w-4 h-4 text-[#9A968A]" />
                <input
                  id="email-input"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={portalType === 'student' ? 'student@campus.ac.lk' : 'lead@society.org'}
                  className="w-full bg-transparent py-2.5 text-sm text-[#12151F] placeholder:text-[#B1AC9D] font-medium outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password-input" className="block text-xs font-semibold text-[#12151F]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#A23B2E] hover:text-[#12151F] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="flex items-center gap-3 border-b border-[#DAD5C8] focus-within:border-[#12151F] transition-colors">
                <Lock className="w-4 h-4 text-[#9A968A]" />
                <input
                  id="password-input"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent py-2.5 text-sm text-[#12151F] placeholder:text-[#B1AC9D] font-medium outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#9A968A] hover:text-[#12151F] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#DAD5C8] text-[#12151F] focus:ring-[#12151F]/20 accent-[#12151F] cursor-pointer"
              />
              <span className="text-xs font-medium text-[#5B6472]">Keep me signed in for 7 days</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 mt-2 rounded-lg bg-[#12151F] text-[#FEB703] text-sm font-semibold flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in
                </>
              ) : (
                <>
                  Sign in to CampusPulse
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-5 flex items-center justify-between text-[11px] text-[#9A968A]">
            <span className="font-medium">Quick test credentials</span>
            <button
              type="button"
              onClick={() => {
                setEmail('ayesha.fernando@student.uoc.test');
                setPassword('StudentPass123!');
              }}
              className="font-semibold text-[#A23B2E] hover:text-[#12151F] underline underline-offset-2 transition-colors"
            >
              Autofill demo
            </button>
          </div>

          {/* Register */}
          <div className="mt-6 pt-5 border-t border-[#DED9CB] text-center">
            <p className="text-xs text-[#5B6472]">Don&apos;t have an account yet?</p>
            <Link
              href={
                redirectUrl !== '/account'
                  ? `/register?redirect=${encodeURIComponent(redirectUrl)}`
                  : '/register'
              }
              className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-[#A23B2E] hover:text-[#12151F] transition-colors"
            >
              Create free student profile
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-[#9A968A] hover:text-[#5B6472] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to CampusPulse homepage
            </Link>
          </div>
        </div>

        {/* Desktop trust indicators */}
        <div className="hidden lg:flex items-center justify-between text-[11px] text-[#9A968A] pt-6 border-t border-[#DED9CB] max-w-md mx-auto w-full">
          <span>Protected by 256-bit TLS encryption</span>
          <div className="flex items-center gap-4">
            <Link href="/explore" className="hover:text-[#12151F] transition-colors">
              Explore events
            </Link>
            <span>·</span>
            <Link href="/universities" className="hover:text-[#12151F] transition-colors">
              Institutions
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#12151F] flex items-center justify-center">
          <div className="flex items-center gap-3 text-sm font-semibold text-[#FEB703]">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading CampusPulse...
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}