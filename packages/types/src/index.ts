/**
 * ==============================================================================
 * CampusPulse — Shared Types & Enums
 * ==============================================================================
 * Central domain models and enums matching the database schema.
 * Consumed by NestJS API, Next.js Web, and future React Native apps.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// Enums
// ------------------------------------------------------------------------------

export enum RoleType {
  STUDENT = 'STUDENT',
  ORGANIZER = 'ORGANIZER',
  FACULTY = 'FACULTY',
  UNIVERSITY_ADMIN = 'UNIVERSITY_ADMIN',
  COMPANY = 'COMPANY',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

// Backward-compatible alias
export const UserRole = RoleType;
export type UserRole = RoleType;

export enum OrgStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum OrgType {
  STUDENT_CLUB = 'STUDENT_CLUB',
  ACADEMIC_SOCIETY = 'ACADEMIC_SOCIETY',
  SPORTS_CLUB = 'SPORTS_CLUB',
  FACULTY_BODY = 'FACULTY_BODY',
  UNIVERSITY_OFFICE = 'UNIVERSITY_OFFICE',
  COMPANY = 'COMPANY',
  COMMUNITY = 'COMMUNITY',
}

export enum OrgMemberRole {
  LEADER = 'LEADER',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER',
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
}

export enum EventMode {
  IN_PERSON = 'IN_PERSON',
  ONLINE = 'ONLINE',
  HYBRID = 'HYBRID',
}

export enum RegistrationStatus {
  REGISTERED = 'REGISTERED',
  WAITLISTED = 'WAITLISTED',
  CANCELLED = 'CANCELLED',
  ATTENDED = 'ATTENDED',
}

export enum TeamRole {
  LEADER = 'LEADER',
  MEMBER = 'MEMBER',
}

export enum TeamRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum NotificationType {
  EVENT_DEADLINE = 'EVENT_DEADLINE',
  EVENT_UPDATED = 'EVENT_UPDATED',
  EVENT_CANCELLED = 'EVENT_CANCELLED',
  NEW_RECOMMENDATION = 'NEW_RECOMMENDATION',
  TEAM_REQUEST = 'TEAM_REQUEST',
  TEAM_REQUEST_ACCEPTED = 'TEAM_REQUEST_ACCEPTED',
  TEAM_REQUEST_REJECTED = 'TEAM_REQUEST_REJECTED',
  EVENT_REMINDER = 'EVENT_REMINDER',
  REGISTRATION_CONFIRMED = 'REGISTRATION_CONFIRMED',
  SYSTEM = 'SYSTEM',
  MODERATION = 'MODERATION',
}

export enum ReportTarget {
  EVENT = 'EVENT',
  ORGANIZATION = 'ORGANIZATION',
  USER = 'USER',
  TEAM = 'TEAM',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum OpportunityCategoryType {
  ACADEMIC = 'ACADEMIC',
  CAREER = 'CAREER',
  COMPETITIVE = 'COMPETITIVE',
  RESEARCH = 'RESEARCH',
  SOCIAL = 'SOCIAL',
  CULTURAL = 'CULTURAL',
  SPORTS = 'SPORTS',
  MUSIC = 'MUSIC',
  OTHER = 'OTHER',
}

// Backward-compatible alias
export const OpportunityCategory = OpportunityCategoryType;
export type OpportunityCategory = OpportunityCategoryType;

// ------------------------------------------------------------------------------
// API Contracts
// ------------------------------------------------------------------------------

/** Standard API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

/** Pagination metadata */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/** Paginated API response structure */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
  message?: string;
}

/** Standard error response envelope */
export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
  timestamp: string;
  path?: string;
}

/** Generic query parameters for paginated and sorted endpoints */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** Specific search and filtering query parameters for events discovery */
export interface QueryEventsParams extends PaginationQuery {
  categorySlug?: string;
  categoryId?: string;
  universitySlug?: string;
  universityId?: string;
  facultyId?: string;
  departmentId?: string;
  mode?: EventMode;
  status?: EventStatus;
  featured?: boolean;
  startDateFrom?: string;
  startDateTo?: string;
  datePreset?: 'all' | 'today' | 'this_week' | 'this_month' | 'upcoming';
  registrationOpenOnly?: boolean;
  isFree?: boolean;
  skills?: string | string[];
}

