import { apiClient } from '../lib/api/client';
import { OrgStatus, OrgType, OrgMemberRole } from '@campuspulse/types';

export interface OrgMemberItem {
  id: string;
  role: OrgMemberRole;
  title?: string;
  user: {
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string;
  };
}

export interface OrganizationItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: OrgType;
  status: OrgStatus;
  logoUrl?: string;
  bannerUrl?: string;
  email?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  isVerified: boolean;
  university?: {
    id: string;
    name: string;
    slug: string;
    city: string;
  };
  members?: OrgMemberItem[];
  events?: Array<{
    id: string;
    title: string;
    slug: string;
    startDate: string;
    coverImageUrl?: string;
  }>;
  _count?: {
    members: number;
    events: number;
  };
}

export const SAMPLE_ORGANIZATIONS: OrganizationItem[] = [
  {
    id: 'org-ieee-uom',
    name: 'IEEE Student Branch of University of Moratuwa',
    slug: 'ieee-uom',
    type: OrgType.STUDENT_CLUB,
    status: OrgStatus.APPROVED,
    isVerified: true,
    description:
      'The largest IEEE student branch in Region 10, empowering future engineers through competitive hackathons, technical symposia, and community outreaches.',
    websiteUrl: 'https://ieee.uom.lk',
    instagramUrl: 'https://instagram.com/ieee_uom',
    linkedinUrl: 'https://linkedin.com/company/ieee-uom',
    logoUrl:
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=300&q=80',
    university: {
      id: 'uom',
      name: 'University of Moratuwa',
      slug: 'uom',
      city: 'Moratuwa',
    },
    members: [
      {
        id: 'm1',
        role: OrgMemberRole.LEADER,
        title: 'Branch Chairperson',
        user: {
          id: 'u1',
          name: 'Kasun Bandara',
          avatarUrl:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        },
      },
      {
        id: 'm2',
        role: OrgMemberRole.MANAGER,
        title: 'Vice Chair of Technical Activities',
        user: {
          id: 'u2',
          name: 'Nethmi Fernando',
          avatarUrl:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        },
      },
    ],
    _count: {
      members: 180,
      events: 14,
    },
  },
];

export const organizationsService = {
  async getOrganizations(): Promise<OrganizationItem[]> {
    try {
      const res = await apiClient<any>('/organizations');
      if (Array.isArray(res)) return res;
      if (res?.items && Array.isArray(res.items)) return res.items;
    } catch {
      // Fallback
    }
    return SAMPLE_ORGANIZATIONS;
  },

  async getMyOrganizations(): Promise<Array<{ id: string; name: string; role: OrgMemberRole; title?: string }>> {
    try {
      const user = await apiClient<any>('/users/me/profile');
      if (user?.organizations && Array.isArray(user.organizations)) {
        return user.organizations;
      }
    } catch {
      // Fallback
    }
    return [
      {
        id: 'org-ieee-uom',
        name: 'IEEE Student Branch of University of Moratuwa',
        role: OrgMemberRole.LEADER,
        title: 'Branch Chairperson',
      },
    ];
  },

  async getOrganizationById(id: string): Promise<OrganizationItem> {
    try {
      const res = await apiClient<OrganizationItem>(`/organizations/${id}`);
      if (res) return res;
    } catch {
      // Fallback
    }
    const matched = SAMPLE_ORGANIZATIONS.find((o) => o.id === id);
    if (matched) return matched;
    throw new Error(`Organization with ID "${id}" not found`);
  },

  async getOrganizationBySlug(slug: string): Promise<OrganizationItem> {
    try {
      const res = await apiClient<OrganizationItem>(`/organizations/slug/${slug}`);
      if (res) return res;
    } catch {
      // Fallback
    }

    const matched = SAMPLE_ORGANIZATIONS.find((o) => o.slug === slug);
    if (matched) return matched;

    throw new Error(`Organization "${slug}" not found`);
  },

  async getMembers(orgId: string): Promise<OrgMemberItem[]> {
    try {
      return await apiClient<OrgMemberItem[]>(`/organizations/${orgId}/members`);
    } catch {
      return [];
    }
  },
};
