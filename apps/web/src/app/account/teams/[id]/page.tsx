'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Users,
  Trophy,
  ArrowLeft,
  CheckCircle2,
  Clock,
  UserPlus,
  LogOut,
  AlertCircle,
  UserX,
} from 'lucide-react';
import { useAuth } from '../../../../lib/auth/auth-context';
import { teamsService } from '../../../../services/teams.service';
import { TeamRole, TeamRequestStatus } from '@campuspulse/types';
import type { TeamData } from '@campuspulse/types';
import { JoinTeamModal } from '../../../../components/teams/join-team-modal';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params?.id as string;

  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & Action States
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/login?redirect=/account/teams/${teamId}`);
    }
  }, [authLoading, isAuthenticated, router, teamId]);

  const loadTeam = useCallback(async () => {
    if (!teamId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await teamsService.getTeamById(teamId);
      setTeam(data);
    } catch (err: any) {
      console.error('Failed to load team details:', err);
      setError(err.message || 'Squad not found or access denied.');
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    if (isAuthenticated) {
      loadTeam();
    }
  }, [isAuthenticated, loadTeam]);

  // Derived user status in this team
  const currentMember = useMemo(() => {
    if (!team || !user) return null;
    return team.members?.find((m) => m.userId === user.id) || null;
  }, [team, user]);

  const isLeader = useMemo(() => {
    if (!team || !user) return false;
    return (
      team.creatorId === user.id ||
      team.members?.some((m) => m.userId === user.id && m.role === TeamRole.LEADER)
    );
  }, [team, user]);

  const myPendingRequest = useMemo(() => {
    if (!team || !user) return null;
    return (
      team.joinRequests?.find(
        (r) => r.userId === user.id && r.status === TeamRequestStatus.PENDING,
      ) || null
    );
  }, [team, user]);

  const memberCount = team?.members?.length || 1;
  const maxMembers = team?.maxMembers || 4;
  const remainingSlots = Math.max(0, maxMembers - memberCount);
  const isFull = memberCount >= maxMembers || !team?.isOpen;

  // Handler: Leader responds to join request
  const handleRespondRequest = async (
    requestId: string,
    status: TeamRequestStatus.ACCEPTED | TeamRequestStatus.REJECTED,
  ) => {
    setActionLoading(true);
    setActionMessage(null);
    try {
      await teamsService.respondToRequest(requestId, status);
      setActionMessage({
        type: 'success',
        text:
          status === TeamRequestStatus.ACCEPTED
            ? 'Applicant accepted into team!'
            : 'Join request declined.',
      });
      await loadTeam();
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.message || 'Failed to respond to request.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Cancel own request
  const handleCancelMyRequest = async () => {
    if (!myPendingRequest) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      await teamsService.cancelRequest(myPendingRequest.id);
      setActionMessage({ type: 'success', text: 'Join request cancelled.' });
      await loadTeam();
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.message || 'Failed to cancel request.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Leave Team
  const handleLeaveTeam = async () => {
    if (!user || !confirm('Are you sure you want to leave this squad?')) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      await teamsService.leaveOrRemoveMember(teamId, user.id);
      router.push('/account/teams');
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.message || 'Failed to leave squad.',
      });
      setActionLoading(false);
    }
  };

  // Handler: Remove Member (Leader only)
  const handleRemoveMember = async (memberUserId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the squad?`))
      return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      await teamsService.leaveOrRemoveMember(teamId, memberUserId);
      setActionMessage({
        type: 'success',
        text: `${memberName} has been removed from the team.`,
      });
      await loadTeam();
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.message || 'Failed to remove member.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center p-6 text-xs text-cp-muted">
          <div className="w-4 h-4 rounded-full border-2 border-cp-yellow border-t-transparent animate-spin mr-2" />
          <span>Loading squad details...</span>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 section-container py-8 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/account/teams"
            className="inline-flex items-center gap-2 text-xs font-bold text-cp-muted hover:text-cp-navy transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Team Finder</span>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="h-44 bg-cp-surface rounded-2xl border border-cp-border animate-pulse p-6" />
            <div className="h-64 bg-cp-surface rounded-2xl border border-cp-border animate-pulse p-6" />
          </div>
        ) : error || !team ? (
          <div className="p-8 rounded-2xl bg-cp-surface border border-cp-border text-center space-y-4 max-w-md mx-auto my-12 shadow-xs">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-cp-navy">Squad Not Found</h3>
              <p className="text-xs text-cp-muted">{error || 'This squad does not exist.'}</p>
            </div>
            <Link
              href="/account/teams"
              className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-2"
            >
              <span>Return to Team Finder</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Feedback Alert */}
            {actionMessage && (
              <div
                className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  actionMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {actionMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{actionMessage.text}</span>
              </div>
            )}

            {/* Team Overview Card */}
            <Card className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isFull ? (
                      <Badge tone="neutral">
                        Team Full ({memberCount}/{maxMembers})
                      </Badge>
                    ) : (
                      <Badge tone="success" className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{remainingSlots} {remainingSlots === 1 ? 'Spot Available' : 'Spots Available'}</span>
                      </Badge>
                    )}

                    {currentMember && (
                      <Badge tone="accent">
                        {isLeader ? 'Leader' : 'Member'}
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-page-title text-cp-navy">
                    {team.name}
                  </h1>

                  {team.event && (
                    <Link
                      href={`/events/${team.event.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:underline"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-600" />
                      <span>{team.event.title}</span>
                    </Link>
                  )}
                </div>

                {/* Team Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {!currentMember && !myPendingRequest && !isFull && (
                    <Button
                      size="sm"
                      onClick={() => setIsJoinModalOpen(true)}
                      className="inline-flex items-center gap-1.5"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Request to Join Squad</span>
                    </Button>
                  )}

                  {!currentMember && myPendingRequest && (
                    <button
                      type="button"
                      onClick={handleCancelMyRequest}
                      disabled={actionLoading}
                      className="px-3.5 py-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors"
                    >
                      {actionLoading ? 'Cancelling...' : 'Cancel Pending Request'}
                    </button>
                  )}

                  {currentMember && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLeaveTeam}
                      disabled={actionLoading}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Leave Squad</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Description */}
              {team.description && (
                <div className="p-4 rounded-xl bg-cp-bg border border-cp-border text-xs text-cp-navy leading-relaxed">
                  <p className="font-bold text-cp-muted text-[10px] uppercase tracking-wider mb-1">
                    Squad Mission & Goals:
                  </p>
                  <p>{team.description}</p>
                </div>
              )}

              {/* Roles & Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {team.requiredRoles && team.requiredRoles.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-cp-muted">
                      Seeking Roles
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {team.requiredRoles.map((role) => (
                        <Badge key={role} tone="neutral">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {team.requiredSkills && team.requiredSkills.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-cp-muted">
                      Required Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {team.requiredSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Active Members Roster */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-cp-border">
                <h3 className="text-sm font-extrabold text-cp-navy uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-cp-yellow" />
                  <span>Squad Roster ({memberCount} / {maxMembers})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {team.members?.map((member) => {
                  const isThisLeader = member.role === TeamRole.LEADER;
                  const canRemove = isLeader && member.userId !== user?.id;

                  return (
                    <Card
                      key={member.id}
                      className="p-4 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cp-navy text-cp-yellow flex items-center justify-center font-extrabold text-sm shrink-0">
                          {member.user?.name?.charAt(0) || 'U'}
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-cp-navy">
                              {member.user?.name || 'Student Member'}
                            </h4>
                            {isThisLeader ? (
                              <Badge tone="accent">
                                LEADER
                              </Badge>
                            ) : (
                              <Badge tone="neutral">
                                MEMBER
                              </Badge>
                            )}
                          </div>

                          <p className="text-[11px] text-cp-muted">
                            Joined on {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {canRemove && (
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveMember(
                              member.userId,
                              member.user?.name || 'Member',
                            )
                          }
                          disabled={actionLoading}
                          title="Remove from squad"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Leader Section: Pending Join Requests */}
            {isLeader && team.joinRequests && team.joinRequests.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-cp-border">
                <div className="flex items-center justify-between pb-2 border-b border-cp-border">
                  <h3 className="text-sm font-extrabold text-cp-navy uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Pending Join Requests ({team.joinRequests.length})</span>
                  </h3>
                </div>

                <div className="space-y-3">
                  {team.joinRequests.map((req) => (
                    <Card
                      key={req.id}
                      className="p-4 border-amber-200 bg-amber-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-cp-navy">
                            {req.user?.name || 'Applicant'}
                          </h4>
                          <span className="text-[11px] text-cp-muted">
                            Applied on {new Date(req.requestedAt).toLocaleDateString()}
                          </span>
                        </div>

                        {req.message && (
                          <p className="text-xs text-cp-muted leading-relaxed">
                            "{req.message}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            handleRespondRequest(req.id, TeamRequestStatus.REJECTED)
                          }
                          disabled={actionLoading || isFull}
                        >
                          Decline
                        </Button>

                        <Button
                          size="sm"
                          onClick={() =>
                            handleRespondRequest(req.id, TeamRequestStatus.ACCEPTED)
                          }
                          disabled={actionLoading || isFull}
                          className="inline-flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Join Request Modal */}
      <JoinTeamModal
        isOpen={isJoinModalOpen}
        team={team}
        onClose={() => setIsJoinModalOpen(false)}
        onRequested={() => {
          loadTeam();
          setActionMessage({
            type: 'success',
            text: 'Join request sent to the team leader!',
          });
        }}
      />
    </div>
  );
}
