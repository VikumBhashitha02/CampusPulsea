import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RoleType } from '@campuspulse/types';
import type { QueryUniversitiesDto } from './dto/query-universities.dto';
import type { CreateUniversityDto } from './dto/create-university.dto';
import type { UpdateUniversityDto } from './dto/update-university.dto';

@Injectable()
export class UniversitiesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to check if a user is permitted to manage university resources.
   * SUPER_ADMIN/ADMIN has global access.
   * UNIVERSITY_ADMIN must be affiliated with the given universityId.
   */
  async canManageUniversity(
    userId: string,
    userRoles: string[],
    universityId: string,
  ): Promise<boolean> {
    if (userRoles.includes(RoleType.SUPER_ADMIN) || userRoles.includes(RoleType.ADMIN)) {
      return true;
    }

    if (userRoles.includes(RoleType.UNIVERSITY_ADMIN)) {
      const profile = await this.prisma.studentProfile.findUnique({
        where: { userId },
        select: { universityId: true },
      });
      if (profile && profile.universityId === universityId) {
        return true;
      }
    }

    return false;
  }

  async findAll(query: QueryUniversitiesDto) {
    const { skip, limit, search, city, isVerified } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (isVerified !== undefined) {
      where.isVerified = isVerified;
    }

    const [universities, total] = await Promise.all([
      this.prisma.university.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: { faculties: true, organizations: true, studentProfiles: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.university.count({ where }),
    ]);

    return {
      items: universities,
      meta: {
        total,
        page: query.page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const university = await this.prisma.university.findUnique({
      where: { id },
      include: {
        faculties: {
          include: {
            departments: true,
          },
        },
        organizations: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            status: true,
            logoUrl: true,
            isVerified: true,
          },
        },
        _count: {
          select: { faculties: true, organizations: true, studentProfiles: true },
        },
      },
    });

    if (!university) {
      throw new NotFoundException(`University with ID "${id}" not found`);
    }

    return university;
  }

  async findBySlug(slug: string) {
    const university = await this.prisma.university.findUnique({
      where: { slug },
      include: {
        faculties: {
          include: {
            departments: true,
          },
        },
        organizations: {
          where: { status: 'APPROVED' },
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            logoUrl: true,
          },
        },
        _count: {
          select: { faculties: true, organizations: true, studentProfiles: true },
        },
      },
    });

    if (!university) {
      throw new NotFoundException(`University with slug "${slug}" not found`);
    }

    return university;
  }

  async create(dto: CreateUniversityDto) {
    const existing = await this.prisma.university.findFirst({
      where: {
        OR: [{ slug: dto.slug }, { code: dto.code }],
      },
    });

    if (existing) {
      throw new ConflictException('A university with this slug or code already exists');
    }

    return this.prisma.university.create({
      data: dto,
    });
  }

  async update(
    id: string,
    userId: string,
    userRoles: string[],
    dto: UpdateUniversityDto,
  ) {
    await this.findById(id);

    const authorized = await this.canManageUniversity(userId, userRoles, id);
    if (!authorized) {
      throw new ForbiddenException('You do not have permission to modify this university');
    }

    // Only SUPER_ADMIN can change isVerified
    if (dto.isVerified !== undefined && !userRoles.includes(RoleType.SUPER_ADMIN) && !userRoles.includes(RoleType.ADMIN)) {
      throw new ForbiddenException('Only system administrators can verify a university');
    }

    if (dto.slug || dto.code) {
      const existing = await this.prisma.university.findFirst({
        where: {
          id: { not: id },
          OR: [
            ...(dto.slug ? [{ slug: dto.slug }] : []),
            ...(dto.code ? [{ code: dto.code }] : []),
          ],
        },
      });

      if (existing) {
        throw new ConflictException('A university with this slug or code already exists');
      }
    }

    return this.prisma.university.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, userId: string, userRoles: string[]) {
    await this.findById(id);

    const authorized = await this.canManageUniversity(userId, userRoles, id);
    if (!authorized || (!userRoles.includes(RoleType.SUPER_ADMIN) && !userRoles.includes(RoleType.ADMIN))) {
      throw new ForbiddenException('Only system administrators can delete a university');
    }

    return this.prisma.university.delete({
      where: { id },
    });
  }
}
