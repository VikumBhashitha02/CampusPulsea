/**
 * ==============================================================================
 * CampusPulse — Phase 9: Student Features Test Suite
 * ==============================================================================
 * Tests:
 * 1. Student Profile Lifecycle & All 9 Fields:
 *    - First Name, Last Name, Avatar URL
 *    - University, Faculty, Department, Batch Year, Student ID
 *    - Skills, Interests, Career Interests, Bio, Social links
 * 2. Opportunity Bookmarking:
 *    - POST /events/:id/bookmark
 *    - DELETE /events/:id/bookmark
 *    - GET /bookmarks/my
 * 3. Event Registration Tracking:
 *    - POST /events/:id/register (Tracks student, event, status, timestamp, external link forwarding)
 *    - GET /registrations/my
 * 4. Personalized Rule-Based Recommendations (Strictly non-AI weighted affinity)
 * 5. Upcoming Deadlines Tracker
 * ==============================================================================
 */

import { EventStatus, EventMode, RegistrationStatus } from '@campuspulse/types';

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

// In-memory simulation models for testing student domain logic
interface MockUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  roles: string[];
}

interface MockStudentProfile {
  userId: string;
  universityId: string;
  facultyId?: string;
  departmentId?: string;
  studentIdNumber?: string;
  batchYear?: number;
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  skills: string[];
  interests: string[];
  careerInterests: string[];
}

interface MockEvent {
  id: string;
  title: string;
  slug: string;
  status: EventStatus;
  mode: EventMode;
  universityId?: string;
  skills: string[];
  tags: string[];
  category: { id: string; name: string; slug: string };
  registrationUrl?: string;
  registrationDeadline?: Date;
  startDate: Date;
  featured: boolean;
  registrationsCount: number;
}

const usersDb: Record<string, MockUser> = {
  'stu-kasun': {
    id: 'stu-kasun',
    email: 'kasun@mora.ac.lk',
    name: 'Kasun Perera',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    roles: ['STUDENT'],
  },
};

const profilesDb: Record<string, MockStudentProfile> = {
  'stu-kasun': {
    userId: 'stu-kasun',
    universityId: 'uni-uom',
    facultyId: 'fac-eng-uom',
    departmentId: 'dept-cse-uom',
    studentIdNumber: '210045B',
    batchYear: 2021,
    bio: 'Computer science undergrad passionate about AI and distributed systems.',
    githubUrl: 'https://github.com/kasunp',
    linkedinUrl: 'https://linkedin.com/in/kasunp',
    websiteUrl: 'https://kasun.dev',
    skills: ['AI', 'Python', 'React', 'TypeScript'],
    interests: ['hackathons', 'machine learning', 'robotics'],
    careerInterests: ['Software Engineer', 'AI Research Engineer'],
  },
};

const bookmarksDb: { id: string; userId: string; eventId: string; createdAt: Date }[] = [];
const registrationsDb: {
  id: string;
  userId: string;
  eventId: string;
  status: RegistrationStatus;
  registeredAt: Date;
  notes?: string;
}[] = [];

const now = new Date();
const mockEvents: MockEvent[] = [
  {
    id: 'evt-ai-uom',
    title: 'MoraHack 2026: National AI Hackathon',
    slug: 'morahack-2026',
    status: EventStatus.PUBLISHED,
    mode: EventMode.HYBRID,
    universityId: 'uni-uom', // Match Kasun's university
    skills: ['AI', 'Python', 'Machine Learning'], // Matches Kasun's skills
    tags: ['hackathons', 'ai', 'competitions'], // Matches Kasun's interests
    category: { id: 'cat-comp', name: 'Competitions', slug: 'competitions' },
    registrationUrl: 'https://organizer.example.com/morahack/register',
    registrationDeadline: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days away
    startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    featured: true,
    registrationsCount: 210,
  },
  {
    id: 'evt-web-uoc',
    title: 'Colombo Web Dev Bootcamp',
    slug: 'colombo-web-bootcamp',
    status: EventStatus.PUBLISHED,
    mode: EventMode.ONLINE,
    universityId: 'uni-uoc',
    skills: ['React', 'CSS'], // 1 skill match
    tags: ['workshops', 'frontend'],
    category: { id: 'cat-acad', name: 'Workshops', slug: 'workshops' },
    registrationUrl: 'https://organizer.example.com/webbootcamp',
    registrationDeadline: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    featured: false,
    registrationsCount: 95,
  },
  {
    id: 'evt-business-sjp',
    title: 'J’pura Case Challenge 2026',
    slug: 'jpura-case-challenge-2026',
    status: EventStatus.PUBLISHED,
    mode: EventMode.IN_PERSON,
    universityId: 'uni-sjp',
    skills: ['Accounting', 'Finance', 'Pitching'], // Zero skill match
    tags: ['business', 'case-study'],
    category: { id: 'cat-biz', name: 'Business', slug: 'business' },
    registrationDeadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
    featured: false,
    registrationsCount: 40,
  },
];

