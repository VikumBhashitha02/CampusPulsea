import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { RequestVerificationDto } from './dto/request-verification.dto';
import { VerificationStatus } from '@campuspulse/types';

@Injectable()
export class VerificationService {
  constructor(private readonly prisma: PrismaService) {}

  async submitRequest(userId: string, dto: RequestVerificationDto) {
    const org = await this.prisma.organization.findUnique({
      where: { id: dto.organizationId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return this.prisma.verification.create({
      data: {
        organizationId: dto.organizationId,
        requestedById: userId,
        documentUrl: dto.documentUrl,
        notes: dto.notes,
        status: VerificationStatus.PENDING,
      },
    });
  }

  async getStatus(organizationId: string) {
    const verification = await this.prisma.verification.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        organization: { select: { id: true, name: true, isVerified: true } },
      },
    });

    if (!verification) {
      return { status: 'UNVERIFIED', message: 'No verification requests submitted yet' };
    }

    return verification;
  }
}
