'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  ArrowLeft,
  MapPin,
  Globe,
  ExternalLink,
  Search,
  RefreshCw,
} from 'lucide-react';
import { universitiesService } from '../../../services/universities.service';
import type { UniversityItem } from '../../../services/universities.service';
import { useAuth } from '../../../lib/auth/auth-context';
import { RoleType } from '@campuspulse/types';
import { PageHeader } from '../../../components/ui/page-header';

export default function AdminUniversitiesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [universities, setUniversities] = useState<UniversityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const isAuthorized =
    user?.roles?.some((r) =>
      [RoleType.ADMIN, RoleType.SUPER_ADMIN].includes(r as RoleType),
    );

  const loadUniversities = async () => {
    setLoading(true);
    try {
      const data: any = await universitiesService.getUniversities({
        search: search.trim() || undefined,
      });
      if (data && Array.isArray(data.items)) {
        setUniversities(data.items);
      } else if (Array.isArray(data)) {
        setUniversities(data);
      }
    } catch (err) {
      console.error('Failed to load universities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin/universities');
      return;
    }

    if (isAuthenticated && isAuthorized) {
      loadUniversities();
    } else if (isAuthenticated && !isAuthorized) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, isAuthorized]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUniversities();
  };

  if (authLoading || (loading && universities.length === 0)) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-cp-yellow border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-cp-muted">Loading universities...</p>
          </div>
        </main>
      </div>
    );
  }

  if (isAuthenticated && !isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 max-w-lg w-full mx-auto px-4 py-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-page-title text-cp-navy">Access Restricted</h1>
          <p className="text-body text-cp-muted leading-relaxed">
            University Campus Administration is reserved for authorized platform administrators.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Link href="/" className="btn-secondary text-xs">
              Return Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 section-container py-8 sm:py-10 space-y-6">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-cp-muted hover:text-cp-navy transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Dashboard</span>
          </Link>
        </div>

        <PageHeader
          title="University Campuses"
          description="Oversee registered university institutions, official domains, and faculty structures."
          eyebrow="Campus Directory & Hierarchy"
          actions={
            <button
              onClick={loadUniversities}
              disabled={loading}
              className="p-2.5 rounded-xl border border-cp-border bg-cp-surface text-cp-muted hover:text-cp-navy transition-colors"
              title="Refresh Campuses"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          }
        />

        <form onSubmit={handleSearchSubmit} className="relative max-w-md">
          <Search className="w-4 h-4 text-cp-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search university name or domain..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-cp-surface border border-cp-border text-xs text-cp-navy placeholder:text-cp-muted focus:outline-none focus:border-cp-yellow"
          />
        </form>

        {universities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {universities.map((uni) => (
              <div
                key={uni.id}
                className="bg-cp-surface rounded-2xl border border-cp-border hover:border-cp-yellow transition-all flex flex-col justify-between space-y-4 p-6 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-cp-muted uppercase">
                      Code: {uni.code || 'UNI'}
                    </span>
                    {uni.isVerified && (
                      <span className="badge-yellow text-[10px] font-bold">
                        Verified
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-cp-navy group-hover:text-black transition-colors">
                    {uni.name}
                  </h3>

                  <div className="space-y-1 text-xs text-cp-muted">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cp-muted" />
                      <span>{uni.city || 'Sri Lanka'}</span>
                    </div>

                    {uni.domain && (
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-amber-800">
                        <Globe className="w-3.5 h-3.5" />
                        <span>{uni.domain}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-cp-border flex items-center justify-between">
                  <span className="text-xs text-cp-muted">
                    {uni.faculties?.length || 4} Faculties
                  </span>

                  <Link
                    href={`/universities/${uni.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-cp-navy hover:text-black transition-colors"
                  >
                    <span>View Public Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 rounded-2xl bg-cp-surface border border-cp-border text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cp-yellow-light text-amber-800 flex items-center justify-center mx-auto">
              <Building2 className="w-6 h-6 text-cp-yellow" />
            </div>
            <h3 className="text-base font-bold text-cp-navy">No Universities Found</h3>
            <p className="text-xs text-cp-muted max-w-md mx-auto">
              No registered campus institutions match your query.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
