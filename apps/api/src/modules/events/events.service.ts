import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { QueryEventsDto } from './dto/query-events.dto';
import type { CreateEventDto } from './dto/create-event.dto';
import type { UpdateEventDto } from './dto/update-event.dto';
import type { RejectEventDto } from './dto/reject-event.dto';
import type { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { EventStatus, OrgMemberRole, RoleType, RegistrationStatus } from '@campuspulse/types';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Evaluates if a user has rights to manage this specific event.
   */
  async canManageEvent(userId: string, userRoles: string[], eventId: string): Promise<boolean> {
    if (userRoles.includes(RoleType.SUPER_ADMIN) || userRoles.includes(RoleType.ADMIN)) {
      return true;
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { organizationId: true },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }

    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: event.organizationId,
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
  // Public & Student Endpoints (Strictly PUBLISHED events only)
  // ---------------------------------------------------------------------------

  async findAll(query: QueryEventsDto) {
    const {
      skip,
      limit,
      search,
      categorySlug,
      categoryId,
      universitySlug,
      universityId,
      facultyId,
      departmentId,
      mode,
      featured,
      startDateFrom,
      startDateTo,
      datePreset,
      registrationOpenOnly,
      isFree,
      skills,
      sortBy,
      sortOrder,
    } = query;

    // Public catalog ALWAYS filters by PUBLISHED status
    const andConditions: any[] = [{ status: EventStatus.PUBLISHED }];

    // 1. Full Multi-Field Text Search (Title, Description, Category, Skills, University, Organization)
    if (search && search.trim().length > 0) {
      const s = search.trim();
      andConditions.push({
        OR: [
          { title: { contains: s, mode: 'insensitive' } },
          { description: { contains: s, mode: 'insensitive' } },
          { shortDescription: { contains: s, mode: 'insensitive' } },
          { location: { contains: s, mode: 'insensitive' } },
          { venue: { contains: s, mode: 'insensitive' } },
          { category: { name: { contains: s, mode: 'insensitive' } } },
          { category: { slug: { contains: s, mode: 'insensitive' } } },
          { university: { name: { contains: s, mode: 'insensitive' } } },
          { university: { slug: { contains: s, mode: 'insensitive' } } },
          { organization: { name: { contains: s, mode: 'insensitive' } } },
          { organization: { slug: { contains: s, mode: 'insensitive' } } },
          { skills: { hasSome: [s] } },
        ],
      });
    }

    // 2. Category Filter (slug or ID)
    if (categorySlug) {
      andConditions.push({ category: { slug: categorySlug } });
    }
    if (categoryId) {
      andConditions.push({ categoryId });
    }

    // 3. University Filter (slug or ID, matching direct university or through organization)
    if (universitySlug) {
      andConditions.push({
        OR: [
          { university: { slug: universitySlug } },
          { organization: { university: { slug: universitySlug } } },
        ],
      });
    }
    if (universityId) {
      andConditions.push({
        OR: [{ universityId }, { organization: { universityId } }],
      });
    }

    // 4. Faculty and Department Filter
    if (facultyId) {
      andConditions.push({ facultyId });
    }
    if (departmentId) {
      andConditions.push({ departmentId });
    }

    // 5. Event Mode Filter (IN_PERSON, ONLINE, HYBRID)
    if (mode) {
      andConditions.push({ mode });
    }

    // 6. Featured Filter
    if (featured !== undefined) {
      andConditions.push({ featured });
    }

    // 7. Pricing Filter (Free / Paid)
    if (isFree !== undefined) {
      andConditions.push({ isFree });
    }

    // 8. Registration Open Only Filter
    if (registrationOpenOnly) {
      const now = new Date();
      andConditions.push({
        OR: [
          { registrationDeadline: null, startDate: { gte: now } },
          { registrationDeadline: { gte: now } },
        ],
      });
    }

    // 9. Date Filters (Preset or Custom Range)
    if (datePreset && datePreset !== 'all') {
      const now = new Date();
      if (datePreset === 'today') {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const endOfToday = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
          999,
        );
        andConditions.push({ startDate: { gte: startOfToday, lte: endOfToday } });
      } else if (datePreset === 'this_week') {
        const endOfWeek = new Date();
        endOfWeek.setDate(endOfWeek.getDate() + 7);
        andConditions.push({ startDate: { gte: now, lte: endOfWeek } });
      } else if (datePreset === 'this_month') {
        const endOfMonth = new Date();
        endOfMonth.setDate(endOfMonth.getDate() + 30);
        andConditions.push({ startDate: { gte: now, lte: endOfMonth } });
      } else if (datePreset === 'upcoming') {
        andConditions.push({ startDate: { gte: now } });
      }
    } else if (startDateFrom || startDateTo) {
      const dateFilter: any = {};
      if (startDateFrom) dateFilter.gte = new Date(startDateFrom);
      if (startDateTo) dateFilter.lte = new Date(startDateTo);
      andConditions.push({ startDate: dateFilter });
    }

    // 10. Skills Filter
    if (skills) {
      const skillList =
        typeof skills === 'string'
          ? skills
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : skills;
      if (skillList.length > 0) {
        andConditions.push({ skills: { hasSome: skillList } });
      }
    }

    const where = { AND: andConditions };

    // Sorting logic
    let orderBy: any = {};
    if (sortBy === 'registrations') {
      orderBy = { registrations: { _count: sortOrder || 'desc' } };
    } else if (sortBy === 'title') {
      orderBy = { title: sortOrder || 'asc' };
    } else if (sortBy === 'createdAt') {
      orderBy = { createdAt: sortOrder || 'desc' };
    } else if (sortBy === 'startDate') {
      orderBy = { startDate: sortOrder || 'asc' };
    } else {
      orderBy = { startDate: 'asc' };
    }

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        include: {
          organization: {
            select: { id: true, name: true, slug: true, logoUrl: true, isVerified: true },
          },
          category: {
            select: { id: true, name: true, slug: true, icon: true, type: true },
          },
          university: {
            select: { id: true, name: true, slug: true, city: true },
          },
          _count: {
            select: { registrations: true, bookmarks: true, teams: true },
          },
        },
        orderBy,
      }),
      this.prisma.event.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: events,
      meta: {
        total,
        page: query.page,
        limit,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPrevPage: query.page > 1,
      },
    };
  }

  async findById(id: string, requestingUser?: { id: string; roles: string[] }) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        organization: {
          include: { university: true },
        },
        category: true,
        university: true,
        faculty: true,
        department: true,
        teams: {
          where: { isOpen: true },
          include: {
            creator: { select: { id: true, name: true, avatarUrl: true } },
            members: {
              include: {
                user: { select: { id: true, name: true, avatarUrl: true } },
              },
            },
          },
        },
        _count: {
          select: { registrations: true, bookmarks: true },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }

    // Privacy Isolation: Non-published events are strictly concealed from public/students
    if (event.status !== EventStatus.PUBLISHED) {
      if (!requestingUser) {
        throw new NotFoundException(`Event with ID "${id}" not found`);
      }

      const hasPrivilege =
        requestingUser.roles.includes(RoleType.SUPER_ADMIN) ||
        requestingUser.roles.includes(RoleType.ADMIN);

      if (!hasPrivilege) {
        const membership = await this.prisma.organizationMember.findUnique({
          where: {
            organizationId_userId: {
              organizationId: event.organizationId,
              userId: requestingUser.id,
            },
          },
        });

        if (
          !membership ||
          (membership.role !== OrgMemberRole.LEADER && membership.role !== OrgMemberRole.MANAGER)
        ) {
          throw new NotFoundException(`Event with ID "${id}" not found`);
        }
      }
    }

    return event;
  }

  async findBySlug(slug: string, requestingUser?: { id: string; roles: string[] }) {
    const event = await this.prisma.event.findUnique({
      where: { slug },
      include: {
        organization: {
          include: { university: true },
        },
        category: true,
        university: true,
        faculty: true,
        department: true,
        teams: {
          where: { isOpen: true },
          include: {
            creator: { select: { id: true, name: true, avatarUrl: true } },
            members: {
              include: {
                user: { select: { id: true, name: true, avatarUrl: true } },
              },
            },
          },
        },
        _count: {
          select: { registrations: true, bookmarks: true },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with slug "${slug}" not found`);
    }

    // Privacy Isolation: Non-published events are strictly concealed from public/students
    if (event.status !== EventStatus.PUBLISHED) {
      if (!requestingUser) {
        throw new NotFoundException(`Event with slug "${slug}" not found`);
      }

      const hasPrivilege =
        requestingUser.roles.includes(RoleType.SUPER_ADMIN) ||
        requestingUser.roles.includes(RoleType.ADMIN);

      if (!hasPrivilege) {
        const membership = await this.prisma.organizationMember.findUnique({
          where: {
            organizationId_userId: {
              organizationId: event.organizationId,
              userId: requestingUser.id,
            },
          },
        });

        if (
          !membership ||
          (membership.role !== OrgMemberRole.LEADER && membership.role !== OrgMemberRole.MANAGER)
        ) {
          throw new NotFoundException(`Event with slug "${slug}" not found`);
        }
      }
    }

    return event;
  }

  private async validateEventRelationshipsAndDates(
    dto: Partial<CreateEventDto | UpdateEventDto>,
    existingEvent?: any,
  ) {
    const startDate = dto.startDate || existingEvent?.startDate;
    const endDate = dto.endDate || existingEvent?.endDate;
    const registrationDeadline =
      dto.registrationDeadline !== undefined
        ? dto.registrationDeadline
        : existingEvent?.registrationDeadline;

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      throw new BadRequestException('Event end date cannot be before start date');
    }

    if (registrationDeadline && startDate && new Date(registrationDeadline) > new Date(startDate)) {
      throw new BadRequestException('Registration deadline cannot be after event start date');
    }

    const orgId = (dto as any).organizationId || existingEvent?.organizationId;
    let organization: any = null;
    if (orgId) {
      organization = await this.prisma.organization.findUnique({
        where: { id: orgId },
      });
      if (!organization) {
        throw new NotFoundException(`Organization with ID "${orgId}" not found`);
      }
    }

    const catId = dto.categoryId || existingEvent?.categoryId;
    if (catId) {
      const category = await this.prisma.category.findUnique({
        where: { id: catId },
      });
      if (!category) {
        throw new NotFoundException(`Category with ID "${catId}" not found`);
      }
    }

    const uniId = dto.universityId !== undefined ? dto.universityId : existingEvent?.universityId;
    if (uniId) {
      const university = await this.prisma.university.findUnique({
        where: { id: uniId },
      });
      if (!university) {
        throw new NotFoundException(`University with ID "${uniId}" not found`);
      }

      if (organization?.universityId && uniId !== organization.universityId) {
        throw new BadRequestException(
          "Event university must match the hosting organization's university",
        );
      }
    }

    const facId = dto.facultyId !== undefined ? dto.facultyId : existingEvent?.facultyId;
    if (facId) {
      const faculty = await this.prisma.faculty.findUnique({
        where: { id: facId },
      });
      if (!faculty) {
        throw new NotFoundException(`Faculty with ID "${facId}" not found`);
      }

      const targetUniId = uniId || organization?.universityId;
      if (targetUniId && faculty.universityId !== targetUniId) {
        throw new BadRequestException('Faculty does not belong to the event university');
      }
    }

    const deptId = dto.departmentId !== undefined ? dto.departmentId : existingEvent?.departmentId;
    if (deptId) {
      const department = await this.prisma.department.findUnique({
        where: { id: deptId },
      });
      if (!department) {
        throw new NotFoundException(`Department with ID "${deptId}" not found`);
      }

      if (facId && department.facultyId !== facId) {
        throw new BadRequestException('Department does not belong to the selected faculty');
      }
    }

    return { organization };
  }

  // ---------------------------------------------------------------------------
  // Organizer Operations
  // ---------------------------------------------------------------------------

  async create(userId: string, userRoles: string[], dto: CreateEventDto) {
    // Check permission to organize on behalf of the organization
    const isGlobalAdmin =
      userRoles.includes(RoleType.SUPER_ADMIN) || userRoles.includes(RoleType.ADMIN);

    if (!isGlobalAdmin) {
      const membership = await this.prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: dto.organizationId,
            userId,
          },
        },
      });

      if (
        !membership ||
        (membership.role !== OrgMemberRole.LEADER && membership.role !== OrgMemberRole.MANAGER)
      ) {
        throw new ForbiddenException(
          'You must be a Leader or Manager of this organization to create events',
        );
      }
    }

    const { organization } = await this.validateEventRelationshipsAndDates(dto);

    const existingSlug = await this.prisma.event.findUnique({
      where: { slug: dto.slug },
    });

    if (existingSlug) {
      throw new ConflictException(`An event with slug "${dto.slug}" already exists`);
    }

    const resolvedUniversityId = dto.universityId ?? organization?.universityId ?? null;

    // Always begins in DRAFT status
    return this.prisma.event.create({
      data: {
        organizationId: dto.organizationId,
        categoryId: dto.categoryId,
        universityId: resolvedUniversityId,
        facultyId: dto.facultyId,
        departmentId: dto.departmentId,
        title: dto.title,
        slug: dto.slug,
        shortDescription: dto.shortDescription,
        description: dto.description,
        status: EventStatus.DRAFT,
        mode: dto.mode,
        location: dto.location,
        venue: dto.venue,
        meetingUrl: dto.meetingUrl,
        startDate: dto.startDate,
        endDate: dto.endDate,
        registrationDeadline: dto.registrationDeadline,
        eligibility: dto.eligibility,
        teamSize: dto.teamSize,
        skills: dto.skills || [],
        prizeInfo: dto.prizeInfo,
        certificateInfo: dto.certificateInfo,
        registrationUrl: dto.registrationUrl,
        coverImageUrl: dto.coverImageUrl,
        contactInfo: dto.contactInfo,
        capacity: dto.capacity,
        isFree: dto.isFree,
        price: dto.price,
        currency: dto.currency || 'LKR',
        tags: dto.tags || [],
      },
    });
  }

  async update(eventId: string, userId: string, userRoles: string[], dto: UpdateEventDto) {
    const authorized = await this.canManageEvent(userId, userRoles, eventId);
    if (!authorized) {
      throw new ForbiddenException('You do not have permission to modify this event');
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }

    const isGlobalAdmin =
      userRoles.includes(RoleType.SUPER_ADMIN) || userRoles.includes(RoleType.ADMIN);

    if (dto.status === EventStatus.PUBLISHED && !isGlobalAdmin) {
      throw new ForbiddenException('Organizers cannot directly publish events. Submit for review instead.');
    }

    if (dto.slug && dto.slug !== event.slug) {
      const existingSlug = await this.prisma.event.findFirst({
        where: {
          id: { not: eventId },
          slug: dto.slug,
        },
      });

      if (existingSlug) {
        throw new ConflictException(`An event with slug "${dto.slug}" already exists`);
      }
    }

    await this.validateEventRelationshipsAndDates(dto, event);

    return this.prisma.event.update({
      where: { id: eventId },
      data: dto,
    });
  }

  async deleteDraft(eventId: string, userId: string, userRoles: string[]) {
    const authorized = await this.canManageEvent(userId, userRoles, eventId);
    if (!authorized) {
      throw new ForbiddenException('You do not have permission to delete this event');
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }

    const isGlobalAdmin =
      userRoles.includes(RoleType.SUPER_ADMIN) || userRoles.includes(RoleType.ADMIN);

    if (event.status !== EventStatus.DRAFT && !isGlobalAdmin) {
      throw new BadRequestException(
        `Only DRAFT events can be deleted. Event status is "${event.status}". Cancel the event instead.`,
      );
    }

    return this.prisma.event.delete({
      where: { id: eventId },
    });
  }

  async submitForReview(eventId: string, userId: string, userRoles: string[]) {
    const authorized = await this.canManageEvent(userId, userRoles, eventId);
    if (!authorized) {
      throw new ForbiddenException('You do not have permission to submit this event for review');
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }

    if (event.status !== EventStatus.DRAFT && event.status !== EventStatus.REJECTED) {
      throw new BadRequestException(
        `Only DRAFT or REJECTED events can be submitted for review. Current status is "${event.status}"`,
      );
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        status: EventStatus.PENDING_REVIEW,
        rejectionReason: null,
      },
    });
  }

  async findOrganizerEvents(userId: string, userRoles: string[], organizationId?: string) {
    const isGlobalAdmin =
      userRoles.includes(RoleType.SUPER_ADMIN) || userRoles.includes(RoleType.ADMIN);

    let orgIds: string[] = [];

    if (isGlobalAdmin && organizationId) {
      orgIds = [organizationId];
    } else if (organizationId) {
      // Verify user is officer in this org
      const membership = await this.prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: { organizationId, userId },
        },
      });
      if (!membership) {
        throw new ForbiddenException('You are not a member of this organization');
      }
      orgIds = [organizationId];
    } else {
      // Find all orgs where user is LEADER or MANAGER
      const memberships = await this.prisma.organizationMember.findMany({
        where: {
          userId,
          role: { in: [OrgMemberRole.LEADER, OrgMemberRole.MANAGER] },
        },
        select: { organizationId: true },
      });
      orgIds = memberships.map((m) => m.organizationId);
    }

    return this.prisma.event.findMany({
      where: {
        organizationId: { in: orgIds },
      },
      include: {
        organization: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { registrations: true, bookmarks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ---------------------------------------------------------------------------
  // Admin Moderation Operations
  // ---------------------------------------------------------------------------

  async findPendingEvents(query: PaginationQueryDto) {
    const { skip, limit } = query;

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where: { status: EventStatus.PENDING_REVIEW },
        skip,
        take: limit,
        include: {
          organization: { select: { id: true, name: true, slug: true, university: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.event.count({ where: { status: EventStatus.PENDING_REVIEW } }),
    ]);

    return {
      items: events,
      meta: {
        total,
        page: query.page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async approveEvent(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        status: EventStatus.PUBLISHED,
        rejectionReason: null,
      },
    });
  }

  async rejectEvent(eventId: string, dto: RejectEventDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        status: EventStatus.REJECTED,
        rejectionReason: dto.reason,
      },
    });
  }

  async cancelEvent(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        status: EventStatus.CANCELLED,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Student Features: Bookmarking, Registration Tracking & Recommendations
  // ---------------------------------------------------------------------------

  async bookmark(userId: string, eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, status: true },
    });

    if (!event || event.status !== EventStatus.PUBLISHED) {
      throw new NotFoundException(`Opportunity not found or not published`);
    }

    await this.prisma.eventBookmark.upsert({
      where: {
        eventId_userId: { eventId, userId },
      },
      update: {},
      create: { eventId, userId },
    });

    return { bookmarked: true, eventId, message: 'Saved to personal bookmarks' };
  }

  async unbookmark(userId: string, eventId: string) {
    const existing = await this.prisma.eventBookmark.findUnique({
      where: {
        eventId_userId: { eventId, userId },
      },
    });

    if (existing) {
      await this.prisma.eventBookmark.delete({
        where: { id: existing.id },
      });
    }

    return { bookmarked: false, eventId, message: 'Removed from bookmarks' };
  }

  async trackRegistration(userId: string, eventId: string, notes?: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        registrationUrl: true,
        startDate: true,
        endDate: true,
      },
    });

    if (!event || event.status !== EventStatus.PUBLISHED) {
      throw new NotFoundException(`Opportunity not found or not open for registration`);
    }

    const registration = await this.prisma.eventRegistration.upsert({
      where: {
        eventId_userId: { eventId, userId },
      },
      update: {
        status: RegistrationStatus.REGISTERED,
        registeredAt: new Date(),
        ...(notes && { notes }),
      },
      create: {
        eventId,
        userId,
        status: RegistrationStatus.REGISTERED,
        notes,
      },
    });

    return {
      id: registration.id,
      eventId: event.id,
      eventTitle: event.title,
      userId,
      status: registration.status,
      registeredAt: registration.registeredAt,
      externalUrl: event.registrationUrl || null,
      message: event.registrationUrl
        ? 'Registration click tracked; redirecting to organizer registration portal'
        : 'RSVP recorded successfully',
    };
  }

  async getRecommendations(userId: string, limit = 6) {
    const now = new Date();

    // 1. Fetch student's profile preferences
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
      select: {
        universityId: true,
        skills: true,
        interests: true,
        careerInterests: true,
      },
    });

    // 2. Fetch upcoming published opportunities
    const candidateEvents = await this.prisma.event.findMany({
      where: {
        status: EventStatus.PUBLISHED,
        startDate: { gte: now },
      },
      include: {
        category: { select: { id: true, name: true, slug: true, icon: true } },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            universityId: true,
          },
        },
        university: { select: { id: true, name: true, slug: true, city: true } },
        _count: {
          select: { registrations: true, bookmarks: true },
        },
      },
      take: 40,
    });

    if (!student) {
      return candidateEvents.slice(0, limit);
    }

    const studentSkillsLower = (student.skills || []).map((s) => s.toLowerCase());
    const studentInterestsLower = [
      ...(student.interests || []),
      ...(student.careerInterests || []),
    ].map((i) => i.toLowerCase());

    // 3. Rule-based scoring:
    //    - Same University: +30 pts
    //    - Matching Skill: +20 pts each
    //    - Matching Interest / Career domain: +15 pts each
    //    - Featured: +10 pts
    //    - Popularity: +1 pt per 10 registrations
    const scored = candidateEvents.map((event) => {
      let score = 0;

      // University affiliation match
      if (
        (student.universityId && event.universityId === student.universityId) ||
        (student.universityId && event.organization?.universityId === student.universityId)
      ) {
        score += 30;
      }

      // Skills match
      if (Array.isArray(event.skills)) {
        for (const skill of event.skills) {
          if (studentSkillsLower.includes(skill.toLowerCase())) {
            score += 20;
          }
        }
      }

      // Category / Interest match
      const categorySlug = event.category?.slug.toLowerCase() || '';
      const categoryName = event.category?.name.toLowerCase() || '';
      if (
        studentInterestsLower.some(
          (interest) =>
            categorySlug.includes(interest) ||
            categoryName.includes(interest) ||
            interest.includes(categorySlug),
        )
      ) {
        score += 15;
      }

      if (event.featured) {
        score += 10;
      }

      score += Math.min(20, Math.floor((event._count?.registrations || 0) / 10));

      return { event, score };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map((s) => s.event);
  }

  async getUpcomingDeadlines(limit = 6) {
    const now = new Date();

    return this.prisma.event.findMany({
      where: {
        status: EventStatus.PUBLISHED,
        registrationDeadline: { gte: now },
      },
      include: {
        category: { select: { id: true, name: true, slug: true, icon: true } },
        organization: { select: { id: true, name: true, slug: true, logoUrl: true } },
        university: { select: { id: true, name: true, slug: true } },
        _count: {
          select: { registrations: true, bookmarks: true },
        },
      },
      orderBy: { registrationDeadline: 'asc' },
      take: limit,
    });
  }

  async getCalendar(userId?: string, month?: number, year?: number) {
    const targetYear = year || new Date().getFullYear();
    const targetMonth = month !== undefined ? month - 1 : new Date().getMonth();

    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    const events = await this.prisma.event.findMany({
      where: {
        status: EventStatus.PUBLISHED,
        OR: [
          {
            startDate: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          {
            registrationDeadline: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        ],
      },
      include: {
        category: { select: { name: true, slug: true } },
        organization: { select: { name: true, slug: true } },
        registrations: userId
          ? {
              where: { userId, status: RegistrationStatus.REGISTERED },
              select: { id: true },
            }
          : false,
        bookmarks: userId
          ? {
              where: { userId },
              select: { id: true },
            }
          : false,
      },
      orderBy: { startDate: 'asc' },
    });

    const entries: any[] = [];

    for (const event of events) {
      const isRegistered = (event.registrations?.length || 0) > 0;
      const isBookmarked = (event.bookmarks?.length || 0) > 0;

      if (event.startDate >= startOfMonth && event.startDate <= endOfMonth) {
        entries.push({
          id: `evt-${event.id}`,
          eventId: event.id,
          title: event.title,
          slug: event.slug,
          date: event.startDate,
          endDate: event.endDate,
          entryType: 'EVENT_DATE',
          isRegistered,
          isBookmarked,
          mode: event.mode,
          location: event.location,
          venue: event.venue,
          category: event.category,
          organization: event.organization,
        });
      }

      if (
        event.registrationDeadline &&
        event.registrationDeadline >= startOfMonth &&
        event.registrationDeadline <= endOfMonth
      ) {
        entries.push({
          id: `dl-${event.id}`,
          eventId: event.id,
          title: `${event.title} (Deadline)`,
          slug: event.slug,
          date: event.registrationDeadline,
          entryType: 'REGISTRATION_DEADLINE',
          isRegistered,
          isBookmarked,
          mode: event.mode,
          location: event.location,
          venue: event.venue,
          category: event.category,
          organization: event.organization,
        });
      }
    }

    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      month: targetMonth + 1,
      year: targetYear,
      totalEntries: entries.length,
      entries,
    };
  }

  async incrementViewCount(eventId: string) {
    await this.prisma.event.update({
      where: { id: eventId },
      data: { viewCount: { increment: 1 } },
    });
    return { success: true };
  }

  async getOrganizerAnalytics(userId: string, userRoles: string[], organizationId?: string) {
    const events = await this.findOrganizerEvents(userId, userRoles, organizationId);

    const totalEvents = events.length;
    const publishedEvents = events.filter((e) => e.status === EventStatus.PUBLISHED).length;
    const pendingEvents = events.filter((e) => e.status === EventStatus.PENDING_REVIEW).length;
    const draftEvents = events.filter((e) => e.status === EventStatus.DRAFT).length;
    const cancelledEvents = events.filter((e) => e.status === EventStatus.CANCELLED).length;

    let totalViews = 0;
    let totalRegistrations = 0;
    let totalBookmarks = 0;

    const eventBreakdown = events.map((e: any) => {
      const views = e.viewCount || 0;
      const regs = e._count?.registrations || 0;
      const bms = e._count?.bookmarks || 0;

      totalViews += views;
      totalRegistrations += regs;
      totalBookmarks += bms;

      const conversionRate = views > 0 ? Math.round((regs / views) * 100) : 0;

      return {
        id: e.id,
        title: e.title,
        slug: e.slug,
        status: e.status,
        views,
        bookmarks: bms,
        registrations: regs,
        conversionRate,
      };
    });

    return {
      totalEvents,
      publishedEvents,
      pendingEvents,
      draftEvents,
      cancelledEvents,
      totalViews,
      totalRegistrations,
      totalBookmarks,
      recentEvents: events.slice(0, 5),
      eventBreakdown,
    };
  }

  async findEventRegistrations(
    eventId: string,
    userId: string,
    userRoles: string[],
    status?: RegistrationStatus,
    search?: string,
  ) {
    const authorized = await this.canManageEvent(userId, userRoles, eventId);
    if (!authorized) {
      throw new ForbiddenException('You do not have permission to view registrations for this opportunity');
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        capacity: true,
        isFree: true,
        price: true,
        currency: true,
        registrationUrl: true,
        startDate: true,
        endDate: true,
        organization: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }

    const andConditions: any[] = [{ eventId }];

    if (status) {
      andConditions.push({ status });
    }

    if (search && search.trim()) {
      const q = search.trim();
      andConditions.push({
        user: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
          ],
        },
      });
    }

    const [allRegistrationsForCounts, filteredRegistrations] = await Promise.all([
      this.prisma.eventRegistration.findMany({
        where: { eventId },
        select: { status: true },
      }),
      this.prisma.eventRegistration.findMany({
        where: { AND: andConditions },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              studentProfile: {
                select: {
                  university: { select: { name: true } },
                  faculty: { select: { name: true } },
                  department: { select: { name: true } },
                },
              },
            },
          },
        },
        orderBy: { registeredAt: 'desc' },
      }),
    ]);

    const summary = {
      total: allRegistrationsForCounts.length,
      registered: allRegistrationsForCounts.filter((r) => r.status === RegistrationStatus.REGISTERED).length,
      cancelled: allRegistrationsForCounts.filter((r) => r.status === RegistrationStatus.CANCELLED).length,
      attended: allRegistrationsForCounts.filter((r) => r.status === RegistrationStatus.ATTENDED).length,
      waitlisted: allRegistrationsForCounts.filter((r) => r.status === RegistrationStatus.WAITLISTED).length,
      capacity: event.capacity ?? null,
    };

    return {
      event,
      summary,
      items: filteredRegistrations,
    };
  }
}
