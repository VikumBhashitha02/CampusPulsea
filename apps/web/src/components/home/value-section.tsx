import React from 'react';
import { Search, Users2, TrendingUp } from 'lucide-react';

const VALUES = [
  {
    icon: Search,
    title: 'Discover',
    tagline: 'Never Miss a Deadline',
    description:
      'Search and filter hackathons, research grants, design sprints, and academic conferences tailored to your university faculty.',
  },
  {
    icon: Users2,
    title: 'Connect',
    tagline: 'Form Inter-Campus Squads',
    description:
      'Connect with verified academic societies, student chapters, and cross-university peers to build multi-disciplinary competition teams.',
  },
  {
    icon: TrendingUp,
    title: 'Achieve',
    tagline: 'Build Real Portfolio Proof',
    description:
      'Gain tangible credentials, win prize grants, and connect directly with industry partners, tech founders, and faculty mentors.',
  },
];

export function ValueSection() {
  return (
    <section id="about" className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
      <div className="section-container py-14 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider">
            Why CampusPulse
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] tracking-tight">
            Built for Students, Driven by Campus Communities
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Every university student deserves equal, instant access to academic, competitive, and career-defining opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {VALUES.map((val) => {
            const Icon = val.icon;
            return (
              <div
                key={val.title}
                className="p-6 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-3.5"
              >
                <div className="w-10 h-10 rounded-lg bg-[#0F172A] text-[#FEB703] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                    {val.tagline}
                  </span>
                  <h3 className="text-base font-bold text-[#0F172A] mt-1 mb-1.5">
                    {val.title}
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {val.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
