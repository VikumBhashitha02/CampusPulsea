import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import type { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const { skip, limit } = query;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          isActive: true,
          createdAt: true,
          roles: {
            select: { role: { select: { name: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      items: users.map((u) => ({
        ...u,
        roles: u.roles.map((r) => r.role.name),
      })),
      meta: {
        total,
        page: query.page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: { include: { role: true } },
        studentProfile: {
          include: {
            university: true,
            faculty: true,
            department: true,
          },
        },
        organizationMembers: {
          include: { organization: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      roles: user.roles.map((r) => r.role.name),
      profile: user.studentProfile,
      organizations: user.organizationMembers.map((m) => ({
        id: m.organization.id,
        name: m.organization.name,
        role: m.role,
        title: m.title,
      })),
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const { firstName, lastName, avatarUrl, ...profileData } = dto;

    // Update User name and avatar if provided
    if (firstName !== undefined || lastName !== undefined || avatarUrl !== undefined) {
      const updateData: any = {};
      if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
      if (firstName !== undefined || lastName !== undefined) {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { name: true },
        });
        const currentParts = (user?.name || '').split(' ');
        const newFirst = firstName !== undefined ? firstName.trim() : currentParts[0] || '';
        const newLast =
          lastName !== undefined ? lastName.trim() : currentParts.slice(1).join(' ') || '';
        updateData.name = `${newFirst} ${newLast}`.trim();
      }
      await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
    }

    // Upsert StudentProfile
    let universityId = profileData.universityId;
    if (!universityId) {
      const existing = await this.prisma.studentProfile.findUnique({ where: { userId } });
      if (!existing) {
        const firstUni = await this.prisma.university.findFirst();
        universityId = firstUni?.id || 'uni-uom';
      }
    }

    const profile = await this.prisma.studentProfile.upsert({
      where: { userId },
      update: {
        ...profileData,
        ...(universityId && { universityId }),
      },
      create: {
        userId,
        universityId: universityId || 'uni-uom',
        ...profileData,
      },
      include: {
        university: { select: { id: true, name: true, slug: true } },
        faculty: { select: { id: true, name: true, slug: true } },
        department: { select: { id: true, name: true, slug: true } },
      },
    });

    const updatedUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, avatarUrl: true },
    });

    return {
      user: updatedUser,
      profile,
    };
  }
}
