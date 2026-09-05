import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { QueryOrganizationsDto } from './dto/query-organizations.dto';
import type { CreateOrganizationDto } from './dto/create-organization.dto';
import type { UpdateOrganizationDto } from './dto/update-organization.dto';
import type { AddOrganizationMemberDto } from './dto/add-member.dto';
import type { UpdateOrganizationMemberDto } from './dto/update-member.dto';
import { OrgMemberRole, OrgStatus, RoleType } from '@campuspulse/types';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Evaluates if a user has management authorization for an organization.
   * SUPER_ADMIN/ADMIN: Global permissions.
   * UNIVERSITY_ADMIN: Permitted if club belongs to their university.
   * LEADER / MANAGER: Permitted for their own organization.
   */
  async canManageOrganization(
    userId: string,
    userRoles: string[],
    orgId: string,
  ): Promise<boolean> {
    if (userRoles.includes(RoleType.SUPER_ADMIN) || userRoles.includes(RoleType.ADMIN)) {
      return true;
    }

    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { universityId: true },
    });

    if (!org) {
      throw new NotFoundException(`Organization with ID "${orgId}" not found`);
    }

    // Check if user is UNIVERSITY_ADMIN of the same university
    if (userRoles.includes(RoleType.UNIVERSITY_ADMIN) && org.universityId) {
      const profile = await this.prisma.studentProfile.findUnique({
        where: { userId },
        select: { universityId: true },
      });
      if (profile && profile.universityId === org.universityId) {
        return true;
      }
    }

    // Check if user is a LEADER or MANAGER of the organization
    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId,
        },
      },
    });

    if (
      membership &&
      (membership.role === OrgMemberRole.LEADER || membership.role === OrgMemberRole.MANAGER)
    ) {
      return true;
    }

    return false;
  }

  // ---------------------------------------------------------------------------
  // Organization Queries & Mutations
  // ---------------------------------------------------------------------------

  async findAll(query: QueryOrganizationsDto) {
    const { skip, limit, search, universityId, type, status } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (universityId) {
      where.universityId = universityId;
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    const [organizations, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        skip,
        take: limit,
        include: {
          university: { select: { id: true, name: true, slug: true, city: true } },
          _count: { select: { members: true, events: true } },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.organization.count({ where }),
    ]);

    return {
      items: organizations,
      meta: {
        total,
        page: query.page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        university: true,
        members: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true, email: true },
            },
          },
          orderBy: { role: 'asc' },
        },
        events: {
          take: 10,
          orderBy: { startDate: 'desc' },
        },
        _count: { select: { members: true, events: true } },
      },
    });

    if (!org) {
      throw new NotFoundException(`Organization with ID "${id}" not found`);
    }

    return org;
  }

  async findBySlug(slug: string) {
    const org = await this.prisma.organization.findUnique({
      where: { slug },
      include: {
        university: true,
        members: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
          orderBy: { role: 'asc' },
        },
        events: {
          where: { status: 'PUBLISHED' },
          take: 10,
          orderBy: { startDate: 'asc' },
        },
        _count: { select: { members: true, events: true } },
      },
    });

    if (!org) {
      throw new NotFoundException(`Organization with slug "${slug}" not found`);
    }

    return org;
  }

  async create(userId: string, userRoles: string[], dto: CreateOrganizationDto) {
    if (dto.universityId) {
      const university = await this.prisma.university.findUnique({
        where: { id: dto.universityId },
      });
      if (!university) {
        throw new NotFoundException(`University with ID "${dto.universityId}" not found`);
      }

      if (
        userRoles.includes(RoleType.UNIVERSITY_ADMIN) &&
        !userRoles.includes(RoleType.SUPER_ADMIN) &&
        !userRoles.includes(RoleType.ADMIN)
      ) {
        const profile = await this.prisma.studentProfile.findUnique({
          where: { userId },
          select: { universityId: true },
        });
        if (!profile || profile.universityId !== dto.universityId) {
          throw new ForbiddenException(
            'You do not have permission to create an organization for this university',
          );
        }
      }
    }

    const existing = await this.prisma.organization.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException(`An organization with slug "${dto.slug}" already exists`);
    }

    // Auto-approve if created by SUPER_ADMIN or ADMIN
    const initialStatus =
      userRoles.includes(RoleType.SUPER_ADMIN) || userRoles.includes(RoleType.ADMIN)
        ? OrgStatus.APPROVED
        : OrgStatus.PENDING;

    const org = await this.prisma.organization.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        universityId: dto.universityId,
        type: dto.type,
        description: dto.description,
        websiteUrl: dto.websiteUrl,
        status: initialStatus,
      },
    });

    // Automatically add creator as LEADER
    await this.prisma.organizationMember.create({
      data: {
        organizationId: org.id,
        userId,
        role: OrgMemberRole.LEADER,
        title: 'Founder / Head',
      },
    });

    return org;
  }

  async update(orgId: string, userId: string, userRoles: string[], dto: UpdateOrganizationDto) {
    const authorized = await this.canManageOrganization(userId, userRoles, orgId);
    if (!authorized) {
      throw new ForbiddenException(
        'You do not have permission to modify resources belonging to this organization',
      );
    }

    // Only SUPER_ADMIN, ADMIN, or UNIVERSITY_ADMIN can update organization status
    if (
      dto.status !== undefined &&
      !userRoles.includes(RoleType.SUPER_ADMIN) &&
      !userRoles.includes(RoleType.ADMIN) &&
      !userRoles.includes(RoleType.UNIVERSITY_ADMIN)
    ) {
      throw new ForbiddenException('Only administrators can update organization approval status');
    }

    return this.prisma.organization.update({
      where: { id: orgId },
      data: dto,
    });
  }

  async delete(orgId: string, userId: string, userRoles: string[]) {
    const authorized = await this.canManageOrganization(userId, userRoles, orgId);
    if (!authorized) {
      throw new ForbiddenException(
        'You do not have permission to delete this organization',
      );
    }

    return this.prisma.organization.delete({
      where: { id: orgId },
    });
  }

  // ---------------------------------------------------------------------------
  // Organization Member Operations
  // ---------------------------------------------------------------------------

  async findMembers(organizationId: string) {
    await this.findById(organizationId);

    return this.prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
      orderBy: { role: 'asc' },
    });
  }

  async addMember(
    orgId: string,
    requestingUserId: string,
    requestingUserRoles: string[],
    dto: AddOrganizationMemberDto,
  ) {
    const authorized = await this.canManageOrganization(
      requestingUserId,
      requestingUserRoles,
      orgId,
    );
    if (!authorized) {
      throw new ForbiddenException(
        'You do not have permission to manage members for this organization',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${dto.userId}" not found`);
    }

    const existing = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: dto.userId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('User is already a registered member of this organization');
    }

    return this.prisma.organizationMember.create({
      data: {
        organizationId: orgId,
        userId: dto.userId,
        role: dto.role || OrgMemberRole.MEMBER,
        title: dto.title,
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });
  }

  async updateMember(
    orgId: string,
    memberId: string,
    requestingUserId: string,
    requestingUserRoles: string[],
    dto: UpdateOrganizationMemberDto,
  ) {
    const authorized = await this.canManageOrganization(
      requestingUserId,
      requestingUserRoles,
      orgId,
    );
    if (!authorized) {
      throw new ForbiddenException(
        'You do not have permission to manage members for this organization',
      );
    }

    const member = await this.prisma.organizationMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.organizationId !== orgId) {
      throw new NotFoundException(`Organization member record with ID "${memberId}" not found`);
    }

    return this.prisma.organizationMember.update({
      where: { id: memberId },
      data: dto,
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });
  }

  async removeMember(
    orgId: string,
    memberId: string,
    requestingUserId: string,
    requestingUserRoles: string[],
  ) {
    const authorized = await this.canManageOrganization(
      requestingUserId,
      requestingUserRoles,
      orgId,
    );
    if (!authorized) {
      throw new ForbiddenException(
        'You do not have permission to remove members from this organization',
      );
    }

    const member = await this.prisma.organizationMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.organizationId !== orgId) {
      throw new NotFoundException(`Organization member record with ID "${memberId}" not found`);
    }

    return this.prisma.organizationMember.delete({
      where: { id: memberId },
    });
  }
}

