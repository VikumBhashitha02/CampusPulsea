import { apiClient } from '../lib/api/client';

export interface UniversityItem {
  id: string;
  name: string;
  slug: string;
  code: string;
  country: string;
  city: string;
  logoUrl?: string;
  bannerUrl?: string;
  domain?: string;
  websiteUrl?: string;
  description?: string;
  isVerified: boolean;
  faculties?: Array<{
    id: string;
    name: string;
    slug: string;
    code: string;
    departments?: Array<{
      id: string;
      name: string;
      slug: string;
      code: string;
    }>;
  }>;
  organizations?: Array<{
    id: string;
    name: string;
    slug: string;
    type: string;
    logoUrl?: string;
  }>;
  _count?: {
    faculties: number;
    organizations: number;
    studentProfiles: number;
  };
}

export interface PaginatedUniversities {
  items: UniversityItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const SAMPLE_UNIVERSITIES: UniversityItem[] = [
  {
    id: 'uom-01',
    name: 'University of Moratuwa',
    slug: 'uom',
    code: 'UOM',
    country: 'Sri Lanka',
    city: 'Moratuwa',
    logoUrl:
      'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=300&q=80',
    websiteUrl: 'https://uom.lk',
    description:
      "The country's leading technological university, renowned for engineering, architecture, and information technology excellence.",
    isVerified: true,
    _count: {
      faculties: 5,
      organizations: 42,
      studentProfiles: 8500,
    },
    faculties: [
      {
        id: 'f-eng',
        name: 'Faculty of Engineering',
        slug: 'engineering',
        code: 'FOE',
        departments: [
          { id: 'd-cse', name: 'Computer Science & Engineering', slug: 'cse', code: 'CSE' },
          { id: 'd-entc', name: 'Electronic & Telecommunication', slug: 'entc', code: 'ENTC' },
        ],
      },
      {
        id: 'f-it',
        name: 'Faculty of Information Technology',
        slug: 'it',
        code: 'FIT',
        departments: [{ id: 'd-it', name: 'Information Technology', slug: 'it', code: 'IT' }],
      },
    ],
  },
  {
    id: 'uoc-02',
    name: 'University of Colombo',
    slug: 'uoc',
    code: 'UOC',
    country: 'Sri Lanka',
    city: 'Colombo',
    logoUrl:
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=300&q=80',
    websiteUrl: 'https://cmb.ac.lk',
    description:
      'The oldest university in Sri Lanka, offering prestigious programs in Science, Computing, Medicine, Law, and Arts.',
    isVerified: true,
    _count: {
      faculties: 9,
      organizations: 56,
      studentProfiles: 12400,
    },
    faculties: [
      {
        id: 'f-sci',
        name: 'Faculty of Science',
        slug: 'science',
        code: 'FOS',
        departments: [
          { id: 'd-stat', name: 'Statistics & Computer Science', slug: 'statistics', code: 'STAT' },
        ],
      },
    ],
  },
  {
    id: 'uop-03',
    name: 'University of Peradeniya',
    slug: 'uop',
    code: 'UOP',
    country: 'Sri Lanka',
    city: 'Peradeniya',
    logoUrl:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=300&q=80',
    websiteUrl: 'https://pdn.ac.lk',
    description:
      'Set amidst the scenic hills of Kandy, Peradeniya is renowned for world-class multidisciplinary education and groundbreaking research.',
    isVerified: true,
    _count: {
      faculties: 9,
      organizations: 38,
      studentProfiles: 11200,
    },
    faculties: [
      {
        id: 'f-eng-uop',
        name: 'Faculty of Engineering',
        slug: 'engineering',
        code: 'FOE',
        departments: [
          {
            id: 'd-ce-uop',
            name: 'Computer Engineering',
            slug: 'computer-engineering',
            code: 'CE',
          },
        ],
      },
    ],
  },
];

export const universitiesService = {
  async getUniversities(
    params: { search?: string; city?: string; page?: number; limit?: number } = {},
  ): Promise<PaginatedUniversities> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.city) query.append('city', params.city);

    try {
      const res = await apiClient<PaginatedUniversities>(`/universities?${query.toString()}`);
      if (res && Array.isArray(res.items) && res.items.length > 0) {
        return res;
      }
    } catch {
      // Fallback
    }

    let items = [...SAMPLE_UNIVERSITIES];
    if (params.search) {
      const s = params.search.toLowerCase();
      items = items.filter(
        (u) => u.name.toLowerCase().includes(s) || u.city.toLowerCase().includes(s),
      );
    }

    return {
      items,
      meta: {
        total: items.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };
  },

  async getUniversityBySlug(slug: string): Promise<UniversityItem> {
    try {
      const res = await apiClient<UniversityItem>(`/universities/slug/${slug}`);
      if (res) return res;
    } catch {
      // Fallback
    }

    const matched = SAMPLE_UNIVERSITIES.find((u) => u.slug === slug);
    if (matched) return matched;

    throw new Error(`University "${slug}" not found`);
  },
};
