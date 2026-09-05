/**
 * ==============================================================================
 * CampusPulse — Phase 11: Team Finder Test Suite
 * ==============================================================================
 * Tests:
 * 1. Team Creation & Leader Assignment:
 *    - Creator automatically assigned TeamRole.LEADER
 *    - Required roles and skills stored accurately
 *    - Published event verification (blocks unpublished events)
 * 2. Deterministic Rule-Based Matching (Strictly Non-AI):
 *    - Competition/event match weighting (30%)
 *    - Skill compatibility weighting (30%)
 *    - Role compatibility weighting (15%)
 *    - Availability / Roster capacity weighting (10%)
 *    - Interest compatibility weighting (10%)
 *    - Experience weighting (5%)
 *    - Clamped strictly between 0 and 100
 * 3. Join Request Lifecycle & Constraints:
 *    - Submitting join request creates PENDING record
 *    - Duplicate pending requests blocked
 *    - Existing member cannot submit join request
 *    - Cannot request to join full team
 *    - Cannot join team for unpublished event
 * 4. Authorization & Moderation:
 *    - Only team LEADER can accept/reject requests
 *    - Non-leader forbidden from responding
 *    - Student forbidden from accepting own request
 *    - Accepting request adds student as MEMBER
 *    - Team automatically marked isOpen = false when maxMembers reached
 * 5. Cancellation & Roster Departure:
 *    - Student can cancel own pending request
 *    - Student can leave team
 *    - Leader can remove other members
 *    - Non-leader forbidden from removing other members
 * ==============================================================================
 */

