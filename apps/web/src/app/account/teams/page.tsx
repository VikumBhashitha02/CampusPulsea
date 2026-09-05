'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Users,
  PlusCircle,
  Trophy,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../../lib/auth/auth-context';
import { teamsService } from '../../../services/teams.service';
import type { MyTeamsResponse } from '../../../services/teams.service';
import { eventsService } from '../../../services/events.service';
import type { EventItem } from '../../../services/events.service';
import type { TeamData } from '@campuspulse/types';
import { TeamCard } from '../../../components/teams/team-card';
import { CreateTeamModal } from '../../../components/teams/create-team-modal';
import { JoinTeamModal } from '../../../components/teams/join-team-modal';
import { PageHeader } from '../../../components/ui/page-header';
import { Button } from '../../../components/ui/button';

function TeamFinderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlEventId = searchParams.get('event') || searchParams.get('eventId') || '';
  const urlCreate = searchParams.get('create') === 'true';

  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'MY_TEAMS' | 'FIND_TEAMS'>('FIND_TEAMS');

  const [selectedEventId, setSelectedEventId] = useState(urlEventId);
  const [searchSkill, setSearchSkill] = useState('');
  const [searchRole, setSearchRole] = useState('');
  const [isOpenOnly, setIsOpenOnly] = useState(true);

  const [teams, setTeams] = useState<TeamData[]>([]);
  const [myTeamsData, setMyTeamsData] = useState<MyTeamsResponse>({
    joinedTeams: [],
    createdTeams: [],
    pendingRequests: [],
  });
  const [events, setEvents] = useState<EventItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(urlCreate);
  const [joinModalTeam, setJoinModalTeam] = useState<TeamData | null>(null);
  const [cancellingRequestId, setCancellingRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(
        `/login?redirect=/account/teams${urlEventId ? `?eventId=${urlEventId}` : ''}`,
      );
    }
  }, [authLoading, isAuthenticated, router, urlEventId]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [allTeams, myTeams, eventsRes] = await Promise.all([
        teamsService.getTeams({
          eventId: selectedEventId || undefined,
          skill: searchSkill.trim() || undefined,
          role: searchRole.trim() || undefined,
          isOpen: isOpenOnly ? true : undefined,
        }).catch(() => []),
        teamsService.getMyTeams().catch(() => ({
          joinedTeams: [],
          createdTeams: [],
          pendingRequests: [],
        })),
        eventsService.getEvents({ limit: 50 }).catch(() => ({ items: [] })),
      ]);

      setTeams(allTeams);
      setMyTeamsData(myTeams);
      setEvents(eventsRes.items);
    } catch (err: any) {
      console.error('Failed to load team finder data:', err);
      setError('Unable to load squads. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedEventId, searchSkill, searchRole, isOpenOnly]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  const myTeamIds = useMemo(() => {
    const ids = new Set<string>();
    myTeamsData.joinedTeams.forEach((t) => ids.add(t.id));
    myTeamsData.createdTeams.forEach((t) => ids.add(t.id));
    return ids;
  }, [myTeamsData]);

  const pendingRequestTeamIds = useMemo(() => {
    const ids = new Set<string>();
    myTeamsData.pendingRequests.forEach((r) => ids.add(r.teamId));
    return ids;
  }, [myTeamsData]);

  const handleCancelRequest = async (requestId: string) => {
    setCancellingRequestId(requestId);
    try {
      await teamsService.cancelRequest(requestId);
      setMyTeamsData((prev) => ({
        ...prev,
        pendingRequests: prev.pendingRequests.filter((r) => r.id !== requestId),
      }));
    } catch (err) {
      console.error('Failed to cancel request:', err);
    } finally {
      setCancellingRequestId(null);
    }
  };

  const handleTeamCreated = (_newTeam: TeamData) => {
    loadData();
    setActiveTab('MY_TEAMS');
  };

  const handleJoinRequested = () => {
    loadData();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center p-6 text-xs text-cp-muted">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-cp-yellow border-t-transparent animate-spin" />
            <span>Loading Team Finder...</span>
          </div>
        </main>
      </div>
    );
  }

  const totalMyTeams = myTeamsData.joinedTeams.length + myTeamsData.createdTeams.length;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 section-container py-8 space-y-8">
        <div>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-xs font-bold text-cp-muted hover:text-cp-navy transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Account</span>
          </Link>
        </div>

        <PageHeader
          title="Team Finder"
          description="Find teammates, create teams, and join opportunities together."
          eyebrow="Campus Squads"
          actions={
            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
              <PlusCircle className="w-4 h-4" />
              <span>Create Team</span>
            </Button>
          }
        />

        <div className="flex items-center justify-between border-b border-cp-border pb-3 gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('FIND_TEAMS')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'FIND_TEAMS'
                  ? 'bg-cp-navy text-cp-yellow shadow-xs'
                  : 'bg-cp-surface text-cp-muted hover:text-cp-navy border border-cp-border'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Open Squads ({teams.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('MY_TEAMS')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'MY_TEAMS'
                  ? 'bg-cp-navy text-cp-yellow shadow-xs'
                  : 'bg-cp-surface text-cp-muted hover:text-cp-navy border border-cp-border'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>My Squads ({totalMyTeams})</span>
              {myTeamsData.pendingRequests.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-cp-yellow text-cp-navy">
                  {myTeamsData.pendingRequests.length}
                </span>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={loadData}
            title="Refresh Teams"
            className="p-2 rounded-lg border border-cp-border bg-cp-surface text-cp-muted hover:text-cp-navy transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 bg-cp-surface rounded-2xl border border-cp-border animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-cp-surface border border-cp-border text-center space-y-4 max-w-md mx-auto">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-cp-navy">Unable to Load Squads</h3>
              <p className="text-xs text-cp-muted">{error}</p>
            </div>
            <button
              type="button"
              onClick={loadData}
              className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        ) : activeTab === 'MY_TEAMS' ? (
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-cp-border">
                <h3 className="text-sm font-extrabold text-cp-navy uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cp-yellow" />
                  <span>Squads You Are Leading ({myTeamsData.createdTeams.length})</span>
                </h3>
              </div>

              {myTeamsData.createdTeams.length === 0 ? (
                <div className="p-6 bg-cp-surface rounded-2xl border border-cp-border text-center text-xs text-cp-muted">
                  You haven&apos;t created any competition teams yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myTeamsData.createdTeams.map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      currentUserId={user?.id}
                      isMember={true}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-cp-border">
                <h3 className="text-sm font-extrabold text-cp-navy uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Squads You Have Joined ({myTeamsData.joinedTeams.length})</span>
                </h3>
              </div>

              {myTeamsData.joinedTeams.length === 0 ? (
                <div className="p-6 bg-cp-surface rounded-2xl border border-cp-border text-center text-xs text-cp-muted">
                  You haven&apos;t joined other squads as a member yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myTeamsData.joinedTeams.map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      currentUserId={user?.id}
                      isMember={true}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-cp-border">
                <h3 className="text-sm font-extrabold text-cp-navy uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Pending Sent Join Requests ({myTeamsData.pendingRequests.length})</span>
                </h3>
              </div>

              {myTeamsData.pendingRequests.length === 0 ? (
                <div className="p-6 bg-cp-surface rounded-2xl border border-cp-border text-center text-xs text-cp-muted">
                  No pending join requests submitted.
                </div>
              ) : (
                <div className="space-y-3">
                  {myTeamsData.pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-xl bg-cp-surface border border-cp-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            PENDING REVIEW
                          </span>
                          <span className="text-xs text-cp-muted">
                            Sent on {new Date(req.requestedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-cp-navy">
                          {req.team?.name || 'Squad'}
                        </h4>
                        {req.team?.event && (
                          <p className="text-xs text-amber-800 flex items-center gap-1 font-semibold">
                            <Trophy className="w-3 h-3" />
                            <span>{req.team.event.title}</span>
                          </p>
                        )}
                        {req.message && (
                          <p className="text-xs text-cp-muted italic">"{req.message}"</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleCancelRequest(req.id)}
                          disabled={cancellingRequestId === req.id}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors"
                        >
                          {cancellingRequestId === req.id ? 'Cancelling...' : 'Cancel Request'}
                        </button>
                        {req.team?.id && (
                          <Link
                            href={`/account/teams/${req.team.id}`}
                            className="btn-secondary text-xs py-1.5 px-3"
                          >
                            View Squad
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-cp-surface border border-cp-border space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-cp-navy">Competition / Event</label>
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-cp-border bg-cp-bg text-cp-navy focus:outline-none focus:border-cp-yellow"
                  >
                    <option value="">All Competitions</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-cp-navy">Seeking Role</label>
                  <input
                    type="text"
                    value={searchRole}
                    onChange={(e) => setSearchRole(e.target.value)}
                    placeholder="e.g., UI Designer, Lead"
                    className="w-full px-3 py-2 rounded-lg border border-cp-border bg-cp-bg text-cp-navy focus:outline-none focus:border-cp-yellow"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-cp-navy">Required Skill</label>
                  <input
                    type="text"
                    value={searchSkill}
                    onChange={(e) => setSearchSkill(e.target.value)}
                    placeholder="e.g., React, Python"
                    className="w-full px-3 py-2 rounded-lg border border-cp-border bg-cp-bg text-cp-navy focus:outline-none focus:border-cp-yellow"
                  />
                </div>

                <div className="flex items-end">
                  <label className="w-full flex items-center justify-between p-2 rounded-lg border border-cp-border bg-cp-bg cursor-pointer hover:border-cp-yellow">
                    <span className="font-bold text-cp-navy">Open Slots Only</span>
                    <input
                      type="checkbox"
                      checked={isOpenOnly}
                      onChange={(e) => setIsOpenOnly(e.target.checked)}
                      className="w-4 h-4 rounded border-cp-border text-cp-navy focus:ring-cp-yellow"
                    />
                  </label>
                </div>
              </div>
            </div>

            {teams.length === 0 ? (
              <div className="bg-cp-surface rounded-2xl border border-cp-border p-10 sm:p-14 text-center max-w-lg mx-auto space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-cp-yellow-light text-amber-800 flex items-center justify-center mx-auto">
                  <Users className="w-7 h-7 text-cp-yellow" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-cp-navy">
                    No matching squads found
                  </h3>
                  <p className="text-xs text-cp-muted max-w-sm mx-auto leading-relaxed">
                    Try adjusting your filters or be the first to create a team for this opportunity!
                  </p>
                </div>
                <div>
                  <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                    <PlusCircle className="w-4 h-4" />
                    <span>Create a Team</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    currentUserId={user?.id}
                    isMember={myTeamIds.has(team.id)}
                    hasPendingRequest={pendingRequestTeamIds.has(team.id)}
                    onRequestJoin={(t) => setJoinModalTeam(t)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <CreateTeamModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleTeamCreated}
        preselectedEventId={selectedEventId}
        events={events}
      />

      <JoinTeamModal
        isOpen={Boolean(joinModalTeam)}
        team={joinModalTeam}
        onClose={() => setJoinModalTeam(null)}
        onRequested={handleJoinRequested}
      />
    </div>
  );
}

export default function TeamFinderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-cp-yellow border-t-transparent animate-spin" />
        </div>
      }
    >
      <TeamFinderContent />
    </Suspense>
  );
}
