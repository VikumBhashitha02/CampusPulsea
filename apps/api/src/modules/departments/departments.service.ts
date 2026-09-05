import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RoleType } from '@campuspulse/types';
import type { QueryDepartmentsDto } from './dto/query-departments.dto';
import type { CreateDepartmentDto } from './dto/create-department.dto';
import type { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to verify if user can manage data for a university.
   * SUPER_ADMIN/ADMIN has global permissions.
   * UNIVERSITY_ADMIN must match their profile's universityId.
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

  async findAll(query?: QueryDepartmentsDto | string) {
    // Support either QueryDepartmentsDto object or legacy facultyId string
    if (typeof query === 'string') {
      const facultyId = query;
      return this.prisma.department.findMany({
        where: { facultyId },
        include: {
          faculty: {
            select: {
              id: true,
              name: true,
              slug: true,
              university: { select: { id: true, name: true, slug: true } },
            },
          },
        },
        orderBy: { name: 'asc' },
      });
    }

    const { skip, limit, search, facultyId, universityId } = query || {};
    const where: any = {};

    if (facultyId) {
      where.facultyId = facultyId;
    }

    if (universityId) {
      where.faculty = { universityId };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [departments, total] = await Promise.all([
      this.prisma.department.findMany({
        where,
        skip,
        take: limit,
        include: {
          faculty: {
            select: {
              id: true,
              name: true,
              slug: true,
              university: { select: { id: true, name: true, slug: true } },
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.department.count({ where }),
    ]);

    return {
      items: departments,
      meta: {
        total,
        page: query?.page || 1,
        limit: limit || 20,
        totalPages: Math.ceil(total / (limit || 20)),
      },
    };
  }

  async findById(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            slug: true,
            university: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID "${id}" not found`);
    }

    return department;
  }

  async create(userId: string, userRoles: string[], dto: CreateDepartmentDto) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { id: dto.facultyId },
    });

    if (!faculty) {
      throw new NotFoundException(`Faculty with ID "${dto.facultyId}" not found`);
    }

    const authorized = await this.canManageUniversity(userId, userRoles, faculty.universityId);
    if (!authorized) {
      throw new ForbiddenException(
        'You do not have permission to create departments in this university',
      );
    }

    const code = dto.code || dto.slug.toUpperCase();
    const existing = await this.prisma.department.findFirst({
      where: {
        facultyId: dto.facultyId,
        OR: [{ slug: dto.slug }, { code }],
      },
    });

    if (existing) {
      throw new ConflictException(
        `Department with this slug or code already exists in this faculty`,
      );
    }

    return this.prisma.department.create({
      data: {
        name: dto.name,
        code,
        slug: dto.slug,
        facultyId: dto.facultyId,
        description: dto.description || null,
      },
    });
  }

  async update(
    id: string,
    userId: string,
    userRoles: string[],
    dto: UpdateDepartmentDto,
  ) {
    const department = await this.findById(id);

    const authorized = await this.canManageUniversity(
      userId,
      userRoles,
      department.faculty.university.id,
    );
    if (!authorized) {
      throw new ForbiddenException(
        'You do not have permission to modify departments in this university',
      );
    }

    if (dto.slug || dto.code) {
      const existing = await this.prisma.department.findFirst({
        where: {
          facultyId: department.facultyId,
          id: { not: id },
          OR: [
            ...(dto.slug ? [{ slug: dto.slug }] : []),
            ...(dto.code ? [{ code: dto.code }] : []),
          ],
        },
      });

      if (existing) {
        throw new ConflictException(
          'A department with this slug or code already exists in this faculty',
        );
      }
    }

    return this.prisma.department.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        slug: dto.slug,
        description: dto.description !== undefined ? dto.description : undefined,
      },
    });
  }

  async delete(id: string, userId: string, userRoles: string[]) {
    const department = await this.findById(id);

    const authorized = await this.canManageUniversity(
      userId,
      userRoles,
      department.faculty.university.id,
    );
    if (!authorized) {
      throw new ForbiddenException(
        'You do not have permission to delete departments in this university',
      );
    }

    return this.prisma.department.delete({
      where: { id },
    });
  }
}

