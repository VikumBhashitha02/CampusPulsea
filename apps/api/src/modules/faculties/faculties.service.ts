import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RoleType } from '@campuspulse/types';
import type { QueryFacultiesDto } from './dto/query-faculties.dto';
import type { CreateFacultyDto } from './dto/create-faculty.dto';
import type { UpdateFacultyDto } from './dto/update-faculty.dto';
import type { CreateDepartmentDto } from './dto/create-department.dto';
import type { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class FacultiesService {
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

  // ---------------------------------------------------------------------------
  // Faculty Operations
  // ---------------------------------------------------------------------------

  async findAll(query: QueryFacultiesDto) {
    const { skip, limit, search, universityId } = query;
    const where: any = {};

    if (universityId) {
      where.universityId = universityId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [faculties, total] = await Promise.all([
      this.prisma.faculty.findMany({
        where,
        skip,
        take: limit,
        include: {
          university: { select: { id: true, name: true, slug: true, city: true } },
          departments: true,
          _count: { select: { departments: true, studentProfiles: true } },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.faculty.count({ where }),
    ]);

    return {
      items: faculties,
      meta: {
        total,
        page: query.page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByUniversity(universityId: string) {
    return this.prisma.faculty.findMany({
      where: { universityId },
      include: {
        departments: true,
        _count: { select: { departments: true, studentProfiles: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { id },
      include: {
        university: { select: { id: true, name: true, slug: true, city: true } },
        departments: true,
        _count: { select: { studentProfiles: true } },
      },
    });

    if (!faculty) {
      throw new NotFoundException(`Faculty with ID "${id}" not found`);
    }

    return faculty;
  }

  async createFaculty(userId: string, userRoles: string[], dto: CreateFacultyDto) {
    const authorized = await this.canManageUniversity(userId, userRoles, dto.universityId);
    if (!authorized) {
      throw new ForbiddenException(
        'You do not have permission to manage faculties in this university',
      );
    }

    const university = await this.prisma.university.findUnique({
      where: { id: dto.universityId },
    });

    if (!university) {
      throw new NotFoundException(`University with ID "${dto.universityId}" not found`);
    }

    const existing = await this.prisma.faculty.findFirst({
      where: {
        universityId: dto.universityId,
        OR: [{ slug: dto.slug }, { code: dto.code }],
      },
    });

    if (existing) {
      throw new ConflictException(
        'A faculty with this slug or code already exists in this university',
      );
    }

    return this.prisma.faculty.create({
      data: dto,
    });
  }

  async updateFaculty(
    id: string,
    userId: string,
    userRoles: string[],
    dto: UpdateFacultyDto,
  ) {
    const faculty = await this.findById(id);

    const authorized = await this.canManageUniversity(userId, userRoles, faculty.universityId);
    if (!authorized) {
      throw new ForbiddenException(
        'You do not have permission to modify faculties in this university',
      );
    }

    if (dto.slug || dto.code) {
      const existing = await this.prisma.faculty.findFirst({
        where: {
          universityId: faculty.universityId,
          id: { not: id },
          OR: [
            ...(dto.slug ? [{ slug: dto.slug }] : []),
            ...(dto.code ? [{ code: dto.code }] : []),
          ],
        },
      });

      if (existing) {
        throw new ConflictException(
          'A faculty with this slug or code already exists in this university',
        );
      }
    }

    return this.prisma.faculty.update({
      where: { id },
      data: dto,
    });
  }

  async deleteFaculty(id: string, userId: string, userRoles: string[]) {
    const faculty = await this.findById(id);

    const authorized = await this.canManageUniversity(userId, userRoles, faculty.universityId);
    if (!authorized) {
      throw new ForbiddenException(
        'You do not have permission to delete faculties in this university',
      );
    }

    return this.prisma.faculty.delete({
      where: { id },
    });
  }

  // ---------------------------------------------------------------------------
  // Department Operations
  // ---------------------------------------------------------------------------

  async findDepartmentsByFaculty(facultyId: string) {
    return this.prisma.department.findMany({
      where: { facultyId },
      include: {
        _count: { select: { studentProfiles: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findDepartmentById(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        faculty: {
          include: {
            university: { select: { id: true, name: true, slug: true } },
          },
        },
        _count: { select: { studentProfiles: true } },
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID "${id}" not found`);
    }

    return department;
  }

  async createDepartment(
    userId: string,
    userRoles: string[],
    dto: CreateDepartmentDto,
  ) {
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

    const existing = await this.prisma.department.findFirst({
      where: {
        facultyId: dto.facultyId,
        OR: [{ slug: dto.slug }, { code: dto.code }],
      },
    });

    if (existing) {
      throw new ConflictException(
        'A department with this slug or code already exists in this faculty',
      );
    }

    return this.prisma.department.create({
      data: dto,
    });
  }

  async updateDepartment(
    id: string,
    userId: string,
    userRoles: string[],
    dto: UpdateDepartmentDto,
  ) {
    const department = await this.findDepartmentById(id);

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

    return this.prisma.department.update({
      where: { id },
      data: dto,
    });
  }
}

