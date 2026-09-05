import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white border-t border-[#E2E8F0]">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-[#E2E8F0]">
          <div className="space-y-3.5 lg:col-span-2">
            <Link href="/" className="inline-block transition-opacity hover:opacity-90">
              <Image
                src="/logo.svg"
                alt="CampusPulse"
                width={150}
                height={36}
                className="h-7 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-[#64748B] leading-relaxed max-w-sm">
              The centralized national platform for university opportunities — hackathons, research fellowships, competitions, and verified campus societies.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-medium text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Discover</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/explore" className="text-[#64748B] hover:text-[#0F172A] transition-colors">
                  All Opportunities
                </Link>
              </li>
              <li>
                <Link href="/universities" className="text-[#64748B] hover:text-[#0F172A] transition-colors">
                  Universities Directory
                </Link>
              </li>
              <li>
                <Link href="/explore?categorySlug=hackathons" className="text-[#64748B] hover:text-[#0F172A] transition-colors">
                  Hackathons & Sprints
                </Link>
              </li>
              <li>
                <Link href="/explore?categorySlug=research" className="text-[#64748B] hover:text-[#0F172A] transition-colors">
                  Undergraduate Research
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/register" className="text-[#64748B] hover:text-[#0F172A] transition-colors">
                  Create Student Account
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-[#64748B] hover:text-[#0F172A] transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register?role=ORGANIZER" className="text-[#64748B] hover:text-[#0F172A] transition-colors">
                  For Student Clubs & Organizers
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-[#64748B] hover:text-[#0F172A] transition-colors">
                  Opportunity Search
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#94A3B8]">
          <p>© {currentYear} CampusPulse. All rights reserved.</p>
          <p>Built for university students and verified campus communities.</p>
        </div>
      </div>
    </footer>
  );
}
