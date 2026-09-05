'use client';

import React, { useState } from 'react';
import { X, Send, AlertCircle, Trophy, Users } from 'lucide-react';
import { teamsService } from '../../services/teams.service';
import type { TeamData } from '@campuspulse/types';

interface JoinTeamModalProps {
  isOpen: boolean;
  team: TeamData | null;
  onClose: () => void;
  onRequested: (teamId: string) => void;
}

export function JoinTeamModal({
  isOpen,
  team,
  onClose,
  onRequested,
}: JoinTeamModalProps) {
  const [message, setMessage] = useState('');
  const [preferredRole, setPreferredRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !team) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await teamsService.requestToJoin(
        team.id,
        message.trim() || undefined,
        preferredRole.trim() || undefined,
      );
      onRequested(team.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit join request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50 duration-100">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl max-w-md w-full p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
          <div className="space-y-0.5">
            <h3 className="text-base font-extrabold text-[#222730]">
              Request to Join Squad
            </h3>
            <p className="text-xs text-[#64748B]">
              Send an application to the team leader.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#222730] hover:bg-[#F8FAFC] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Team Card Summary */}
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-1">
          <h4 className="text-xs font-bold text-[#222730]">{team.name}</h4>
          {team.event && (
            <p className="text-[11px] text-[#B45309] flex items-center gap-1 font-semibold">
              <Trophy className="w-3 h-3" />
              <span>{team.event.title}</span>
            </p>
          )}
          <p className="text-[11px] text-[#64748B] flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>Leader: {team.creator?.name || 'Organizer'}</span>
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Preferred Role */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#222730]">
              Your Preferred Role (Optional)
            </label>
            {team.requiredRoles && team.requiredRoles.length > 0 ? (
              <select
                value={preferredRole}
                onChange={(e) => setPreferredRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#222730] focus:outline-hidden focus:border-[#FEB703] transition-colors"
              >
                <option value="">Select a seeking role...</option>
                {team.requiredRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={preferredRole}
                onChange={(e) => setPreferredRole(e.target.value)}
                placeholder="e.g., Frontend Developer, Data Analyst"
                className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#222730] focus:outline-hidden focus:border-[#FEB703] transition-colors"
              />
            )}
          </div>

          {/* Intro Message */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#222730]">
              Short Pitch / Message
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce your relevant experience, skills, and why you'd like to join this squad..."
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#222730] focus:outline-hidden focus:border-[#FEB703] transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs py-2 px-5 shadow-xs inline-flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Sending...' : 'Send Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
