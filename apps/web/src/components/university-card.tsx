import React from 'react';
import Link from 'next/link';
import { Building2, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { UniversityItem } from '../services/universities.service';

interface UniversityCardProps {
  university: UniversityItem;
}

export function UniversityCard({ university }: UniversityCardProps) {
  return (
    <Link
      href={`/universities/${university.slug}`}
      className="group block rounded-xl bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] p-5 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="space-y-3.5">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] overflow-hidden flex items-center justify-center p-2">
            {university.logoUrl ? (
              <img
                src={university.logoUrl}
                alt={university.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <Building2 className="w-6 h-6 text-[#D97706]" />
            )}
          </div>

          {university.isVerified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
              <CheckCircle2 className="w-3 h-3 text-[#D97706]" />
              Verified
            </span>
          )}
        </div>

        <div>
          <h3 className="text-sm sm:text-[15px] font-bold text-[#0F172A] group-hover:text-amber-800 transition-colors">
            {university.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-1">
            <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>{university.city || 'Sri Lanka'}</span>
          </div>
        </div>

        {university.description && (
          <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
            {university.description}
          </p>
        )}
      </div>

      <div className="pt-4 mt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[#64748B]">
          <span>{university._count?.faculties || university.faculties?.length || 0} Faculties</span>
          <span>•</span>
          <span>{university._count?.organizations || 0} Societies</span>
        </div>

        <span className="inline-flex items-center gap-1 font-semibold text-[#0F172A] group-hover:text-amber-700 transition-colors">
          <span>View</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
