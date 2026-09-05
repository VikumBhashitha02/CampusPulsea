import React from 'react';
import { GraduationCap, Building2 } from 'lucide-react';
import { UniversityCard } from '../../components/university-card';
import { universitiesService } from '../../services/universities.service';
import { EmptyState } from '../../components/ui/empty-state';

export default async function UniversitiesPage() {
  const data = await universitiesService.getUniversities({ limit: 30 });
  const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 section-container py-8 md:py-10 space-y-6">
        <div className="space-y-1 pb-5 border-b border-[#E2E8F0]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Academic Institutions</span>
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
            University & Campus Network
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl leading-relaxed">
            Explore participating universities, academic faculties, specialized departments, and
            verified campus societies across Sri Lanka.
          </p>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((uni: any) => (
              <UniversityCard key={uni.id} university={uni} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Universities Listed Yet"
            description="Participating universities and campus faculties will be listed here as they join the network."
            icon={<Building2 className="w-5 h-5 text-[#94A3B8]" />}
          />
        )}
      </main>
    </div>
  );
}
