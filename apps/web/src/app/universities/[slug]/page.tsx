import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Building2, MapPin, Globe, GraduationCap, ArrowLeft } from 'lucide-react';
import { universitiesService } from '../../../services/universities.service';

interface UniversityDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UniversityDetailPage({ params }: UniversityDetailPageProps) {
  const { slug } = await params;

  let university;
  try {
    university = await universitiesService.getUniversityBySlug(slug);
  } catch {
    notFound();
  }

  if (!university) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 section-container py-8 space-y-8">
        <div>
          <Link
            href="/universities"
            className="inline-flex items-center gap-2 text-xs font-bold text-cp-muted hover:text-cp-navy transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to University Network</span>
          </Link>
        </div>

        <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-cp-bg border border-cp-border p-3 flex items-center justify-center shrink-0">
                {university.logoUrl ? (
                  <img
                    src={university.logoUrl}
                    alt={university.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Building2 className="w-10 h-10 text-cp-yellow" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-cp-navy">{university.name}</h1>
                  {university.isVerified && (
                    <span className="badge-yellow text-[10px] font-bold">
                      Verified Campus
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-cp-muted">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cp-muted" />
                    <span>{university.city || 'Sri Lanka'}</span>
                  </div>
                  {university.websiteUrl && (
                    <a
                      href={university.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-cp-navy font-semibold hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Official Portal</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-center border-t sm:border-t-0 sm:border-l border-cp-border pt-4 sm:pt-0 sm:pl-6">
              <div>
                <div className="text-2xl font-bold text-cp-navy">
                  {university.faculties?.length || 0}
                </div>
                <div className="text-[11px] text-cp-muted font-semibold">Faculties</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-800">
                  {university._count?.organizations || 0}
                </div>
                <div className="text-[11px] text-cp-muted font-semibold">Clubs</div>
              </div>
            </div>
          </div>

          {university.description && (
            <p className="text-body text-cp-muted leading-relaxed max-w-3xl">
              {university.description}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-cp-yellow" />
            <h2 className="text-section-title text-cp-navy">Faculties & Academic Structure</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {university.faculties && university.faculties.length > 0 ? (
              university.faculties.map((fac) => (
                <div
                  key={fac.id}
                  className="p-6 rounded-2xl bg-cp-surface border border-cp-border space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-cp-navy">{fac.name}</h3>
                    {fac.code && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cp-yellow-light text-amber-800">
                        {fac.code}
                      </span>
                    )}
                  </div>

                  {fac.departments && fac.departments.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-cp-border">
                      <div className="text-[11px] font-bold text-cp-muted uppercase tracking-wider">
                        Departments
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {fac.departments.map((dept) => (
                          <span
                            key={dept.id}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-cp-bg text-cp-navy border border-cp-border"
                          >
                            {dept.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-2 p-8 text-center rounded-2xl bg-cp-surface text-xs text-cp-muted border border-cp-border">
                Academic department records are maintained by university administrators.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
