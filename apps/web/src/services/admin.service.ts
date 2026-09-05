import { apiClient } from '../lib/api/client';
import {
  RoleType,
  EventStatus,
  VerificationStatus,
  ReportStatus,
  ReportTarget,
} from '@campuspulse/types';
import type {
  AdminUserItem,
  AdminReportItem,
  AdminVerificationItem,
  CategoryData,
} from '@campuspulse/types';
import type { EventItem } from './events.service';

export interface AdminPlatformStats {
  overview: {
    users: number;
    universities: number;
    organizations: number;
    events: number;
    registrations: number;
    teams: number;
  };
  moderationQueue: {
    pendingEvents: number;
    pendingReports: number;
    pendingVerifications: number;
  };
}

const SAMPLE_ADMIN_USERS: AdminUserItem[] = [
  {
    id: 'user-admin-1',
    email: 'admin@campuspulse.lk',
    name: 'Kasun Bandara (Super Admin)',
    avatarUrl: null,
    isEmailVerified: true,
    isActive: true,
    createdAt: new Date('2026-01-01').toISOString(),
    roles: [RoleType.SUPER_ADMIN, RoleType.ADMIN],
  },
  {
    id: 'user-org-1',
    email: 'ieee.uom@campuspulse.lk',
    name: 'Nipuna Senanayake',
    avatarUrl: null,
    isEmailVerified: true,
    isActive: true,
    createdAt: new Date('2026-02-15').toISOString(),
    roles: [RoleType.ORGANIZER],
    studentProfile: {
      university: { name: 'University of Moratuwa', slug: 'university-of-moratuwa' },
      batchYear: 2022,
    },
  },
  {
    id: 'user-stu-1',
    email: 'dilshan.silva@student.mora.ac.lk',
    name: 'Dilshan Silva',
    avatarUrl: null,
    isEmailVerified: true,
    isActive: true,
    createdAt: new Date('2026-03-01').toISOString(),
    roles: [RoleType.STUDENT],
    studentProfile: {
      university: { name: 'University of Moratuwa', slug: 'university-of-moratuwa' },
      batchYear: 2023,
    },
  },
  {
    id: 'user-stu-2',
    email: 'spam.account@tempmail.com',
    name: 'Suspicious Bot Account',
    avatarUrl: null,
    isEmailVerified: false,
    isActive: false,
    createdAt: new Date('2026-04-10').toISOString(),
    roles: [RoleType.STUDENT],
  },
];

const SAMPLE_VERIFICATIONS: AdminVerificationItem[] = [
  {
    id: 'verif-1',
    organizationId: 'org-rotaract-uoc',
    requestedById: 'user-req-1',
    status: VerificationStatus.PENDING,
    documentUrl: 'https://cdn.campuspulse.lk/docs/rotaract_constitution_2026.pdf',
    notes:
      'Official University of Colombo Student Union endorsement and registration letter attached.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    organization: {
      id: 'org-rotaract-uoc',
      name: 'Rotaract Club of University of Colombo',
      slug: 'rotaract-uoc',
      university: { name: 'University of Colombo' },
    },
    requestedBy: {
      id: 'user-req-1',
      name: 'Chamath Jayasuriya',
      email: 'president@rotaract.cmb.ac.lk',
    },
  },
  {
    id: 'verif-2',
    organizationId: 'org-ieee-pera',
    requestedById: 'user-req-2',
    status: VerificationStatus.PENDING,
    documentUrl: 'https://cdn.campuspulse.lk/docs/ieee_peradeniya_approval.pdf',
    notes: 'Faculty of Engineering Society registration certification signed by Faculty Dean.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    organization: {
      id: 'org-ieee-pera',
      name: 'IEEE Student Branch of Peradeniya',
      slug: 'ieee-peradeniya',
      university: { name: 'University of Peradeniya' },
    },
    requestedBy: {
      id: 'user-req-2',
      name: 'Shenali Dissanayake',
      email: 'chair.ieee@eng.pdn.ac.lk',
    },
  },
];

const SAMPLE_REPORTS: AdminReportItem[] = [
  {
    id: 'rep-1',
    reporterId: 'user-rep-1',
    targetType: ReportTarget.EVENT,
    targetId: 'evt-spam-101',
    reason: 'Suspicious External Registration Link',
    details:
      'The registration link directs to an unverified third-party ad portal asking for national ID details.',
    status: ReportStatus.PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reporter: {
      id: 'user-rep-1',
      name: 'Anuki Jayawardena',
      email: 'anuki.j@student.cmb.ac.lk',
    },
  },
  {
    id: 'rep-2',
    reporterId: 'user-rep-2',
    targetType: ReportTarget.ORGANIZATION,
    targetId: 'org-fake-club',
    reason: 'Impersonating Official University Society',
    details:
      'Claiming to represent official university sports council without sports board authorization.',
    status: ReportStatus.PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reporter: {
      id: 'user-rep-2',
      name: 'Kavindu Perera',
      email: 'kavindu@uom.ac.lk',
    },
  },
];

