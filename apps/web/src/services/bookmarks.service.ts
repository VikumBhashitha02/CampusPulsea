import { apiClient } from '../lib/api/client';
import type { EventItem } from './events.service';

export interface ToggleBookmarkResponse {
  bookmarked: boolean;
  message: string;
}

export const bookmarksService = {
  /**
   * Toggles bookmark state for an event for the current authenticated student.
   */
  async toggleBookmark(eventId: string): Promise<ToggleBookmarkResponse> {
    return apiClient<ToggleBookmarkResponse>('/bookmarks/toggle', {
      method: 'POST',
      body: JSON.stringify({ eventId }),
    });
  },

  /**
   * Fetches all events bookmarked by the current authenticated student.
   */
  async getMyBookmarks(): Promise<EventItem[]> {
    const res = await apiClient<EventItem[]>('/bookmarks/my');
    return Array.isArray(res) ? res : [];
  },
};
