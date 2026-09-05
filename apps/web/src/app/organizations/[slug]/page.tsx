import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Building2, Users, Globe, ArrowLeft, Share2 } from 'lucide-react';
import { organizationsService } from '../../../services/organizations.service';

interface OrganizationDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function OrganizationDetailPage({ params }: OrganizationDetailPageProps) {
  const { slug } = await params;

  let org;
  try {
    org = await organizationsService.getOrganizationBySlug(slug);
  } catch {
    notFound();
  }

  if (!org) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 section-container py-8 space-y-8">
        <div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-xs font-bold text-cp-muted hover:text-cp-navy transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Opportunities</span>
          </Link>
        </div>

        <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-cp-bg border border-cp-border p-3 flex items-center justify-center shrink-0">
                {org.logoUrl ? (
                  <img src={org.logoUrl} alt={org.name} className="w-full h-full object-contain" />
                ) : (
                  <Users className="w-10 h-10 text-cp-yellow" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-cp-navy">{org.name}</h1>
                  {org.isVerified && (
                    <span className="badge-yellow text-[10px] font-bold">
                      Verified Organization
                    </span>
                  )}
                </div>
                {org.university && (
                  <div className="text-xs text-cp-muted flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-cp-muted" />
                    <span>{org.university.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {org.websiteUrl && (
                <a
                  href={org.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-cp-bg hover:bg-cp-surface border border-cp-border text-cp-navy transition-colors"
                  title="Official Website"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {org.instagramUrl && (
                <a
                  href={org.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-cp-bg hover:bg-cp-surface border border-cp-border text-cp-navy transition-colors"
                  title="Instagram Page"
                >
                  <Share2 className="w-4 h-4" />
                </a>
              )}
              {org.linkedinUrl && (
                <a
                  href={org.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-cp-bg hover:bg-cp-surface border border-cp-border text-cp-navy transition-colors"
                  title="LinkedIn Profile"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {org.description && (
            <p className="text-body text-cp-muted leading-relaxed max-w-3xl">
              {org.description}
            </p>
          )}
        </div>

        {org.members && org.members.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-cp-yellow" />
              <h2 className="text-section-title text-cp-navy">Executive Committee & Officers</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {org.members.map((member: any) => (
                <div
                  key={member.id}
                  className="p-4 rounded-2xl bg-cp-surface border border-cp-border flex items-center gap-3.5"
                >
                  <div className="w-10 h-10 rounded-full bg-cp-yellow-light text-amber-800 font-bold overflow-hidden flex items-center justify-center shrink-0">
                    {member.user?.avatarUrl ? (
                      <img
                        src={member.user.avatarUrl}
                        alt={member.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{member.user?.name?.charAt(0) || 'M'}</span>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-cp-navy truncate">
                      {member.user?.name || 'Member'}
                    </div>
                    <div className="text-[11px] text-cp-muted truncate">
                      {member.title || member.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
