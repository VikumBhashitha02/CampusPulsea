import React from 'react';
import Link from 'next/link';
import {
  Code,
  Trophy,
  BookOpen,
  Microscope,
  Presentation,
  Award,
  Briefcase,
  Palette,
  HeartHandshake,
  ArrowRight,
} from 'lucide-react';

const CATEGORIES = [
  {
    name: 'Hackathons',
    slug: 'hackathons',
    description: '24-48 hour coding sprints and product build marathons',
    icon: Code,
    color: 'text-amber-600 bg-amber-50 group-hover:bg-amber-100',
  },
  {
    name: 'Competitions',
    slug: 'competitions',
    description: 'Business case studies, algorithmic contests, and olympiads',
    icon: Trophy,
    color: 'text-blue-600 bg-blue-50 group-hover:bg-blue-100',
  },
  {
    name: 'Workshops',
    slug: 'workshops',
    description: 'Hands-on technical bootcamps and faculty masterclasses',
    icon: BookOpen,
    color: 'text-emerald-600 bg-emerald-50 group-hover:bg-emerald-100',
  },
  {
    name: 'Research',
    slug: 'research',
    description: 'Undergraduate research mentorship grants and journal calls',
    icon: Microscope,
    color: 'text-purple-600 bg-purple-50 group-hover:bg-purple-100',
  },
  {
    name: 'Conferences',
    slug: 'conferences',
    description: 'Academic summits, tech symposiums, and keynote forums',
    icon: Presentation,
    color: 'text-indigo-600 bg-indigo-50 group-hover:bg-indigo-100',
  },
  {
    name: 'Scholarships',
    slug: 'scholarships',
    description: 'Faculty awards, tuition grants, and exchange initiatives',
    icon: Award,
    color: 'text-rose-600 bg-rose-50 group-hover:bg-rose-100',
  },
  {
    name: 'Internships',
    slug: 'careers',
    description: 'Campus recruitment drives, career fairs, and fast-track interviews',
    icon: Briefcase,
    color: 'text-teal-600 bg-teal-50 group-hover:bg-teal-100',
  },
  {
    name: 'Arts & Culture',
    slug: 'arts-culture',
    description: 'Drama festivals, musical productions, debating, and creative showcases',
    icon: Palette,
    color: 'text-pink-600 bg-pink-50 group-hover:bg-pink-100',
  },
  {
    name: 'Volunteering',
    slug: 'volunteering',
    description: 'Community outreach, sustainability projects, and social welfare',
    icon: HeartHandshake,
    color: 'text-emerald-600 bg-emerald-50 group-hover:bg-emerald-100',
  },
];

export function CategorySection() {
  return (
    <section id="categories" className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
      <div className="section-container py-14 md:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
              Browse by Domain
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] tracking-tight">
              Explore Opportunities by Category
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-xl">
              From competitive coding and case challenges to peer research and student leadership.
            </p>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F172A] hover:text-amber-700 transition-colors self-start sm:self-auto"
          >
            <span>View all in catalog</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D97706]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/explore?categorySlug=${cat.slug}`}
                className="group p-5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${cat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-amber-800 transition-colors">
                    {cat.name}
                  </h3>
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  {cat.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
