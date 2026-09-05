import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType } from '@campuspulse/types';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string;
}

export interface PushNotificationPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

/**
 * Extensible push notification dispatcher interface.
 * When Firebase Cloud Messaging (FCM), APNs, or WebPush is introduced,
 * an implementation of this interface can be injected without altering core domain logic.
 */
export interface PushNotificationDispatcher {
  sendPush(payload: PushNotificationPayload): Promise<boolean>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  // Default pluggable dispatcher stub (extensible for mobile & web push in future phases)
  private pushDispatcher: PushNotificationDispatcher = {
    sendPush: async (payload: PushNotificationPayload) => {
      // Prepared stub: Logs push dispatch intent for future mobile Expo/FCM integration
      this.logger.debug(
        `[PushDispatcher Stub] Prepared push notification for user "${payload.userId}": "${payload.title}"`,
      );
      return true;
    },
  };

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Set custom push notification dispatcher (for future FCM / WebPush integration)
   */
  setPushDispatcher(dispatcher: PushNotificationDispatcher) {
    this.pushDispatcher = dispatcher;
  }

  async createNotification(dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type as any,
        title: dto.title,
        message: dto.message,
        linkUrl: dto.linkUrl,
        isRead: false,
      },
    });

    // Invoke push notification stub asynchronously
    this.pushDispatcher
      .sendPush({
        userId: dto.userId,
        title: dto.title,
        body: dto.message,
        data: {
          notificationId: notification.id,
          type: dto.type,
          linkUrl: dto.linkUrl,
        },
      })
      .catch((err) => {
        this.logger.warn(`Push dispatch failed: ${err.message}`);
      });

    return notification;
  }

  async findForUser(
    userId: string,
    query?: { type?: NotificationType; isRead?: boolean; page?: number; limit?: number },
  ) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (query?.type) where.type = query.type;
    if (query?.isRead !== undefined) where.isRead = query.isRead;

    const [items, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      items,
      unreadCount,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getUnreadCount(userId: string): Promise<{ unreadCount: number }> {
    const unreadCount = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { unreadCount };
  }

  async markAsRead(id: string, userId: string) {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
    return { id, isRead: true, message: 'Notification marked as read' };
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return {
      updatedCount: result.count,
      message: 'All notifications marked as read',
    };
  }
}
