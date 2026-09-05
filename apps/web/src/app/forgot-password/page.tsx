'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please provide your university or registered email address.');
      return;
    }

    setIsSubmitting(true);
    // Simulate recovery request
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 750);
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
            className="h-10 w-auto mx-auto object-contain"
          />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-cp-navy tracking-tight">
          Reset Your Password
        </h1>
        <p className="mt-2 text-sm text-cp-muted">
          Enter your registered email address to receive password reset instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-6 sm:px-10 space-y-6">
          {submitted ? (
            <div className="space-y-5 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-base font-bold text-cp-navy">Check your inbox</h2>
                <p className="text-xs text-cp-muted leading-relaxed">
                  If an account exists for <strong className="text-cp-navy">{email}</strong>, you will receive an email with instructions to reset your password shortly.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="btn-primary text-xs py-2.5 px-5 inline-flex items-center gap-2"
                >
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email-input" className="block text-xs font-semibold text-cp-navy">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-cp-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@campus.ac.lk"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cp-border bg-cp-bg text-sm text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow focus:ring-2 focus:ring-cp-yellow/20 transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 mt-2 text-sm justify-center font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending reset instructions...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Reset Link</span>
                  </>
                )}
              </Button>

              <div className="pt-4 border-t border-cp-border text-center text-xs text-cp-muted">
                <span>Remembered your password? </span>
                <Link href="/login" className="font-semibold text-amber-800 hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          )}
        </Card>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-cp-muted hover:text-cp-navy transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cp-bg flex items-center justify-center text-xs text-cp-muted">
          Loading reset page...
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
