'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { teamsService } from '../../services/teams.service';
import type { EventItem } from '../../services/events.service';
import type { TeamData } from '@campuspulse/types';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (team: TeamData) => void;
  preselectedEventId?: string;
  events: EventItem[];
}

export function CreateTeamModal({
  isOpen,
  onClose,
  onCreated,
  preselectedEventId,
  events,
}: CreateTeamModalProps) {
  const [name, setName] = useState('');
  const [eventId, setEventId] = useState(preselectedEventId || '');
  const [description, setDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState(4);
  const [roleInput, setRoleInput] = useState('');
  const [requiredRoles, setRequiredRoles] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedEventId) {
      setEventId(preselectedEventId);
    }
  }, [preselectedEventId]);

  if (!isOpen) return null;

  const handleAddRole = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = roleInput.trim();
    if (trimmed && !requiredRoles.includes(trimmed)) {
      setRequiredRoles([...requiredRoles, trimmed]);
      setRoleInput('');
    }
  };

  const handleRemoveRole = (role: string) => {
    setRequiredRoles(requiredRoles.filter((r) => r !== role));
  };

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !requiredSkills.includes(trimmed)) {
      setRequiredSkills([...requiredSkills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a team name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const created = await teamsService.createTeam({
        name: name.trim(),
        eventId: eventId || undefined,
        description: description.trim() || undefined,
        maxMembers: Number(maxMembers) || 4,
        requiredRoles: requiredRoles.length > 0 ? requiredRoles : undefined,
        requiredSkills: requiredSkills.length > 0 ? requiredSkills : undefined,
      });

      onCreated(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50 duration-100">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
          <div className="space-y-0.5">
            <h3 className="text-lg font-extrabold text-[#222730]">Create Your Team</h3>
            <p className="text-xs text-[#64748B]">
              Build a squad for a competition or collaborative project.
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

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Team Name */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#222730]">
              Team Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., CodePulse Innovators"
              required
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#222730] focus:outline-hidden focus:border-[#FEB703] transition-colors"
            />
          </div>

          {/* Associated Event */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#222730]">
              Associated Competition / Opportunity
            </label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#222730] focus:outline-hidden focus:border-[#FEB703] transition-colors"
            >
              <option value="">General Project / Open Squad</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.organization?.name || 'Competition'})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#64748B]">
              Binding your team to a specific event lets students discover your squad directly from that event.
            </p>
          </div>

          {/* Max Members */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#222730]">
              Maximum Team Capacity (2–10)
            </label>
            <input
              type="number"
              min={2}
              max={10}
              value={maxMembers}
              onChange={(e) => setMaxMembers(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#222730] focus:outline-hidden focus:border-[#FEB703] transition-colors"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#222730]">
              Team Description & Goal
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project, work plan, or what kind of collaborators you're looking for..."
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#222730] focus:outline-hidden focus:border-[#FEB703] transition-colors"
            />
          </div>

          {/* Desired Roles */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#222730]">
              Roles You're Seeking
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRole();
                  }
                }}
                placeholder="e.g., UI Designer, Backend Dev"
                className="flex-1 px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#222730] focus:outline-hidden focus:border-[#FEB703] transition-colors"
              />
              <button
                type="button"
                onClick={() => handleAddRole()}
                className="px-3 py-2 rounded-lg bg-[#222730] text-white font-bold hover:bg-black transition-colors"
              >
                Add
              </button>
            </div>
            {requiredRoles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {requiredRoles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#F8FAFC] text-[#222730] border border-[#E5E7EB]"
                  >
                    <span>{role}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(role)}
                      className="text-[#64748B] hover:text-rose-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Required Skills */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#222730]">
              Required / Preferred Skills
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="e.g., React, Python, Figma"
                className="flex-1 px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#222730] focus:outline-hidden focus:border-[#FEB703] transition-colors"
              />
              <button
                type="button"
                onClick={() => handleAddSkill()}
                className="px-3 py-2 rounded-lg bg-[#222730] text-white font-bold hover:bg-black transition-colors"
              >
                Add
              </button>
            </div>
            {requiredSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#FFF8E6] text-[#B45309] border border-[#FDE68A]"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-[#B45309] hover:text-rose-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
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
              className="btn-primary text-xs py-2 px-5 shadow-xs"
            >
              {loading ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
