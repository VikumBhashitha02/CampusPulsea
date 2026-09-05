import { apiClient } from '../lib/api/client';
import type { TeamRole, TeamRequestStatus, TeamData, TeamJoinRequestData } from '@campuspulse/types';

export interface CreateTeamPayload {
  eventId?: string;
  name: string;
  description?: string;
  maxMembers?: number;
  requiredRoles?: string[];
  requiredSkills?: string[];
}

export interface MyTeamsResponse {
  joinedTeams: (TeamData & { role?: TeamRole; joinedAt?: string })[];
  createdTeams: (TeamData & {
    joinRequests?: TeamJoinRequestData[];
    _count?: { members: number; joinRequests: number };
  })[];
  pendingRequests: (TeamJoinRequestData & {
    team?: TeamData & { _count?: { members: number } };
  })[];
}

export const teamsService = {
  /**
   * Fetches open teams with optional event, skill, role, or open status filter.
   */
  async getTeams(params?: {
    eventId?: string;
    skill?: string;
    role?: string;
    isOpen?: boolean;
  }): Promise<TeamData[]> {
    const query = new URLSearchParams();
    if (params?.eventId) query.append('eventId', params.eventId);
    if (params?.skill) query.append('skill', params.skill);
    if (params?.role) query.append('role', params.role);
    if (params?.isOpen !== undefined) query.append('isOpen', params.isOpen.toString());

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await apiClient<TeamData[]>(`/teams${queryString}`);
    return Array.isArray(res) ? res : [];
  },

  /**
   * Fetches the current authenticated user's joined teams, created teams, and pending requests.
   */
  async getMyTeams(): Promise<MyTeamsResponse> {
    const res = await apiClient<MyTeamsResponse>('/teams/my');
    return {
      joinedTeams: Array.isArray(res?.joinedTeams) ? res.joinedTeams : [],
      createdTeams: Array.isArray(res?.createdTeams) ? res.createdTeams : [],
      pendingRequests: Array.isArray(res?.pendingRequests) ? res.pendingRequests : [],
    };
  },

  /**
   * Fetches a specific team by ID, including members and pending join requests (for leader).
   */
  async getTeamById(id: string): Promise<TeamData> {
    return apiClient<TeamData>(`/teams/${id}`);
  },

  /**
   * Creates a new squad/team.
   */
  async createTeam(data: CreateTeamPayload): Promise<TeamData> {
    return apiClient<TeamData>('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Submits a request to join a team.
   */
  async requestToJoin(
    teamId: string,
    message?: string,
    preferredRole?: string,
  ): Promise<TeamJoinRequestData> {
    return apiClient<TeamJoinRequestData>(`/teams/${teamId}/join`, {
      method: 'POST',
      body: JSON.stringify({ message, preferredRole }),
    });
  },

  /**
   * Responds to a join request (ACCEPT or REJECT). Leaders only.
   */
  async respondToRequest(
    requestId: string,
    status: TeamRequestStatus.ACCEPTED | TeamRequestStatus.REJECTED,
  ): Promise<{ success: boolean; status: TeamRequestStatus }> {
    return apiClient<{ success: boolean; status: TeamRequestStatus }>(
      `/teams/requests/${requestId}/respond`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
    );
  },

  /**
   * Cancels a pending join request submitted by the caller.
   */
  async cancelRequest(requestId: string): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>(
      `/teams/requests/${requestId}/cancel`,
      {
        method: 'DELETE',
      },
    );
  },

  /**
   * Leaves a team or removes a member (Leaders only for other members).
   */
  async leaveOrRemoveMember(
    teamId: string,
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>(
      `/teams/${teamId}/members/${userId}`,
      {
        method: 'DELETE',
      },
    );
  },
};
