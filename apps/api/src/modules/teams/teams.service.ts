import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { CreateTeamDto } from './dto/create-team.dto';
import type { TeamJoinRequestDto } from './dto/team-join-request.dto';
import { TeamRole, TeamRequestStatus, NotificationType, EventStatus } from '@campuspulse/types';

@Injectable()
export class TeamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Deterministic rule-based matching calculation (Strictly Non-AI).
   * Weightings:
   * - Competition / event match: 30%
   * - Skill compatibility: 30%
   * - Role compatibility: 15%
   * - Availability (open roster slots): 10%
   * - Interest compatibility: 10%
   * - Experience (seniority): 5%
   * Total range: 0 to 100.
   */
  calculateMatchScore(
    team: {
      eventId?: string | null;
      requiredSkills?: string[];
      requiredRoles?: string[];
      members?: any[];
      maxMembers: number;
    },
    student: {
      skills?: string[];
      interests?: string[];
      careerInterests?: string[];
      batchYear?: number;
      registeredEventIds?: string[];
    } | null,
    targetEventId?: string,
    preferredRole?: string,
  ): number {
    if (!student) return 50; // Neutral baseline for unauthenticated preview

    let score = 0;

    // 1. Competition / Event Match (30%)
    if (targetEventId && team.eventId === targetEventId) {
      score += 30;
    } else if (
      team.eventId &&
      student.registeredEventIds &&
      student.registeredEventIds.includes(team.eventId)
    ) {
      score += 30;
    } else if (!team.eventId) {
      score += 15; // General squad
    } else {
      score += 10;
    }

    // 2. Skill Compatibility (30%)
    const requiredSkills = (team.requiredSkills || []).map((s) => s.toLowerCase());
    const studentSkills = (student.skills || []).map((s) => s.toLowerCase());

    if (requiredSkills.length > 0) {
      const matching = requiredSkills.filter((req) =>
        studentSkills.some((sk) => sk.includes(req) || req.includes(sk)),
      );
      const skillRatio = matching.length / requiredSkills.length;
      score += Math.min(30, skillRatio * 30);
    } else {
      // If team didn't specify required skills, give baseline
      score += 18;
    }

    // 3. Role Compatibility (15%)
    const requiredRoles = (team.requiredRoles || []).map((r) => r.toLowerCase());
    if (preferredRole && requiredRoles.length > 0) {
      const matchesRole = requiredRoles.some(
        (r) => r.includes(preferredRole.toLowerCase()) || preferredRole.toLowerCase().includes(r),
      );
      score += matchesRole ? 15 : 5;
    } else if (requiredRoles.length > 0) {
      score += 10;
    } else {
      score += 12; // Flexible team
    }

    // 4. Availability / Open Roster Slots (10%)
    const memberCount = team.members?.length || 1;
    const remainingSlots = team.maxMembers - memberCount;
    if (remainingSlots >= 2) {
      score += 10;
    } else if (remainingSlots === 1) {
      score += 8;
    } else {
      score += 0; // Full team
    }

    // 5. Interest Compatibility (10%)
    const studentInterests = [...(student.interests || []), ...(student.careerInterests || [])].map(
      (i) => i.toLowerCase(),
    );

    const teamKeywords = [...(team.requiredSkills || []), ...(team.requiredRoles || [])].map((k) =>
      k.toLowerCase(),
    );

    if (studentInterests.length > 0 && teamKeywords.length > 0) {
      const matchingInterests = teamKeywords.filter((kw) =>
        studentInterests.some(
          (int) =>
            int.includes(kw) ||
            kw.includes(int) ||
            Boolean(int.split(' ')[0] && kw.includes(int.split(' ')[0]!)),
        ),
      );
      const interestRatio = Math.min(
        1,
        (matchingInterests.length * 2) / Math.max(1, teamKeywords.length),
      );
      score += Math.min(10, Math.max(5, Math.round(interestRatio * 10)));
    } else {
      score += 5;
    }

    // 6. Experience (5%)
    if (student.batchYear) {
      const currentYear = new Date().getFullYear();
      const yearsInUni = Math.max(1, currentYear - student.batchYear + 1);
      if (yearsInUni >= 3) {
        score += 5; // Upperclassman
      } else {
        score += 3; // Underclassman
      }
    } else {
      score += 3;
    }

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  async findAll(
    query?: {
      eventId?: string;
      skill?: string;
      role?: string;
      isOpen?: boolean;
    },
    currentUserId?: string,
  ) {
    const where: any = {};
    if (query?.eventId) where.eventId = query.eventId;
    if (query?.isOpen !== undefined) where.isOpen = query.isOpen;
    if (query?.skill) {
      where.requiredSkills = { has: query.skill };
    }
    if (query?.role) {
      where.requiredRoles = { has: query.role };
    }

    const teams = await this.prisma.team.findMany({
      where,
      include: {
        event: { select: { id: true, title: true, slug: true, status: true } },
        creator: { select: { id: true, name: true, avatarUrl: true } },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                studentProfile: { select: { skills: true, batchYear: true } },
              },
            },
          },
        },
        _count: { select: { members: true, joinRequests: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // If current student is authenticated, compute personalized match score for each team
    let studentContext: any = null;
    if (currentUserId) {
      const studentProfile = await this.prisma.studentProfile.findUnique({
        where: { userId: currentUserId },
        select: { skills: true, interests: true, careerInterests: true, batchYear: true },
      });
      const registrations = await this.prisma.eventRegistration.findMany({
        where: { userId: currentUserId, status: 'REGISTERED' },
        select: { eventId: true },
      });

      studentContext = {
        skills: studentProfile?.skills || [],
        interests: studentProfile?.interests || [],
        careerInterests: studentProfile?.careerInterests || [],
        batchYear: studentProfile?.batchYear,
        registeredEventIds: registrations.map((r) => r.eventId),
      };
    }

    const teamsWithScores = teams.map((team) => {
      const matchScore = this.calculateMatchScore(
        team,
        studentContext,
        query?.eventId,
        query?.role,
      );
      return {
        ...team,
        matchScore,
      };
    });

    // Sort by match score descending if student context is present
    if (studentContext) {
      teamsWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    return teamsWithScores;
  }

  async findMyTeams(userId: string) {
    const [joinedMemberships, createdTeams, pendingRequests] = await Promise.all([
      this.prisma.teamMember.findMany({
        where: { userId },
        include: {
          team: {
            include: {
              event: { select: { id: true, title: true, slug: true } },
              creator: { select: { id: true, name: true, avatarUrl: true } },
              members: {
                include: {
                  user: { select: { id: true, name: true, avatarUrl: true } },
                },
              },
              _count: { select: { members: true } },
            },
          },
        },
      }),
      this.prisma.team.findMany({
        where: { creatorId: userId },
        include: {
          event: { select: { id: true, title: true, slug: true } },
          members: {
            include: {
              user: { select: { id: true, name: true, avatarUrl: true } },
            },
          },
          joinRequests: {
            where: { status: TeamRequestStatus.PENDING },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                  studentProfile: { select: { skills: true, batchYear: true } },
                },
              },
            },
          },
          _count: { select: { members: true, joinRequests: true } },
        },
      }),
      this.prisma.teamJoinRequest.findMany({
        where: { userId, status: TeamRequestStatus.PENDING },
        include: {
          team: {
            include: {
              event: { select: { id: true, title: true, slug: true } },
              creator: { select: { id: true, name: true, avatarUrl: true } },
              _count: { select: { members: true } },
            },
          },
        },
      }),
    ]);

    return {
      joinedTeams: joinedMemberships.map((m) => ({
        role: m.role,
        joinedAt: m.joinedAt,
        ...m.team,
      })),
      createdTeams,
      pendingRequests,
    };
  }

  async findById(id: string, currentUserId?: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        event: true,
        creator: { select: { id: true, name: true, avatarUrl: true } },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                studentProfile: { select: { skills: true, batchYear: true } },
              },
            },
          },
        },
        joinRequests: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                studentProfile: { select: { skills: true, batchYear: true } },
              },
            },
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    // Only creator or LEADER can view all join requests
    const isLeader =
      currentUserId &&
      (team.creatorId === currentUserId ||
        team.members.some((m) => m.userId === currentUserId && m.role === TeamRole.LEADER));

    if (!isLeader) {
      // Filter out join requests for non-leaders unless it's their own request
      team.joinRequests = team.joinRequests.filter((r) => r.userId === currentUserId);
    }

    return team;
  }

  async create(userId: string, dto: CreateTeamDto) {
    // Event validation: If event is specified, verify it exists and is PUBLISHED
    if (dto.eventId) {
      const event = await this.prisma.event.findUnique({
        where: { id: dto.eventId },
      });
      if (!event || event.status !== EventStatus.PUBLISHED) {
        throw new BadRequestException(
          'Cannot create a team for an unpublished or nonexistent event',
        );
      }
    }

    const team = await this.prisma.team.create({
      data: {
        creatorId: userId,
        eventId: dto.eventId,
        name: dto.name,
        description: dto.description,
        maxMembers: dto.maxMembers || 4,
        requiredRoles: dto.requiredRoles || [],
        requiredSkills: dto.requiredSkills || [],
        isOpen: true,
      },
    });

    // Automatically add creator as team LEADER
    await this.prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId,
        role: TeamRole.LEADER,
      },
    });

    return team;
  }

  async requestToJoin(teamId: string, userId: string, dto: TeamJoinRequestDto) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
        joinRequests: { where: { status: TeamRequestStatus.PENDING } },
        event: { select: { id: true, title: true, status: true } },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Event validation: Team's event must be PUBLISHED if bound to an event
    if (team.event && team.event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('Cannot join a team for an unpublished event');
    }

    if (team.members.length >= team.maxMembers) {
      throw new ConflictException('This team has already reached maximum capacity');
    }

    const isMember = team.members.some((m) => m.userId === userId);
    if (isMember) {
      throw new ConflictException('You are already a member of this team');
    }

    const existingPending = team.joinRequests.find((r) => r.userId === userId);
    if (existingPending) {
      throw new ConflictException('You already have a pending join request for this team');
    }

    const request = await this.prisma.teamJoinRequest.upsert({
      where: { teamId_userId: { teamId, userId } },
      update: {
        message: dto.message,
        status: TeamRequestStatus.PENDING,
        requestedAt: new Date(),
        respondedAt: null,
      },
      create: {
        teamId,
        userId,
        message: dto.message,
        status: TeamRequestStatus.PENDING,
      },
    });

    // Notify team creator about new join request
    await this.notificationsService.createNotification({
      userId: team.creatorId,
      type: NotificationType.TEAM_REQUEST,
      title: 'New Team Join Request',
      message: `A student requested to join your squad "${team.name}".`,
      linkUrl: `/teams?teamId=${team.id}`,
    });

    return request;
  }

  async respondToRequest(
    requestId: string,
    leaderId: string,
    status: TeamRequestStatus.ACCEPTED | TeamRequestStatus.REJECTED,
  ) {
    const request = await this.prisma.teamJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        team: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Join request not found');
    }

    const team = request.team;

    // Security: Only authorized team creator or LEADER can respond
    const isLeader =
      team.creatorId === leaderId ||
      team.members.some((m) => m.userId === leaderId && m.role === TeamRole.LEADER);

    if (!isLeader) {
      throw new ForbiddenException('Only team leaders can respond to join requests');
    }

    // Security: Students cannot accept their own requests
    if (request.userId === leaderId) {
      throw new ForbiddenException('Students cannot accept their own requests');
    }

    if (status === TeamRequestStatus.ACCEPTED) {
      if (team.members.length >= team.maxMembers) {
        throw new ConflictException('This team has reached maximum capacity');
      }

      // Add applicant as team MEMBER
      await this.prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId: request.userId,
          role: TeamRole.MEMBER,
        },
      });

      // Update request status
      await this.prisma.teamJoinRequest.update({
        where: { id: requestId },
        data: { status: TeamRequestStatus.ACCEPTED, respondedAt: new Date() },
      });

      // If team hits maximum members, close the team
      if (team.members.length + 1 >= team.maxMembers) {
        await this.prisma.team.update({
          where: { id: team.id },
          data: { isOpen: false },
        });
      }

      // Notify applicant
      await this.notificationsService.createNotification({
        userId: request.userId,
        type: NotificationType.TEAM_REQUEST_ACCEPTED,
        title: 'Team Request Accepted! 🎉',
        message: `You were accepted into team "${team.name}". Check your squad roster now!`,
        linkUrl: `/teams?teamId=${team.id}`,
      });

      return { success: true, status: TeamRequestStatus.ACCEPTED };
    }

    if (status === TeamRequestStatus.REJECTED) {
      await this.prisma.teamJoinRequest.update({
        where: { id: requestId },
        data: { status: TeamRequestStatus.REJECTED, respondedAt: new Date() },
      });

      // Notify applicant
      await this.notificationsService.createNotification({
        userId: request.userId,
        type: NotificationType.TEAM_REQUEST_REJECTED,
        title: 'Team Request Declined',
        message: `Your request to join "${team.name}" was not accepted. Keep looking for squads!`,
        linkUrl: '/teams',
      });

      return { success: true, status: TeamRequestStatus.REJECTED };
    }
  }

  async cancelRequest(requestId: string, userId: string) {
    const request = await this.prisma.teamJoinRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Join request not found');
    }

    if (request.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own join requests');
    }

    await this.prisma.teamJoinRequest.update({
      where: { id: requestId },
      data: { status: TeamRequestStatus.CANCELLED, respondedAt: new Date() },
    });

    return { success: true, message: 'Join request cancelled' };
  }

  async leaveOrRemoveMember(teamId: string, memberUserId: string, callerId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const member = team.members.find((m) => m.userId === memberUserId);
    if (!member) {
      throw new NotFoundException('User is not a member of this team');
    }

    // Permission check:
    // If callerId === memberUserId: Self leaving
    // If callerId !== memberUserId: Caller must be LEADER
    const isSelfLeaving = callerId === memberUserId;
    const isLeader =
      team.creatorId === callerId ||
      team.members.some((m) => m.userId === callerId && m.role === TeamRole.LEADER);

    if (!isSelfLeaving && !isLeader) {
      throw new ForbiddenException('Only team leaders can remove other members');
    }

    // Prevent team creator/sole leader from leaving if other members remain without leadership
    if (isSelfLeaving && member.role === TeamRole.LEADER && team.members.length > 1) {
      // Promote the next oldest member to LEADER
      const nextLeader = team.members.find((m) => m.userId !== memberUserId);
      if (nextLeader) {
        await this.prisma.teamMember.update({
          where: { id: nextLeader.id },
          data: { role: TeamRole.LEADER },
        });
      }
    }

    await this.prisma.teamMember.delete({
      where: { id: member.id },
    });

    // Reopen team if it was full
    if (!team.isOpen) {
      await this.prisma.team.update({
        where: { id: teamId },
        data: { isOpen: true },
      });
    }

    return {
      success: true,
      message: isSelfLeaving ? 'You left the team' : 'Member removed from team',
    };
  }
}