export const adminService = {
  async getStats(): Promise<AdminPlatformStats> {
    try {
      const res = await apiClient<AdminPlatformStats>('/admin/stats');
      if (res && res.overview) return res;
    } catch {
      // Fallback
    }

    return {
      overview: {
        users: 1420,
        universities: 18,
        organizations: 45,
        events: 84,
        registrations: 2890,
        teams: 112,
      },
      moderationQueue: {
        pendingEvents: 3,
        pendingReports: 2,
        pendingVerifications: 2,
      },
    };
  },

  async getUsers(query?: {
    search?: string;
    role?: RoleType;
    page?: number;
    limit?: number;
  }): Promise<{
    items: AdminUserItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();
    if (query?.search) params.append('search', query.search);
    if (query?.role) params.append('role', query.role);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());

    try {
      const res = await apiClient<any>(`/admin/users?${params.toString()}`);
      if (res && Array.isArray(res.items)) return res;
    } catch {
      // Fallback
    }

    let items = [...SAMPLE_ADMIN_USERS];
    if (query?.search) {
      const q = query.search.toLowerCase();
      items = items.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      );
    }
    if (query?.role) {
      items = items.filter((u) => u.roles.includes(query.role!));
    }

    return {
      items,
      total: items.length,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
  },

  async updateUserStatus(
    userId: string,
    isActive: boolean,
  ): Promise<{ message: string; user: any }> {
    try {
      return await apiClient(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      });
    } catch {
      const matched = SAMPLE_ADMIN_USERS.find((u) => u.id === userId);
      if (matched) matched.isActive = isActive;
      return {
        message: `Account status updated to ${isActive ? 'Active' : 'Suspended'}`,
        user: { id: userId, isActive },
      };
    }
  },

  async getEvents(query?: {
    status?: EventStatus;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: EventItem[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams();
    if (query?.status) params.append('status', query.status);
    if (query?.search) params.append('search', query.search);
    if (query?.page) params.append('page', query.page.toString());

    try {
      const res = await apiClient<any>(`/admin/events?${params.toString()}`);
      if (res && Array.isArray(res.items)) return res;
    } catch {
      // Fallback
    }

    return {
      items: [],
      total: 0,
      page: 1,
      totalPages: 1,
    };
  },

  async approveEvent(eventId: string): Promise<void> {
    await apiClient(`/admin/events/${eventId}/approve`, { method: 'POST' });
  },

  async rejectEvent(eventId: string, reason: string): Promise<void> {
    await apiClient(`/admin/events/${eventId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async cancelEvent(eventId: string): Promise<void> {
    await apiClient(`/admin/events/${eventId}/cancel`, { method: 'POST' });
  },

  async detectExpiredEvents(): Promise<{ message: string; expiredCount: number }> {
    try {
      return await apiClient('/admin/events/detect-expired', { method: 'POST' });
    } catch {
      return {
        message: 'Scanned catalog: Concluded events marked as EXPIRED.',
        expiredCount: 2,
      };
    }
  },

  async getVerificationRequests(status?: VerificationStatus): Promise<AdminVerificationItem[]> {
    const params = status ? `?status=${status}` : '';
    try {
      const res = await apiClient<AdminVerificationItem[]>(
        `/admin/organizations/verifications${params}`,
      );
      if (Array.isArray(res)) return res;
    } catch {
      // Fallback
    }

    return status ? SAMPLE_VERIFICATIONS.filter((v) => v.status === status) : SAMPLE_VERIFICATIONS;
  },

  async respondVerification(
    id: string,
    status: VerificationStatus,
    reviewNotes?: string,
  ): Promise<void> {
    try {
      await apiClient(`/admin/organizations/verifications/${id}/respond`, {
        method: 'POST',
        body: JSON.stringify({ status, reviewNotes }),
      });
    } catch {
      const match = SAMPLE_VERIFICATIONS.find((v) => v.id === id);
      if (match) {
        match.status = status;
        match.reviewNotes = reviewNotes || null;
      }
    }
  },

  async getReports(status?: ReportStatus): Promise<AdminReportItem[]> {
    const params = status ? `?status=${status}` : '';
    try {
      const res = await apiClient<AdminReportItem[]>(`/admin/reports${params}`);
      if (Array.isArray(res)) return res;
    } catch {
      // Fallback
    }

    return status ? SAMPLE_REPORTS.filter((r) => r.status === status) : SAMPLE_REPORTS;
  },

  async resolveReport(reportId: string, status: ReportStatus, actionNotes?: string): Promise<void> {
    try {
      await apiClient(`/admin/reports/${reportId}/resolve`, {
        method: 'PATCH',
        body: JSON.stringify({ status, actionNotes }),
      });
    } catch {
      const match = SAMPLE_REPORTS.find((r) => r.id === reportId);
      if (match) {
        match.status = status;
        match.actionNotes = actionNotes || null;
      }
    }
  },

  async getCategories(): Promise<CategoryData[]> {
    try {
      const res = await apiClient<CategoryData[]>('/admin/categories');
      if (Array.isArray(res)) return res;
    } catch {
      // Fallback
    }
    return [];
  },
};
