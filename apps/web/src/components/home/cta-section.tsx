import React from 'react';
import Link from 'next/link';
import { Compass, ArrowRight, GraduationCap } from 'lucide-react';

export function CTASection() {
  return (
    <section className="bg-[#0F172A] text-white relative overflow-hidden border-b border-slate-800">
      <div className="section-container py-16 md:py-24 text-center relative z-10 space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#FEB703] text-xs font-bold uppercase tracking-wider">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Join the Campus Opportunity Network</span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white max-w-2xl mx-auto leading-tight tracking-tight">
          Never miss your next university opportunity.
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          From national hackathons and fellowships to campus society showcases, stay ahead with real-time deadline tracking and verified student opportunities.
        </p>

        <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/explore"
            className="btn-primary w-full sm:w-auto text-xs sm:text-sm py-2.5 px-6 shadow-md"
          >
            <Compass className="w-4 h-4 text-[#0F172A]" />
            <span>Explore Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#0F172A]" />
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-700 text-white font-semibold hover:bg-white/5 hover:border-slate-500 transition-colors text-xs sm:text-sm text-center"
          >
            Create Student Account
          </Link>
        </div>
      </div>
    </section>
  );
}
