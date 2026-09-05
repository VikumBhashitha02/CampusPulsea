'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Trophy,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import type { TeamData } from '@campuspulse/types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface TeamCardProps {
  team: TeamData;
  currentUserId?: string;
  onRequestJoin?: (team: TeamData) => void;
  hasPendingRequest?: boolean;
  isMember?: boolean;
}

export function TeamCard({
  team,
  currentUserId,
  onRequestJoin,
  hasPendingRequest = false,
  isMember = false,
}: TeamCardProps) {
  const memberCount = team.members?.length || team._count?.members || 1;
  const maxMembers = team.maxMembers || 4;
  const remainingSlots = Math.max(0, maxMembers - memberCount);
  const isFull = memberCount >= maxMembers || !team.isOpen;
  const isLeader =
    currentUserId &&
    (team.creatorId === currentUserId ||
      team.members?.some((m) => m.userId === currentUserId && m.role === 'LEADER'));

  return (
    <Card hover className="p-5 flex flex-col justify-between space-y-4">
      {/* Top Meta */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isFull ? (
              <Badge tone="neutral">Team Full</Badge>
            ) : (
              <Badge tone="success" className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{remainingSlots} {remainingSlots === 1 ? 'spot' : 'spots'} available</span>
              </Badge>
            )}

            {isMember && (
              <Badge tone="accent" className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{isLeader ? 'Leader' : 'Joined'}</span>
              </Badge>
            )}

            {hasPendingRequest && (
              <Badge tone="warning">Pending Review</Badge>
            )}
          </div>

          <span className="text-xs font-semibold text-cp-muted flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{memberCount}/{maxMembers}</span>
          </span>
        </div>

        {/* Team Name */}
        <div>
          <Link
            href={`/account/teams/${team.id}`}
            className="text-base font-bold text-cp-navy hover:text-cp-accent transition-colors line-clamp-1"
          >
            {team.name}
          </Link>

          {/* Opportunity Link */}
          {team.event && (
            <Link
              href={`/events/${team.event.slug}`}
              className="text-xs text-amber-800 hover:underline font-semibold flex items-center gap-1 mt-1 line-clamp-1"
            >
              <Trophy className="w-3 h-3 shrink-0 text-amber-600" />
              <span>{team.event.title}</span>
            </Link>
          )}
        </div>

        {/* Description */}
        {team.description && (
          <p className="text-xs text-cp-muted line-clamp-2 leading-relaxed">
            {team.description}
          </p>
        )}
      </div>

      {/* Skills & Roles Chips */}
      <div className="space-y-2.5 pt-3 border-t border-cp-border">
        {team.requiredRoles && team.requiredRoles.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cp-muted">
              Seeking Roles:
            </span>
            <div className="flex flex-wrap gap-1">
              {team.requiredRoles.map((role) => (
                <Badge key={role} tone="neutral" className="text-[10px] font-medium">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {team.requiredSkills && team.requiredSkills.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cp-muted">
              Skills:
            </span>
            <div className="flex flex-wrap gap-1">
              {team.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-cp-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-cp-muted">
          <span className="text-[11px]">Leader:</span>
          <strong className="text-cp-navy font-semibold">
            {team.creator?.name || 'Organizer'}
          </strong>
        </div>

        <div className="flex items-center gap-2">
          {!isMember && !isFull && !hasPendingRequest && onRequestJoin && (
            <Button
              size="sm"
              onClick={() => onRequestJoin(team)}
              className="py-1 px-3 text-xs"
            >
              <span>Join</span>
            </Button>
          )}

          <Link
            href={`/account/teams/${team.id}`}
            className="btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1"
          >
            <span>View</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
