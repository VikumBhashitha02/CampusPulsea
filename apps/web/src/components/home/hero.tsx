import React from 'react';
import Link from 'next/link';
import { Compass, ArrowRight, CheckCircle2, Search, Building2, Flame } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white border-b border-[#E2E8F0]">
      {/* Subtle ambient light at the top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-gradient-to-b from-amber-50/40 to-transparent pointer-events-none" />

      <div className="section-container pt-14 pb-18 md:pt-20 md:pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & Value Prop */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FEB703]" />
              <span>The National Student Opportunities Platform</span>
            </div>

            <h1 className="text-display text-[#0F172A] tracking-tight">
              One Platform. <br />
              <span className="text-[#0F172A]">Every University Opportunity.</span>
            </h1>

            <p className="text-sm md:text-base text-[#475569] leading-relaxed max-w-xl mx-auto lg:mx-0">
              Discover hackathons, undergraduate research fellowships, case competitions, workshops, and student society initiatives across Sri Lanka.
            </p>

            {/* Quick search input */}
            <div className="pt-1 max-w-lg mx-auto lg:mx-0">
              <form action="/explore" method="GET" className="relative flex items-center">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  name="search"
                  placeholder="Search hackathons, research, workshops..."
                  className="w-full h-12 pl-10 pr-28 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs sm:text-sm text-[#0F172A] placeholder:text-[#94A3B8] font-medium outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 h-9 px-4 rounded-lg bg-[#0F172A] text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Search
                </button>
              </form>

              {/* Popular tags */}
              <div className="mt-3 flex items-center gap-1.5 flex-wrap justify-center lg:justify-start text-xs text-[#64748B]">
                <span className="text-[11px] font-medium text-[#94A3B8]">Popular:</span>
                <Link
                  href="/explore?categorySlug=hackathons"
                  className="px-2 py-0.5 rounded-md bg-[#F1F5F9] hover:bg-amber-50 hover:text-amber-900 transition-colors text-[11px] font-medium text-[#475569]"
                >
                  Hackathons
                </Link>
                <Link
                  href="/explore?categorySlug=research"
                  className="px-2 py-0.5 rounded-md bg-[#F1F5F9] hover:bg-amber-50 hover:text-amber-900 transition-colors text-[11px] font-medium text-[#475569]"
                >
                  Research
                </Link>
                <Link
                  href="/explore?categorySlug=competitions"
                  className="px-2 py-0.5 rounded-md bg-[#F1F5F9] hover:bg-amber-50 hover:text-amber-900 transition-colors text-[11px] font-medium text-[#475569]"
                >
                  Competitions
                </Link>
                <Link
                  href="/explore?isFree=true"
                  className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors text-[11px] font-medium"
                >
                  Free Only
                </Link>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <Link
                href="/explore"
                className="btn-primary w-full sm:w-auto text-sm py-2.5 px-6 shadow-xs"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/register?role=ORGANIZER"
                className="btn-secondary w-full sm:w-auto text-sm py-2.5 px-5 shadow-xs"
              >
                <span>For Clubs & Organizers</span>
              </Link>
            </div>

            {/* Value checklist */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto lg:mx-0 text-left border-t border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D97706] shrink-0" />
                <span className="text-xs font-medium text-[#475569]">100% Free for Students</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D97706] shrink-0" />
                <span className="text-xs font-medium text-[#475569]">Verified Campus Societies</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D97706] shrink-0" />
                <span className="text-xs font-medium text-[#475569]">Cross-Uni Team Finder</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Opportunity Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="mx-auto max-w-md lg:max-w-none space-y-4">
              {/* Card 1: MoraHack */}
              <div className="p-5 sm:p-6 rounded-xl bg-white border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                      Hackathon
                    </span>
                    <span className="text-xs text-[#64748B] font-medium flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                      Univ. of Moratuwa
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-[#D97706]" />
                    Rs. 1,000,000
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-[#0F172A] mt-3 mb-1.5">
                  MoraHack 2026: National Hackathon
                </h3>
                <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                  24-hour inter-university software sprint bringing together top student developers and product designers.
                </p>

                <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-[#F1F5F9]">
                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                    ⚡ Registration Closing Soon
                  </span>
                  <span className="text-[11px] font-medium text-[#64748B]">Hybrid · 180+ Teams</span>
                </div>
              </div>

              {/* Card 2: AI Fellowship */}
              <div className="p-5 sm:p-6 rounded-xl bg-white border border-[#E2E8F0] shadow-sm transform lg:translate-x-3">
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200/80">
                      Research
                    </span>
                    <span className="text-xs text-[#64748B] font-medium flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                      Univ. of Colombo
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700">Faculty Grant</span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-[#0F172A] mt-3 mb-1.5">
                  AI & Intelligent Systems Fellowship 2026
                </h3>
                <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                  Hands-on undergraduate research mentorship program in machine learning and computer vision.
                </p>

                <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-[#F1F5F9]">
                  <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    ✓ Undergraduates Eligible
                  </span>
                  <span className="text-[11px] font-medium text-[#64748B]">Online Sessions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