/** Health check response contract */
export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services?: {
    database?: 'connected' | 'disconnected';
    api?: 'running';
  };
}

/** Student profile data contract */
export interface StudentProfileData {
  id?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  universityId?: string;
  universityName?: string;
  facultyId?: string;
  facultyName?: string;
  departmentId?: string;
  departmentName?: string;
  batchYear?: number;
  studentIdNumber?: string;
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  skills: string[];
  interests: string[];
  careerInterests: string[];
}

/** Registration tracking record */
export interface RegistrationRecord {
  id: string;
  eventId: string;
  userId: string;
  status: RegistrationStatus;
  registeredAt: string;
  externalUrl?: string;
  event?: {
    id: string;
    title: string;
    slug: string;
    startDate: string;
    endDate?: string;
    venue?: string;
    mode?: EventMode;
    registrationUrl?: string;
  };
}

/** Notification entity contract */
export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  linkUrl?: string | null;
  createdAt: string;
}

/** Calendar entry */
export interface CalendarEntry {
  id: string;
  eventId: string;
  title: string;
  slug: string;
  date: string;
  endDate?: string;
  entryType: 'EVENT_DATE' | 'REGISTRATION_DEADLINE';
  isRegistered?: boolean;
  isBookmarked?: boolean;
  mode?: EventMode;
  location?: string;
  venue?: string;
  category?: {
    name: string;
    slug: string;
  };
  organization?: {
    name: string;
    slug: string;
  };
}

/** Team Member representation */
export interface TeamMemberData {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: string;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    studentProfile?: {
      skills?: string[];
      batchYear?: number;
    } | null;
  };
}

/** Team Join Request representation */
export interface TeamJoinRequestData {
  id: string;
  teamId: string;
  userId: string;
  status: TeamRequestStatus;
  message?: string | null;
  requestedAt: string;
  respondedAt?: string | null;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    studentProfile?: {
      skills?: string[];
      batchYear?: number;
    } | null;
  };
}

/** Team entity contract */
export interface TeamData {
  id: string;
  eventId?: string | null;
  creatorId: string;
  name: string;
  description?: string | null;
  maxMembers: number;
  requiredRoles: string[];
  requiredSkills: string[];
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
  event?: {
    id: string;
    title: string;
    slug: string;
    startDate?: string;
  } | null;
  creator?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  members?: TeamMemberData[];
  joinRequests?: TeamJoinRequestData[];
  _count?: {
    members: number;
  };
  matchScore?: number;
}

/** Organizer Analytics Data Contract */
export interface OrganizerAnalyticsData {
  totalEvents: number;
  publishedEvents: number;
  pendingEvents: number;
  draftEvents: number;
  cancelledEvents: number;
  totalViews: number;
  totalRegistrations: number;
  totalBookmarks: number;
  recentEvents: any[];
  eventBreakdown: {
    id: string;
    title: string;
    slug: string;
    status: EventStatus;
    views: number;
    bookmarks: number;
    registrations: number;
    conversionRate: number;
  }[];
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  type: OpportunityCategoryType;
  description?: string | null;
  icon?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AdminUserItem {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  roles: RoleType[];
  studentProfile?: {
    university?: { name: string; slug: string };
    batchYear?: number | null;
  } | null;
}

export interface AdminReportItem {
  id: string;
  reporterId: string;
  targetType: ReportTarget;
  targetId: string;
  reason: string;
  details?: string | null;
  status: ReportStatus;
  actionNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  reporter?: { id: string; name: string; email: string };
}

export interface AdminVerificationItem {
  id: string;
  organizationId: string;
  requestedById: string;
  reviewedById?: string | null;
  status: VerificationStatus;
  documentUrl?: string | null;
  notes?: string | null;
  reviewNotes?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  organization?: { id: string; name: string; slug: string; university?: { name: string } };
  requestedBy?: { id: string; name: string; email: string };
  reviewedBy?: { id: string; name: string; email: string } | null;
}
