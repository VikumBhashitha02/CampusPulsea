'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/auth-context';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();

  const redirectUrl = searchParams.get('redirect') || '/account';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(redirectUrl);
    }
  }, [authLoading, isAuthenticated, redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!firstName.trim()) {
      setError('Please provide your first name.');
      return;
    }
    if (!lastName.trim()) {
      setError('Please provide your last name.');
      return;
    }
    if (!email.trim()) {
      setError('Please provide a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(password)) {
      setError('Password must contain at least one letter and one number.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords are identical.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      router.push(redirectUrl);
    } catch (err: any) {
      console.error('Registration error:', err);
      const message =
        err?.statusCode === 409
          ? 'An account with this email address is already registered. Please sign in instead.'
          : err?.statusCode === 400
            ? err?.message || 'Invalid registration details. Please verify your input.'
            : err?.message || 'Unable to complete registration. Please try again later.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cp-bg">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block transition-opacity hover:opacity-90 mb-4">
          <Image
            src="/logo.svg"
            alt="CampusPulse"
            width={200}
            height={50}
            priority
            className="h-11 w-auto mx-auto object-contain"
          />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-cp-navy tracking-tight">
          Join CampusPulse
        </h1>
        <p className="mt-2 text-sm text-cp-muted">
          Create your free student account to discover and track campus opportunities.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-6 sm:px-10 space-y-6">
          {error && (
            <div
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="firstname-input" className="block text-xs font-semibold text-cp-navy">
                  First Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-cp-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="firstname-input"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Kasun"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-cp-border bg-cp-bg text-sm text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow focus:ring-2 focus:ring-cp-yellow/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="lastname-input" className="block text-xs font-semibold text-cp-navy">
                  Last Name
                </label>
                <input
                  id="lastname-input"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Perera"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-cp-border bg-cp-bg text-sm text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow focus:ring-2 focus:ring-cp-yellow/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email-input" className="block text-xs font-semibold text-cp-navy">
                University / Personal Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-cp-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="email-input"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kasun.p@student.uoc.lk"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-cp-border bg-cp-bg text-sm text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow focus:ring-2 focus:ring-cp-yellow/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password-input" className="block text-xs font-semibold text-cp-navy">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-cp-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="password-input"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-cp-border bg-cp-bg text-sm text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow focus:ring-2 focus:ring-cp-yellow/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cp-muted hover:text-cp-navy p-1 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-cp-muted">
                Must be at least 8 characters with letters and numbers.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm-password-input" className="block text-xs font-semibold text-cp-navy">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-cp-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="confirm-password-input"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-cp-border bg-cp-bg text-sm text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow focus:ring-2 focus:ring-cp-yellow/20 transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 mt-3 text-sm font-semibold justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating student account...</span>
                </>
              ) : (
                <>
                  <span>Create Student Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-4 border-t border-cp-border text-center text-xs text-cp-muted">
            <span>Already have an account? </span>
            <Link
              href={redirectUrl !== '/account' ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'}
              className="font-semibold text-amber-800 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-cp-muted hover:text-cp-navy transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to CampusPulse Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cp-bg flex items-center justify-center text-xs text-cp-muted">
          Loading registration...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
