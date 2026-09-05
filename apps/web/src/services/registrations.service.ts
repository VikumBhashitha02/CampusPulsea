import { apiClient } from '../lib/api/client';

export type RegistrationStatus =
  | 'REGISTERED'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'PENDING'
  | 'WAITLISTED'
  | 'ATTENDED'
  | 'REJECTED';

export interface EventRegistrationItem {
  id: string;
  eventId: string;
  userId: string;
  registeredAt: string;
  status: RegistrationStatus | string;
  notes?: string | null;
  event: {
    id: string;
    title: string;
    slug: string;
    startDate?: string | null;
    endDate?: string | null;
    venue?: string | null;
    mode?: string | null;
    organization?: {
      name: string;
      slug: string;
    } | null;
  };
}

export interface CreateRegistrationDto {
  eventId: string;
  notes?: string;
}

export const registrationsService = {
  /**
   * Registers current authenticated student for an event / opportunity.
   */
  async register(dto: CreateRegistrationDto): Promise<EventRegistrationItem> {
    return apiClient<EventRegistrationItem>('/registrations', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  /**
   * Fetches all registrations for the current authenticated student.
   */
  async getMyRegistrations(): Promise<EventRegistrationItem[]> {
    const res = await apiClient<EventRegistrationItem[]>('/registrations/my');
    return Array.isArray(res) ? res : [];
  },

  /**
   * Cancels a personal event registration.
   */
  async cancelRegistration(registrationId: string): Promise<any> {
    return apiClient<any>(`/registrations/${registrationId}`, {
      method: 'DELETE',
    });
  },
};
