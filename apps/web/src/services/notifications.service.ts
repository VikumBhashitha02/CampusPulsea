import { apiClient } from '../lib/api/client';
import { NotificationType } from '@campuspulse/types';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType | string;
  title: string;
  message: string;
  isRead: boolean;
  linkUrl?: string | null;
  createdAt: string;
}

export interface NotificationFeedResponse {
  items: NotificationItem[];
  unreadCount: number;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const notificationsService = {
  /**
   * Fetches the user's notification feed.
   */
  async getNotifications(params?: {
    type?: NotificationType | string;
    isRead?: boolean;
    page?: number;
    limit?: number;
  }): Promise<NotificationFeedResponse> {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.isRead !== undefined) query.append('isRead', params.isRead.toString());
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await apiClient<NotificationFeedResponse>(`/notifications${queryString}`);

    return {
      items: Array.isArray(res?.items) ? res.items : [],
      unreadCount: typeof res?.unreadCount === 'number' ? res.unreadCount : 0,
      meta: res?.meta,
    };
  },

  /**
   * Fetches the unread notification count.
   */
  async getUnreadCount(): Promise<number> {
    const res = await apiClient<{ unreadCount: number }>('/notifications/unread-count');
    return typeof res?.unreadCount === 'number' ? res.unreadCount : 0;
  },

  /**
   * Marks a single notification as read.
   */
  async markAsRead(id: string): Promise<void> {
    await apiClient(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  /**
   * Marks all user notifications as read.
   */
  async markAllAsRead(): Promise<void> {
    await apiClient('/notifications/read-all', {
      method: 'PATCH',
    });
  },
};
