import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  RoleType,
  EventStatus,
  VerificationStatus,
  ReportStatus,
  OpportunityCategoryType,
  OrgStatus,
} from '@campuspulse/types';
import type {
  QueryAdminUsersDto,
  QueryAdminEventsDto,
  CreateAdminCategoryDto,
  UpdateAdminCategoryDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // 1. Platform Statistics & Moderation Overview
  // ---------------------------------------------------------------------------

  async getPlatformStats() {
    const [
      totalUsers,
      totalUniversities,
      totalOrganizations,
      totalEvents,
      totalRegistrations,
      totalTeams,
      pendingReports,
      pendingVerifications,
      pendingEvents,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.university.count(),
      this.prisma.organization.count(),
      this.prisma.event.count(),
      this.prisma.eventRegistration.count(),
      this.prisma.team.count(),
      this.prisma.report.count({ where: { status: 'PENDING' } }),
      this.prisma.verification.count({ where: { status: 'PENDING' } }),
      this.prisma.event.count({ where: { status: EventStatus.PENDING_REVIEW } }),
    ]);

    return {
      overview: {
        users: totalUsers,
        universities: totalUniversities,
        organizations: totalOrganizations,
        events: totalEvents,
        registrations: totalRegistrations,
        teams: totalTeams,
      },
      moderationQueue: {
        pendingEvents,
        pendingReports,
        pendingVerifications,
      },
    };
  }

  async getPendingModeration() {
    const [events, reports, verifications] = await Promise.all([
      this.prisma.event.findMany({
        where: { status: EventStatus.PENDING_REVIEW },
        include: {
          organization: { select: { id: true, name: true, slug: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      this.prisma.report.findMany({
        where: { status: 'PENDING' },
        include: {
          reporter: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      this.prisma.verification.findMany({
        where: { status: 'PENDING' },
        include: {
          organization: { select: { id: true, name: true, slug: true } },
          requestedBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    return {
      events,
      reports,
      verifications,
    };
  }

  // ---------------------------------------------------------------------------
  // 2. User Governance & Account Control
  // ---------------------------------------------------------------------------

  async findAllUsers(query: QueryAdminUsersDto) {
    const { search, role, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.roles = {
        some: {
          role: {
            name: role,
          },
        },
      };
    }

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          isEmailVerified: true,
          isActive: true,
          createdAt: true,
          roles: {
            select: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
          studentProfile: {
            select: {
              university: { select: { name: true, slug: true } },
              batchYear: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const formattedUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      avatarUrl: u.avatarUrl,
      isEmailVerified: u.isEmailVerified,
      isActive: u.isActive,
      createdAt: u.createdAt.toISOString(),
      roles: u.roles.map((r) => r.role.name as RoleType),
      studentProfile: u.studentProfile,
    }));

    return {
      items: formattedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return {
      message: `Account for ${updated.name} has been ${isActive ? 'enabled' : 'disabled'}.`,
      user: updated,
    };
  }

  // ---------------------------------------------------------------------------
  // 3. Event Moderation & Expiration Management
  // ---------------------------------------------------------------------------

  async findAllEvents(query: QueryAdminEventsDto) {
    const { status, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const [total, items] = await Promise.all([
      this.prisma.event.count({ where }),
      this.prisma.event.findMany({
        where,
        include: {
          organization: { select: { id: true, name: true, slug: true, isVerified: true } },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { registrations: true, bookmarks: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async approveEvent(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }

    const updated = await this.prisma.event.update({
      where: { id: eventId },
      data: {
        status: EventStatus.PUBLISHED,
        rejectionReason: null,
      },
      include: {
        organization: { select: { name: true } },
      },
    });

    return {
      message: `Opportunity "${updated.title}" successfully approved and published live.`,
      event: updated,
    };
  }

  async rejectEvent(eventId: string, reason: string) {
    if (!reason || !reason.trim()) {
      throw new BadRequestException('A reason must be provided when rejecting an event');
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }

    const updated = await this.prisma.event.update({
      where: { id: eventId },
      data: {
        status: EventStatus.REJECTED,
        rejectionReason: reason.trim(),
      },
      include: {
        organization: { select: { name: true } },
      },
    });

    return {
      message: `Opportunity "${updated.title}" was declined and feedback recorded.`,
      event: updated,
    };
  }

  async cancelEvent(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }

    const updated = await this.prisma.event.update({
      where: { id: eventId },
      data: {
        status: EventStatus.CANCELLED,
      },
    });

    return {
      message: `Opportunity "${updated.title}" has been cancelled.`,
      event: updated,
    };
  }

  async detectAndExpireEvents() {
    const now = new Date();

    const expired = await this.prisma.event.updateMany({
      where: {
        status: EventStatus.PUBLISHED,
        endDate: { lt: now },
      },
      data: {
        status: EventStatus.EXPIRED,
      },
    });

    return {
      message: `Scanned opportunities: ${expired.count} concluded event(s) marked as EXPIRED.`,
      expiredCount: expired.count,
    };
  }

  // ---------------------------------------------------------------------------
  // 4. Organization Verification Management
  // ---------------------------------------------------------------------------

  async findVerificationRequests(status?: VerificationStatus) {
    const where: any = {};
    if (status) where.status = status;

    return this.prisma.verification.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            isVerified: true,
            university: { select: { name: true, slug: true } },
          },
        },
        requestedBy: { select: { id: true, name: true, email: true } },
        reviewedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async respondVerificationRequest(
    id: string,
    reviewerId: string,
    status: VerificationStatus,
    reviewNotes?: string,
  ) {
    const verification = await this.prisma.verification.findUnique({
      where: { id },
      include: { organization: true },
    });

    if (!verification) {
      throw new NotFoundException(`Verification request with ID "${id}" not found`);
    }

    const now = new Date();

    const [updatedVerification] = await this.prisma.$transaction([
      this.prisma.verification.update({
        where: { id },
        data: {
          status,
          reviewedById: reviewerId,
          reviewNotes: reviewNotes || null,
          reviewedAt: now,
        },
      }),
      ...(status === VerificationStatus.APPROVED
        ? [
            this.prisma.organization.update({
              where: { id: verification.organizationId },
              data: {
                isVerified: true,
                status: OrgStatus.APPROVED,
              },
            }),
          ]
        : []),
    ]);

    return {
      message: `Verification request ${status.toLowerCase()} successfully.`,
      verification: updatedVerification,
    };
  }

  // ---------------------------------------------------------------------------
  // 5. User Reports & Resolution
  // ---------------------------------------------------------------------------

  async findAllReports(status?: ReportStatus) {
    const where: any = {};
    if (status) where.status = status;

    return this.prisma.report.findMany({
      where,
      include: {
        reporter: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveReport(reportId: string, status: ReportStatus, actionNotes?: string) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID "${reportId}" not found`);
    }

    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        actionNotes: actionNotes || null,
      },
    });

    return {
      message: `Report marked as ${status}.`,
      report: updated,
    };
  }

  // ---------------------------------------------------------------------------
  // 6. Category Taxonomy Operations
  // ---------------------------------------------------------------------------

  async findAllCategories() {
    return this.prisma.category.findMany({
      include: {
        _count: { select: { events: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(dto: CreateAdminCategoryDto) {
    const slug =
      dto.slug ||
      dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        type: dto.type || OpportunityCategoryType.OTHER,
        description: dto.description || null,
        icon: dto.icon || null,
        isActive: true,
      },
    });
  }

  async updateCategory(id: string, dto: UpdateAdminCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name ?? category.name,
        description: dto.description !== undefined ? dto.description : category.description,
        icon: dto.icon !== undefined ? dto.icon : category.icon,
        isActive: dto.isActive !== undefined ? dto.isActive : category.isActive,
      },
    });
  }
}
