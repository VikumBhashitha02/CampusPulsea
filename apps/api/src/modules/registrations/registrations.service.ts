import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateRegistrationDto } from './dto/create-registration.dto';
import { RegistrationStatus } from '@campuspulse/types';

@Injectable()
export class RegistrationsService {
  constructor(private readonly prisma: PrismaService) {}

  async register(userId: string, dto: CreateRegistrationDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const existing = await this.prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: { eventId: dto.eventId, userId },
      },
    });

    if (existing) {
      throw new ConflictException('You have already registered for this event');
    }

    return this.prisma.eventRegistration.create({
      data: {
        eventId: dto.eventId,
        userId,
        notes: dto.notes,
        status: RegistrationStatus.REGISTERED,
      },
      include: {
        event: { select: { id: true, title: true, slug: true, startDate: true } },
      },
    });
  }

  async findUserRegistrations(userId: string) {
    return this.prisma.eventRegistration.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            startDate: true,
            endDate: true,
            venue: true,
            mode: true,
            organization: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { registeredAt: 'desc' },
    });
  }

  async cancel(userId: string, registrationId: string) {
    const reg = await this.prisma.eventRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!reg || reg.userId !== userId) {
      throw new NotFoundException('Registration record not found');
    }

    return this.prisma.eventRegistration.update({
      where: { id: registrationId },
      data: { status: RegistrationStatus.CANCELLED },
    });
  }
}