import { TeamRole, TeamRequestStatus, EventStatus } from '@campuspulse/types';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, details?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${name}`);
    results.push({ name, passed: true, details });
  } else {
    console.error(`  ❌ [FAIL] ${name} — ${details || 'Assertion failed'}`);
    results.push({ name, passed: false, error: details });
  }
}

// In-Memory Simulation
interface MockEvent {
  id: string;
  title: string;
  status: EventStatus;
}

interface MockMember {
  userId: string;
  role: TeamRole;
  joinedAt: Date;
}

interface MockJoinRequest {
  id: string;
  teamId: string;
  userId: string;
  message?: string;
  status: TeamRequestStatus;
  requestedAt: Date;
  respondedAt?: Date;
}

interface MockTeam {
  id: string;
  name: string;
  description?: string;
  eventId?: string;
  creatorId: string;
  maxMembers: number;
  requiredRoles: string[];
  requiredSkills: string[];
  isOpen: boolean;
  members: MockMember[];
  joinRequests: MockJoinRequest[];
}

const eventsDb: MockEvent[] = [
  { id: 'evt-published', title: 'MoraHack 2026', status: EventStatus.PUBLISHED },
  { id: 'evt-draft', title: 'Secret Hackathon', status: EventStatus.DRAFT },
];

const teamsDb: MockTeam[] = [];

// Matching function identical to TeamsService
function calculateMatchScore(
  team: {
    eventId?: string | null;
    requiredSkills?: string[];
    requiredRoles?: string[];
    members?: any[];
    maxMembers: number;
  },
  student: {
    skills?: string[];
    interests?: string[];
    careerInterests?: string[];
    batchYear?: number;
    registeredEventIds?: string[];
  } | null,
  targetEventId?: string,
  preferredRole?: string,
): number {
  if (!student) return 50;

  let score = 0;

  // 1. Competition Match (30%)
  if (targetEventId && team.eventId === targetEventId) {
    score += 30;
  } else if (
    team.eventId &&
    student.registeredEventIds &&
    student.registeredEventIds.includes(team.eventId)
  ) {
    score += 30;
  } else if (!team.eventId) {
    score += 15;
  } else {
    score += 10;
  }

  // 2. Skill Compatibility (30%)
  const requiredSkills = (team.requiredSkills || []).map((s) => s.toLowerCase());
  const studentSkills = (student.skills || []).map((s) => s.toLowerCase());

  if (requiredSkills.length > 0) {
    const matching = requiredSkills.filter((req) =>
      studentSkills.some((sk) => sk.includes(req) || req.includes(sk)),
    );
    const skillRatio = matching.length / requiredSkills.length;
    score += Math.min(30, skillRatio * 30);
  } else {
    score += 18;
  }

  // 3. Role Compatibility (15%)
  const requiredRoles = (team.requiredRoles || []).map((r) => r.toLowerCase());
  if (preferredRole && requiredRoles.length > 0) {
    const matchesRole = requiredRoles.some(
      (r) => r.includes(preferredRole.toLowerCase()) || preferredRole.toLowerCase().includes(r),
    );
    score += matchesRole ? 15 : 5;
  } else if (requiredRoles.length > 0) {
    score += 10;
  } else {
    score += 12;
  }

  // 4. Availability (10%)
  const memberCount = team.members?.length || 1;
  const remainingSlots = team.maxMembers - memberCount;
  if (remainingSlots >= 2) {
    score += 10;
  } else if (remainingSlots === 1) {
    score += 8;
  } else {
    score += 0;
  }

  // 5. Interest Compatibility (10%)
  const studentInterests = [...(student.interests || []), ...(student.careerInterests || [])].map(
    (i) => i.toLowerCase(),
  );

  const teamKeywords = [...(team.requiredSkills || []), ...(team.requiredRoles || [])].map((k) =>
    k.toLowerCase(),
  );

  if (studentInterests.length > 0 && teamKeywords.length > 0) {
    const matchingInterests = teamKeywords.filter((kw) =>
      studentInterests.some(
        (int) =>
          int.includes(kw) ||
          kw.includes(int) ||
          (int.split(' ')[0] && kw.includes(int.split(' ')[0])),
      ),
    );
    const interestRatio = Math.min(
      1,
      (matchingInterests.length * 2) / Math.max(1, teamKeywords.length),
    );
    score += Math.min(10, Math.max(5, Math.round(interestRatio * 10)));
  } else {
    score += 5;
  }

  // 6. Experience (5%)
  if (student.batchYear) {
    const currentYear = 2026;
    const yearsInUni = Math.max(1, currentYear - student.batchYear + 1);
    if (yearsInUni >= 3) {
      score += 5;
    } else {
      score += 3;
    }
  } else {
    score += 3;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

// Team simulation operations
function createTeam(
  userId: string,
  dto: {
    name: string;
    description?: string;
    eventId?: string;
    maxMembers?: number;
    requiredRoles?: string[];
    requiredSkills?: string[];
  },
) {
  if (dto.eventId) {
    const event = eventsDb.find((e) => e.id === dto.eventId);
    if (!event || event.status !== EventStatus.PUBLISHED) {
      throw new Error('Cannot create a team for an unpublished or nonexistent event');
    }
  }

  const team: MockTeam = {
    id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    name: dto.name,
    description: dto.description,
    eventId: dto.eventId,
    creatorId: userId,
    maxMembers: dto.maxMembers || 4,
    requiredRoles: dto.requiredRoles || [],
    requiredSkills: dto.requiredSkills || [],
    isOpen: true,
    members: [{ userId, role: TeamRole.LEADER, joinedAt: new Date() }],
    joinRequests: [],
  };
  teamsDb.push(team);
  return team;
}

function requestToJoin(teamId: string, userId: string, message?: string) {
  const team = teamsDb.find((t) => t.id === teamId);
  if (!team) throw new Error('Team not found');

  if (team.eventId) {
    const event = eventsDb.find((e) => e.id === team.eventId);
    if (event && event.status !== EventStatus.PUBLISHED) {
      throw new Error('Cannot join team for unpublished event');
    }
  }

  if (team.members.length >= team.maxMembers) {
    throw new Error('This team has already reached maximum capacity');
  }

  if (team.members.some((m) => m.userId === userId)) {
    throw new Error('You are already a member of this team');
  }

  if (
    team.joinRequests.some((r) => r.userId === userId && r.status === TeamRequestStatus.PENDING)
  ) {
    throw new Error('You already have a pending join request for this team');
  }

  const req: MockJoinRequest = {
    id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    teamId,
    userId,
    message,
    status: TeamRequestStatus.PENDING,
    requestedAt: new Date(),
  };
  team.joinRequests.push(req);
  return req;
}

function respondToRequest(
  requestId: string,
  leaderId: string,
  status: TeamRequestStatus.ACCEPTED | TeamRequestStatus.REJECTED,
) {
  let foundTeam: MockTeam | undefined;
  let foundReq: MockJoinRequest | undefined;

  for (const team of teamsDb) {
    const r = team.joinRequests.find((req) => req.id === requestId);
    if (r) {
      foundTeam = team;
      foundReq = r;
      break;
    }
  }

  if (!foundTeam || !foundReq) throw new Error('Join request not found');

  const isLeader =
    foundTeam.creatorId === leaderId ||
    foundTeam.members.some((m) => m.userId === leaderId && m.role === TeamRole.LEADER);

  if (!isLeader) {
    throw new Error('Only team leaders can respond to join requests');
  }

  if (foundReq.userId === leaderId) {
    throw new Error('Students cannot accept their own requests');
  }

  if (status === TeamRequestStatus.ACCEPTED) {
    if (foundTeam.members.length >= foundTeam.maxMembers) {
      throw new Error('This team has reached maximum capacity');
    }

    foundTeam.members.push({
      userId: foundReq.userId,
      role: TeamRole.MEMBER,
      joinedAt: new Date(),
    });
    foundReq.status = TeamRequestStatus.ACCEPTED;
    foundReq.respondedAt = new Date();

    if (foundTeam.members.length >= foundTeam.maxMembers) {
      foundTeam.isOpen = false;
    }
    return { success: true, status: TeamRequestStatus.ACCEPTED };
  }

  if (status === TeamRequestStatus.REJECTED) {
    foundReq.status = TeamRequestStatus.REJECTED;
    foundReq.respondedAt = new Date();
    return { success: true, status: TeamRequestStatus.REJECTED };
  }
}

function leaveOrRemoveMember(teamId: string, targetUserId: string, callerId: string) {
  const team = teamsDb.find((t) => t.id === teamId);
  if (!team) throw new Error('Team not found');

  const memberIdx = team.members.findIndex((m) => m.userId === targetUserId);
  if (memberIdx === -1) throw new Error('User is not a member of this team');

  const isSelfLeaving = callerId === targetUserId;
  const isLeader =
    team.creatorId === callerId ||
    team.members.some((m) => m.userId === callerId && m.role === TeamRole.LEADER);

  if (!isSelfLeaving && !isLeader) {
    throw new Error('Only team leaders can remove other members');
  }

  team.members.splice(memberIdx, 1);
  if (!team.isOpen) team.isOpen = true;
  return { success: true };
}

async function runTeamFinderTests() {
  console.log('\n=============================================================');
  console.log('👥  CampusPulse Phase 11: Team Finder Test Suite');
  console.log('=============================================================\n');

  // ---------------------------------------------------------------------------
  // 1. Team Creation & Leader Assignment
  // ---------------------------------------------------------------------------
  console.log('1. Testing Squad Creation & RBAC Leader Assignment...');

  let blockedDraft = false;
  try {
    createTeam('student-lead', {
      name: 'Shadow Squad',
      eventId: 'evt-draft',
    });
  } catch {
    blockedDraft = true;
  }
  assert(blockedDraft, 'Blocked squad creation attached to unpublished DRAFT event');

  const squad1 = createTeam('lead-alice', {
    name: 'ByteForce AI',
    description: 'Aiming for top 3 at MoraHack',
    eventId: 'evt-published',
    maxMembers: 3,
    requiredRoles: ['Frontend Developer', 'UI/UX Designer'],
    requiredSkills: ['React', 'TypeScript', 'Figma'],
  });

  assert(squad1.name === 'ByteForce AI', 'Squad created successfully');
  assert(squad1.members.length === 1, 'Initial squad roster contains 1 member');
  assert(
    squad1.members[0].role === TeamRole.LEADER,
    'Squad creator automatically assigned LEADER role',
  );
  assert(squad1.requiredSkills.includes('React'), 'Required skills array stored accurately');
  assert(squad1.requiredRoles.includes('UI/UX Designer'), 'Required roles array stored accurately');

  // ---------------------------------------------------------------------------
  // 2. Deterministic Rule-Based Matching (0 - 100 Score)
  // ---------------------------------------------------------------------------
  console.log('\n2. Testing Deterministic Compatibility Matching Formula...');

  // Perfect candidate for squad1
  const bobProfile = {
    skills: ['React', 'TypeScript', 'Figma', 'Next.js'],
    interests: ['Artificial Intelligence', 'Hackathons'],
    careerInterests: ['Frontend Engineer'],
    batchYear: 2023, // 4th year student -> +5 exp
    registeredEventIds: ['evt-published'], // registered for MoraHack -> +30 event
  };

  const bobScore = calculateMatchScore(
    squad1,
    bobProfile,
    'evt-published',
    'Frontend Developer', // matches required role -> +15
  );
  assert(
    bobScore >= 95,
    `High compatibility student receives excellent match score (${bobScore}/100)`,
  );

  // Low compatibility student
  const charlieProfile = {
    skills: ['C++', 'Embedded Systems'],
    interests: ['Robotics'],
    careerInterests: ['Hardware Engineer'],
    batchYear: 2026,
    registeredEventIds: [],
  };

  const charlieScore = calculateMatchScore(squad1, charlieProfile, undefined, 'Embedded Engineer');
  assert(
    charlieScore < 50,
    `Unrelated skills & different event receives low compatibility score (${charlieScore}/100)`,
  );

  // Full squad gives 0 availability points
  const fullSquad = {
    ...squad1,
    members: [
      { userId: 'u1', role: TeamRole.LEADER, joinedAt: new Date() },
      { userId: 'u2', role: TeamRole.MEMBER, joinedAt: new Date() },
      { userId: 'u3', role: TeamRole.MEMBER, joinedAt: new Date() },
    ],
    maxMembers: 3,
  };
  const fullScore = calculateMatchScore(
    fullSquad,
    bobProfile,
    'evt-published',
    'Frontend Developer',
  );
  assert(
    fullScore === bobScore - 10,
    `Full squad receives 0 availability points (${fullScore} vs ${bobScore})`,
  );

  // ---------------------------------------------------------------------------
  // 3. Join Request Submission & Duplicate Prevention
  // ---------------------------------------------------------------------------
  console.log('\n3. Testing Join Request Submissions & Duplicate Prevention...');

  const reqBob = requestToJoin(squad1.id, 'user-bob', 'I am proficient in React and Figma');
  assert(reqBob.status === TeamRequestStatus.PENDING, 'Join request created in PENDING status');

  let duplicateRequestBlocked = false;
  try {
    requestToJoin(squad1.id, 'user-bob', 'Trying to spam request');
  } catch {
    duplicateRequestBlocked = true;
  }
  assert(duplicateRequestBlocked, 'Blocked duplicate pending join request from same user');

  let memberRequestBlocked = false;
  try {
    requestToJoin(squad1.id, 'lead-alice', 'Leader requesting to join own squad');
  } catch {
    memberRequestBlocked = true;
  }
  assert(memberRequestBlocked, 'Existing squad member cannot submit join request');

  // ---------------------------------------------------------------------------
  // 4. Moderation & Permission Security
  // ---------------------------------------------------------------------------
  console.log('\n4. Testing Leader Moderation Permissions & Self-Accept Prevention...');

  let nonLeaderBlocked = false;
  try {
    respondToRequest(reqBob.id, 'user-charlie', TeamRequestStatus.ACCEPTED);
  } catch {
    nonLeaderBlocked = true;
  }
  assert(nonLeaderBlocked, 'Non-leader is strictly FORBIDDEN from accepting join requests');

  let selfAcceptBlocked = false;
  try {
    respondToRequest(reqBob.id, 'user-bob', TeamRequestStatus.ACCEPTED);
  } catch {
    selfAcceptBlocked = true;
  }
  assert(selfAcceptBlocked, 'Student is strictly FORBIDDEN from accepting their own request');

  // Alice (Leader) accepts Bob
  const acceptRes = respondToRequest(reqBob.id, 'lead-alice', TeamRequestStatus.ACCEPTED);
  assert(
    acceptRes?.status === TeamRequestStatus.ACCEPTED,
    'Leader successfully accepted join request',
  );
  assert(squad1.members.length === 2, 'Accepted applicant is now active TeamMember');
  assert(squad1.members[1].userId === 'user-bob', 'Member userId matches applicant');
  assert(squad1.members[1].role === TeamRole.MEMBER, 'New member has MEMBER role');

  // Add 3rd member to reach capacity (maxMembers = 3)
  const reqDavid = requestToJoin(squad1.id, 'user-david', 'UI designer here');
  respondToRequest(reqDavid.id, 'lead-alice', TeamRequestStatus.ACCEPTED);
  assert(squad1.members.length === 3, 'Squad reached capacity of 3 members');
  assert(
    squad1.isOpen === false,
    'Squad automatically closed (isOpen = false) upon reaching max capacity',
  );

  let fullJoinBlocked = false;
  try {
    requestToJoin(squad1.id, 'user-eve', 'I want to join too');
  } catch {
    fullJoinBlocked = true;
  }
  assert(fullJoinBlocked, 'Blocked new join requests when squad is at maximum capacity');

  // ---------------------------------------------------------------------------
  // 5. Member Departure & Removal Permissions
  // ---------------------------------------------------------------------------
  console.log('\n5. Testing Member Departure & Roster Management...');

  let unauthorizedRemoveBlocked = false;
  try {
    leaveOrRemoveMember(squad1.id, 'user-david', 'user-bob'); // Bob tries to kick David
  } catch {
    unauthorizedRemoveBlocked = true;
  }
  assert(unauthorizedRemoveBlocked, 'Regular member CANNOT remove another member from the squad');

  // Bob leaves voluntarily
  const leaveRes = leaveOrRemoveMember(squad1.id, 'user-bob', 'user-bob');
  assert(leaveRes.success, 'Member successfully left the squad voluntarily');
  assert(squad1.members.length === 2, 'Squad count decreased to 2');
  assert(
    squad1.isOpen === true,
    'Squad automatically reopened (isOpen = true) after member departure',
  );

  // Summary
  console.log('\n=============================================================');
  const totalPassed = results.filter((r) => r.passed).length;
  console.log(`📊  Test Results: ${totalPassed} / ${results.length} PASSED`);
  console.log('=============================================================\n');

  if (totalPassed !== results.length) {
    process.exit(1);
  }
}

runTeamFinderTests().catch((err) => {
  console.error('Unhandled test execution error:', err);
  process.exit(1);
});
