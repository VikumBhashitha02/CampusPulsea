import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}

  async toggle(userId: string, eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const existing = await this.prisma.eventBookmark.findUnique({
      where: {
        eventId_userId: { eventId, userId },
      },
    });

    if (existing) {
      await this.prisma.eventBookmark.delete({
        where: { id: existing.id },
      });
      return { bookmarked: false, message: 'Bookmark removed' };
    }

    await this.prisma.eventBookmark.create({
      data: { eventId, userId },
    });
    return { bookmarked: true, message: 'Opportunity saved to bookmarks' };
  }

  async findUserBookmarks(userId: string) {
    const bookmarks = await this.prisma.eventBookmark.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            organization: { select: { name: true, slug: true, logoUrl: true } },
            category: { select: { name: true, slug: true, icon: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookmarks.map((b) => b.event);
  }
}