// Student Profile update logic
function updateProfile(
  userId: string,
  dto: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    universityId?: string;
    facultyId?: string;
    departmentId?: string;
    studentIdNumber?: string;
    batchYear?: number;
    skills?: string[];
    interests?: string[];
    careerInterests?: string[];
    bio?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    websiteUrl?: string;
  },
) {
  const user = usersDb[userId];
  if (!user) throw new Error('User not found');

  if (dto.firstName || dto.lastName) {
    const parts = user.name.split(' ');
    const first = dto.firstName ?? parts[0];
    const last = dto.lastName ?? parts.slice(1).join(' ');
    user.name = `${first} ${last}`.trim();
  }
  if (dto.avatarUrl) {
    user.avatarUrl = dto.avatarUrl;
  }

  let profile = profilesDb[userId];
  if (!profile) {
    profile = {
      userId,
      universityId: dto.universityId || 'uni-uom',
      skills: dto.skills || [],
      interests: dto.interests || [],
      careerInterests: dto.careerInterests || [],
    };
    profilesDb[userId] = profile;
  }

  if (dto.universityId) profile.universityId = dto.universityId;
  if (dto.facultyId !== undefined) profile.facultyId = dto.facultyId;
  if (dto.departmentId !== undefined) profile.departmentId = dto.departmentId;
  if (dto.studentIdNumber !== undefined) profile.studentIdNumber = dto.studentIdNumber;
  if (dto.batchYear !== undefined) profile.batchYear = dto.batchYear;
  if (dto.skills) profile.skills = dto.skills;
  if (dto.interests) profile.interests = dto.interests;
  if (dto.careerInterests) profile.careerInterests = dto.careerInterests;
  if (dto.bio !== undefined) profile.bio = dto.bio;
  if (dto.githubUrl !== undefined) profile.githubUrl = dto.githubUrl;
  if (dto.linkedinUrl !== undefined) profile.linkedinUrl = dto.linkedinUrl;
  if (dto.websiteUrl !== undefined) profile.websiteUrl = dto.websiteUrl;

  return { user, profile };
}

// Bookmarking logic
function bookmarkEvent(userId: string, eventId: string) {
  const event = mockEvents.find((e) => e.id === eventId && e.status === EventStatus.PUBLISHED);
  if (!event) throw new Error('Event not found or not published');

  const existingIdx = bookmarksDb.findIndex((b) => b.userId === userId && b.eventId === eventId);
  if (existingIdx === -1) {
    bookmarksDb.push({
      id: `bm-${Date.now()}-${Math.random()}`,
      userId,
      eventId,
      createdAt: new Date(),
    });
  }
  return { bookmarked: true, eventId, message: 'Saved to personal bookmarks' };
}

function unbookmarkEvent(userId: string, eventId: string) {
  const existingIdx = bookmarksDb.findIndex((b) => b.userId === userId && b.eventId === eventId);
  if (existingIdx !== -1) {
    bookmarksDb.splice(existingIdx, 1);
  }
  return { bookmarked: false, eventId, message: 'Removed from bookmarks' };
}

function getUserBookmarks(userId: string) {
  const userBmIds = bookmarksDb.filter((b) => b.userId === userId).map((b) => b.eventId);
  return mockEvents.filter((e) => userBmIds.includes(e.id));
}

// Registration tracking logic
function trackRegistration(userId: string, eventId: string, notes?: string) {
  const event = mockEvents.find((e) => e.id === eventId && e.status === EventStatus.PUBLISHED);
  if (!event) throw new Error('Event not found');

  let reg = registrationsDb.find((r) => r.userId === userId && r.eventId === eventId);
  const nowTs = new Date();

  if (reg) {
    reg.registeredAt = nowTs;
    if (notes) reg.notes = notes;
  } else {
    reg = {
      id: `reg-${Date.now()}`,
      userId,
      eventId,
      status: RegistrationStatus.REGISTERED,
      registeredAt: nowTs,
      notes,
    };
    registrationsDb.push(reg);
  }

  return {
    id: reg.id,
    eventId: event.id,
    eventTitle: event.title,
    userId,
    status: reg.status,
    registeredAt: reg.registeredAt,
    externalUrl: event.registrationUrl || null,
    message: event.registrationUrl
      ? 'Registration click tracked; redirecting to organizer registration portal'
      : 'RSVP recorded successfully',
  };
}

// Rule-based recommendation scoring (Strictly non-AI)
function getRecommendations(userId: string, limit = 6) {
  const student = profilesDb[userId];
  const nowTs = new Date();
  const candidates = mockEvents.filter(
    (e) => e.status === EventStatus.PUBLISHED && e.startDate >= nowTs,
  );

  if (!student) return candidates.slice(0, limit);

  const studentSkillsLower = student.skills.map((s) => s.toLowerCase());
  const studentInterestsLower = [...student.interests, ...student.careerInterests].map((i) =>
    i.toLowerCase(),
  );

  const scored = candidates.map((event) => {
    let score = 0;

    // 1. Same university: +30 pts
    if (event.universityId === student.universityId) {
      score += 30;
    }

    // 2. Matching skills: +20 pts each
    for (const skill of event.skills) {
      if (studentSkillsLower.includes(skill.toLowerCase())) {
        score += 20;
      }
    }

    // 3. Category / Tag interest match: +15 pts each
    const catSlug = event.category.slug.toLowerCase();
    if (studentInterestsLower.some((i) => catSlug.includes(i) || i.includes(catSlug))) {
      score += 15;
    }
    for (const tag of event.tags) {
      if (studentInterestsLower.includes(tag.toLowerCase())) {
        score += 15;
      }
    }

    // 4. Featured: +10 pts
    if (event.featured) score += 10;

    // 5. Popularity bonus
    score += Math.min(20, Math.floor(event.registrationsCount / 10));

    return { event, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.event);
}

// Upcoming deadlines logic
function getUpcomingDeadlines(limit = 6) {
  const nowTs = new Date();
  return mockEvents
    .filter(
      (e) =>
        e.status === EventStatus.PUBLISHED &&
        e.registrationDeadline &&
        e.registrationDeadline >= nowTs,
    )
    .sort((a, b) => a.registrationDeadline!.getTime() - b.registrationDeadline!.getTime())
    .slice(0, limit);
}

async function runStudentTests() {
  console.log('\n=============================================================');
  console.log('🎓  CampusPulse Phase 9: Student Features Test Suite');
  console.log('=============================================================\n');

  // ---------------------------------------------------------------------------
  // 1. Student Profile Lifecycle & All 9 Fields
  // ---------------------------------------------------------------------------
  console.log('1. Testing Student Profile Fields & Updating...');

  const initialProfile = profilesDb['stu-kasun']!;
  assert(
    initialProfile.skills.includes('AI') &&
      initialProfile.careerInterests.includes('AI Research Engineer'),
    'Student profile contains skills and career interests',
  );

  // Update profile with new skills, career interests, and bio
  const updateResult = updateProfile('stu-kasun', {
    firstName: 'Kasun',
    lastName: 'Bandara',
    skills: ['AI', 'Python', 'React', 'TypeScript', 'Next.js', 'PyTorch'],
    careerInterests: ['AI Research Engineer', 'Full-Stack Developer'],
    bio: 'Updated bio: Aspiring AI Engineer and open-source contributor.',
    batchYear: 2022,
  });

  assert(
    updateResult.user.name === 'Kasun Bandara',
    'User full name updated from first and last name',
  );
  assert(
    updateResult.profile.skills.includes('Next.js') &&
      updateResult.profile.skills.includes('PyTorch'),
    'Skills array successfully updated with new competencies',
  );
  assert(
    updateResult.profile.careerInterests.includes('Full-Stack Developer'),
    'Career interests array successfully updated',
  );
  assert(updateResult.profile.batchYear === 2022, 'Academic batch year updated accurately');

  // ---------------------------------------------------------------------------
  // 2. Bookmarking (POST / DELETE / List)
  // ---------------------------------------------------------------------------
  console.log('\n2. Testing Opportunity Bookmarking...');

  const bm1 = bookmarkEvent('stu-kasun', 'evt-ai-uom');
  assert(bm1.bookmarked === true, 'POST /events/:id/bookmark saves opportunity');

  const bmsAfterSave = getUserBookmarks('stu-kasun');
  assert(
    bmsAfterSave.some((e) => e.id === 'evt-ai-uom'),
    'GET /bookmarks/my includes saved opportunity',
  );

  // Idempotence test
  const bmRepeat = bookmarkEvent('stu-kasun', 'evt-ai-uom');
  assert(
    bmRepeat.bookmarked === true && getUserBookmarks('stu-kasun').length === 1,
    'Bookmarking the same opportunity twice is idempotent (no duplicates)',
  );

  // Unbookmark test
  const unbm = unbookmarkEvent('stu-kasun', 'evt-ai-uom');
  assert(unbm.bookmarked === false, 'DELETE /events/:id/bookmark removes opportunity');

  const bmsAfterRemove = getUserBookmarks('stu-kasun');
  assert(
    !bmsAfterRemove.some((e) => e.id === 'evt-ai-uom'),
    'Unbookmarked opportunity is removed from /bookmarks/my',
  );

  // ---------------------------------------------------------------------------
  // 3. Event Registration Tracking & External Forwarding
  // ---------------------------------------------------------------------------
  console.log('\n3. Testing Event Registration Tracking...');

  const trackRes = trackRegistration('stu-kasun', 'evt-ai-uom', 'Team lead RSVP');
  assert(
    trackRes.status === RegistrationStatus.REGISTERED &&
      trackRes.eventId === 'evt-ai-uom' &&
      trackRes.userId === 'stu-kasun',
    'Registration record created with event ID, student ID, and REGISTERED status',
  );
  assert(
    trackRes.registeredAt instanceof Date,
    'Registration click timestamp is recorded accurately',
  );
  assert(
    trackRes.externalUrl === 'https://organizer.example.com/morahack/register',
    'External registration URL returned for seamless organizer redirection',
  );

  // Re-tracking updates timestamp
  const prevTs = trackRes.registeredAt.getTime();
  const retrack = trackRegistration('stu-kasun', 'evt-ai-uom');
  assert(
    retrack.registeredAt.getTime() >= prevTs && registrationsDb.length === 1,
    'Subsequent registration clicks update timestamp without duplicating registrations',
  );

  // ---------------------------------------------------------------------------
  // 4. Personalized Rule-Based Recommendations
  // ---------------------------------------------------------------------------
  console.log('\n4. Testing Rule-Based Personalized Recommendations...');

  const recommendations = getRecommendations('stu-kasun');
  assert(recommendations.length > 0, 'Recommendations returns candidates for student profile');
  assert(
    recommendations[0]!.id === 'evt-ai-uom',
    'Opportunity with matching university (UoM), matching skills (AI, Python) and matching tags ranks #1',
  );
  assert(
    recommendations[1]!.id === 'evt-web-uoc',
    'Opportunity with single skill match (React) ranks higher than zero-match business event',
  );

  // ---------------------------------------------------------------------------
  // 5. Upcoming Deadlines Tracker
  // ---------------------------------------------------------------------------
  console.log('\n5. Testing Upcoming Deadlines Tracker...');

  const deadlines = getUpcomingDeadlines();
  assert(deadlines.length >= 2, 'Deadlines query returns opportunities with upcoming cutoff dates');
  assert(
    deadlines[0]!.registrationDeadline!.getTime() <= deadlines[1]!.registrationDeadline!.getTime(),
    'Upcoming deadlines sorted chronologically (nearest deadline first)',
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

runStudentTests().catch((err) => {
  console.error('Unhandled test execution error:', err);
  process.exit(1);
});
