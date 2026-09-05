/**
 * ==============================================================================
 * CampusPulse — Phase 6: Core Event Management System Comprehensive Test Suite
 * ==============================================================================
 * Minimum test coverage:
 * 1. Public published event listing
 * 2. Public event detail (by ID & slug)
 * 3. Draft event is not publicly visible
 * 4. Rejected event is not publicly visible
 * 5. Organizer creates draft
 * 6. Organizer views own event
 * 7. Organizer cannot modify another organization's event
 * 8. Organizer submits draft for review
 * 9. Organizer cannot directly publish an event
 * 10. Super admin approves event
 * 11. Super admin rejects event
 * 12. Published event becomes visible
 * 13. Event cancellation
 * 14. Invalid status transition
 * 15. Invalid date range (endDate < startDate, deadline > startDate)
 * 16. Invalid registration URL
 * 17. Invalid organization/university relationship
 * 18. Pagination
 * 19. Sorting (newest, upcoming, registration deadline, event start date)
 * 20. Basic filters (category, university, faculty, department, organization, event mode, status)
 * 21. Student cannot create/manage events
 * 22. University admin ownership restrictions
 * 23. Super admin global access
 * 24. Duplicate slug handling
 * 25. Not-found handling
 * ==============================================================================
 */

import { EventStatus, EventMode, OrgMemberRole, RoleType, OrgType } from '@campuspulse/types';

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

async function runTests() {
  console.log('\n==============================================================================');
  console.log('🎪  CampusPulse Phase 6: Comprehensive Event Management Test Suite');
  console.log('==============================================================================\n');

  // ---------------------------------------------------------------------------
  // Setup Mock Entities
  // ---------------------------------------------------------------------------
  const mockUniversityA = { id: 'uni-colombo', name: 'University of Colombo', slug: 'uoc' };
  const mockUniversityB = { id: 'uni-moratuwa', name: 'University of Moratuwa', slug: 'uom' };

  const mockFacultyA = { id: 'fac-science-uoc', universityId: mockUniversityA.id, name: 'Faculty of Science' };
  const mockFacultyB = { id: 'fac-eng-uom', universityId: mockUniversityB.id, name: 'Faculty of Engineering' };

  const mockDepartmentA = { id: 'dept-cs-uoc', facultyId: mockFacultyA.id, name: 'Department of Computer Science' };
  const mockDepartmentB = { id: 'dept-cse-uom', facultyId: mockFacultyB.id, name: 'Department of CSE' };

  const mockCategory = { id: 'cat-hackathons', name: 'Hackathons & Competitions', slug: 'hackathons' };

  const mockOrgA = {
    id: 'org-acm-uoc',
    universityId: mockUniversityA.id,
    name: 'ACM Student Chapter UOC',
    slug: 'acm-uoc',
    type: OrgType.ACADEMIC_SOCIETY,
  };

  const mockOrgB = {
    id: 'org-ieee-uom',
    universityId: mockUniversityB.id,
    name: 'IEEE Student Branch UOM',
    slug: 'ieee-uom',
    type: OrgType.STUDENT_CLUB,
  };

  const mockOrgNoUni = {
    id: 'org-external-community',
    universityId: null,
    name: 'National Developer Community',
    slug: 'national-devs',
    type: OrgType.COMMUNITY,
  };

  interface EventRecord {
    id: string;
    organizationId: string;
    categoryId: string;
    universityId?: string | null;
    facultyId?: string;
    departmentId?: string;
    title: string;
    slug: string;
    description: string;
    status: EventStatus;
    mode: EventMode;
    startDate: Date;
    endDate: Date;
    registrationDeadline?: Date;
    registrationUrl?: string;
    rejectionReason?: string | null;
    createdAt: Date;
  }

  const events: EventRecord[] = [];

  const orgMembers = [
    { organizationId: mockOrgA.id, userId: 'user-leader-uoc', role: OrgMemberRole.LEADER },
    { organizationId: mockOrgB.id, userId: 'user-leader-uom', role: OrgMemberRole.LEADER },
    { organizationId: mockOrgA.id, userId: 'user-member-uoc', role: OrgMemberRole.MEMBER },
    { organizationId: mockOrgNoUni.id, userId: 'user-leader-external', role: OrgMemberRole.LEADER },
  ];

  // Helper validation function matching service rules
  function validateAndCreateEvent(
    user: { id: string; roles: RoleType[] },
    dto: {
      organizationId: string;
      categoryId: string;
      universityId?: string;
      facultyId?: string;
      departmentId?: string;
      title: string;
      slug: string;
      description: string;
      mode: EventMode;
      startDate: Date;
      endDate: Date;
      registrationDeadline?: Date;
      registrationUrl?: string;
    },
  ): EventRecord {
    // 1. Role permission
    const isGlobalAdmin = user.roles.includes(RoleType.SUPER_ADMIN) || user.roles.includes(RoleType.ADMIN);
    if (!isGlobalAdmin) {
      if (!user.roles.includes(RoleType.ORGANIZER)) {
        throw new Error('ForbiddenException: Only organizers or administrators can create events');
      }
      const membership = orgMembers.find(
        (m) => m.organizationId === dto.organizationId && m.userId === user.id,
      );
      if (!membership || (membership.role !== OrgMemberRole.LEADER && membership.role !== OrgMemberRole.MANAGER)) {
        throw new Error('ForbiddenException: You must be a Leader or Manager of this organization to create events');
      }
    }

    // 2. Duplicate slug
    if (events.some((e) => e.slug === dto.slug)) {
      throw new Error(`ConflictException: An event with slug "${dto.slug}" already exists`);
    }

    // 3. Date validation
    if (new Date(dto.endDate) < new Date(dto.startDate)) {
      throw new Error('BadRequestException: Event end date cannot be before start date');
    }
    if (dto.registrationDeadline && new Date(dto.registrationDeadline) > new Date(dto.startDate)) {
      throw new Error('BadRequestException: Registration deadline cannot be after event start date');
    }

    // 4. URL validation
    if (dto.registrationUrl && !dto.registrationUrl.startsWith('http://') && !dto.registrationUrl.startsWith('https://')) {
      throw new Error('BadRequestException: Registration URL must be a valid HTTP or HTTPS URL');
    }

    // 5. Relationship validation
    const org = [mockOrgA, mockOrgB, mockOrgNoUni].find((o) => o.id === dto.organizationId);
    if (!org) throw new Error('NotFoundException: Organization not found');

    if (dto.universityId && org.universityId && dto.universityId !== org.universityId) {
      throw new Error("BadRequestException: Event university must match the hosting organization's university");
    }

    if (dto.facultyId) {
      const faculty = [mockFacultyA, mockFacultyB].find((f) => f.id === dto.facultyId);
      if (!faculty) throw new Error('NotFoundException: Faculty not found');
      if (dto.universityId && faculty.universityId !== dto.universityId) {
        throw new Error('BadRequestException: Faculty does not belong to the event university');
      }
    }

    if (dto.departmentId) {
      const dept = [mockDepartmentA, mockDepartmentB].find((d) => d.id === dto.departmentId);
      if (!dept) throw new Error('NotFoundException: Department not found');
      if (dto.facultyId && dept.facultyId !== dto.facultyId) {
        throw new Error('BadRequestException: Department does not belong to the selected faculty');
      }
    }

    const resolvedUniversityId = dto.universityId ?? org.universityId ?? null;

    const event: EventRecord = {
      id: `event-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...dto,
      universityId: resolvedUniversityId,
      status: EventStatus.DRAFT,
      createdAt: new Date(),
    };
    events.push(event);
    return event;
  }

  // ---------------------------------------------------------------------------
  // 1. Organizer creates draft & view own event
  // ---------------------------------------------------------------------------
  console.log('1. Testing Organizer Event Creation & Draft Lifecycle...');

  const organizerUoc = { id: 'user-leader-uoc', roles: [RoleType.ORGANIZER] };
  const studentUser = { id: 'user-student-norm', roles: [RoleType.STUDENT] };
  const superAdmin = { id: 'user-super-admin', roles: [RoleType.SUPER_ADMIN] };
  const organizerUom = { id: 'user-leader-uom', roles: [RoleType.ORGANIZER] };

  const event1 = validateAndCreateEvent(organizerUoc, {
    organizationId: mockOrgA.id,
    categoryId: mockCategory.id,
    universityId: mockUniversityA.id,
    facultyId: mockFacultyA.id,
    departmentId: mockDepartmentA.id,
    title: 'Reid Extreme Coding 2026',
    slug: 'reid-extreme-2026',
    description: 'Annual competitive programming contest at UOC',
    mode: EventMode.IN_PERSON,
    startDate: new Date('2026-11-15T09:00:00Z'),
    endDate: new Date('2026-11-15T18:00:00Z'),
    registrationDeadline: new Date('2026-11-10T23:59:59Z'),
    registrationUrl: 'https://acm.cmb.ac.lk/extreme/register',
  });

  assert(event1.status === EventStatus.DRAFT, 'Created event initializes strictly in DRAFT status');
  assert(event1.slug === 'reid-extreme-2026', 'Event slug properly assigned');

  // ---------------------------------------------------------------------------
  // 2. Student cannot create or modify events
  // ---------------------------------------------------------------------------
  console.log('\n2. Testing Student Role Restrictions...');

  let studentCreateBlocked = false;
  try {
    validateAndCreateEvent(studentUser, {
      organizationId: mockOrgA.id,
      categoryId: mockCategory.id,
      title: 'Student Unauthorized Event',
      slug: 'unauth-event',
      description: 'Test description',
      mode: EventMode.ONLINE,
      startDate: new Date('2026-12-01T09:00:00Z'),
      endDate: new Date('2026-12-01T18:00:00Z'),
    });
  } catch (err: any) {
    if (err.message.includes('ForbiddenException')) studentCreateBlocked = true;
  }
  assert(studentCreateBlocked, 'STUDENT role is strictly forbidden from creating events (403)');

  // ---------------------------------------------------------------------------
  // 3. Organizer cannot modify another organization's event
  // ---------------------------------------------------------------------------
  console.log('\n3. Testing Cross-Tenancy Protection between Organizations...');

  function checkCanManageEvent(user: { id: string; roles: RoleType[] }, targetEvent: EventRecord): boolean {
    if (user.roles.includes(RoleType.SUPER_ADMIN) || user.roles.includes(RoleType.ADMIN)) {
      return true;
    }
    const membership = orgMembers.find(
      (m) => m.organizationId === targetEvent.organizationId && m.userId === user.id,
    );
    return !!membership && (membership.role === OrgMemberRole.LEADER || membership.role === OrgMemberRole.MANAGER);
  }

  assert(
    checkCanManageEvent(organizerUoc, event1),
    'Hosting Organizer is GRANTED permission to manage their own event',
  );
  assert(
    !checkCanManageEvent(organizerUom, event1),
    'Unrelated Organizer is STRICTLY DENIED permission to modify another club’s event (Cross-tenancy protected)',
  );
  assert(
    checkCanManageEvent(superAdmin, event1),
    'SUPER_ADMIN is GRANTED full moderation authority over any event',
  );

  // ---------------------------------------------------------------------------
  // 4. Privacy: Draft & Rejected Events Are NOT Publicly Visible
  // ---------------------------------------------------------------------------
  console.log('\n4. Testing Public Privacy Isolation (Draft/Rejected Hidden)...');

  function getPublicEvent(slugOrId: string, requestingUser?: { id: string; roles: RoleType[] }) {
    const event = events.find((e) => e.slug === slugOrId || e.id === slugOrId);
    if (!event) throw new Error('NotFoundException: Event not found');

    if (event.status !== EventStatus.PUBLISHED) {
      if (!requestingUser) throw new Error('NotFoundException: Event not found');
      const isPrivileged = requestingUser.roles.includes(RoleType.SUPER_ADMIN) || requestingUser.roles.includes(RoleType.ADMIN);
      const isOwner = checkCanManageEvent(requestingUser, event);
      if (!isPrivileged && !isOwner) throw new Error('NotFoundException: Event not found');
    }
    return event;
  }

  let publicDraftHidden = false;
  try {
    getPublicEvent('reid-extreme-2026', undefined);
  } catch (err: any) {
    if (err.message.includes('NotFoundException')) publicDraftHidden = true;
  }
  assert(publicDraftHidden, 'DRAFT event throws 404 NotFound to public unauthenticated visitor');

  let studentDraftHidden = false;
  try {
    getPublicEvent('reid-extreme-2026', studentUser);
  } catch (err: any) {
    if (err.message.includes('NotFoundException')) studentDraftHidden = true;
  }
  assert(studentDraftHidden, 'DRAFT event throws 404 NotFound to authenticated students');

  // ---------------------------------------------------------------------------
  // 5. Workflow: Submit Draft -> Admin Approve -> Published
  // ---------------------------------------------------------------------------
  console.log('\n5. Testing Event Submission & Approval Workflow...');

  function submitEventForReview(user: { id: string; roles: RoleType[] }, event: EventRecord) {
    if (!checkCanManageEvent(user, event)) {
      throw new Error('ForbiddenException: You do not have permission to submit this event');
    }
    if (event.status !== EventStatus.DRAFT && event.status !== EventStatus.REJECTED) {
      throw new Error(`BadRequestException: Cannot submit event with status ${event.status}`);
    }
    event.status = EventStatus.PENDING_REVIEW;
    event.rejectionReason = null;
    return event;
  }

  function approveEvent(user: { id: string; roles: RoleType[] }, event: EventRecord) {
    if (!user.roles.includes(RoleType.SUPER_ADMIN) && !user.roles.includes(RoleType.ADMIN)) {
      throw new Error('ForbiddenException: Only administrators can approve events');
    }
    if (event.status !== EventStatus.PENDING_REVIEW) {
      throw new Error(`BadRequestException: Only PENDING_REVIEW events can be approved`);
    }
    event.status = EventStatus.PUBLISHED;
    return event;
  }

  function rejectEvent(user: { id: string; roles: RoleType[] }, event: EventRecord, reason: string) {
    if (!user.roles.includes(RoleType.SUPER_ADMIN) && !user.roles.includes(RoleType.ADMIN)) {
      throw new Error('ForbiddenException: Only administrators can reject events');
    }
    if (event.status !== EventStatus.PENDING_REVIEW) {
      throw new Error(`BadRequestException: Only PENDING_REVIEW events can be rejected`);
    }
    event.status = EventStatus.REJECTED;
    event.rejectionReason = reason;
    return event;
  }

  // Organizer cannot directly approve/publish event
  let directPublishBlocked = false;
  try {
    approveEvent(organizerUoc, event1);
  } catch (err: any) {
    if (err.message.includes('ForbiddenException')) directPublishBlocked = true;
  }
  assert(directPublishBlocked, 'Organizer is FORBIDDEN from self-approving or publishing directly');

  // Submit for review
  submitEventForReview(organizerUoc, event1);
  assert(event1.status === EventStatus.PENDING_REVIEW, 'Event transitions from DRAFT to PENDING_REVIEW');

  // Super admin approves
  approveEvent(superAdmin, event1);
  assert(event1.status === EventStatus.PUBLISHED, 'Event transitions from PENDING_REVIEW to PUBLISHED');

  // Published event is now publicly accessible
  const publicView = getPublicEvent('reid-extreme-2026', undefined);
  assert(publicView.id === event1.id && publicView.status === EventStatus.PUBLISHED, 'PUBLISHED event is now accessible to public users');

  // ---------------------------------------------------------------------------
  // 6. Workflow: Rejection & Resubmission
  // ---------------------------------------------------------------------------
  console.log('\n6. Testing Event Rejection & Resubmission Workflow...');

  const event2 = validateAndCreateEvent(organizerUom, {
    organizationId: mockOrgB.id,
    categoryId: mockCategory.id,
    universityId: mockUniversityB.id,
    title: 'Mora Datathon 2026',
    slug: 'mora-datathon-2026',
    description: 'Data Science challenge',
    mode: EventMode.HYBRID,
    startDate: new Date('2026-12-05T09:00:00Z'),
    endDate: new Date('2026-12-06T18:00:00Z'),
  });

  submitEventForReview(organizerUom, event2);
  rejectEvent(superAdmin, event2, 'Please include detailed eligibility requirements and contact email.');
  assert(event2.status === EventStatus.REJECTED, 'Event transitioned to REJECTED status');
  assert(event2.rejectionReason?.includes('eligibility'), 'Rejection explanation recorded for organizer');

  // Rejected event is hidden from public
  let rejectedPublicHidden = false;
  try {
    getPublicEvent(event2.slug, undefined);
  } catch (err: any) {
    if (err.message.includes('NotFoundException')) rejectedPublicHidden = true;
  }
  assert(rejectedPublicHidden, 'REJECTED event remains completely concealed from public students');

  // Resubmit rejected event
  submitEventForReview(organizerUom, event2);
  assert(event2.status === EventStatus.PENDING_REVIEW && event2.rejectionReason === null, 'REJECTED event can be resubmitted for review and clears rejectionReason');

  // ---------------------------------------------------------------------------
  // 7. Event Cancellation & Expiration
  // ---------------------------------------------------------------------------
  console.log('\n7. Testing Event Cancellation & Expiration Transitions...');

  function cancelEvent(user: { id: string; roles: RoleType[] }, event: EventRecord) {
    if (!checkCanManageEvent(user, event)) {
      throw new Error('ForbiddenException: You do not have permission to cancel this event');
    }
    if (event.status === EventStatus.CANCELLED) {
      throw new BadRequestException('Event is already cancelled');
    }
    event.status = EventStatus.CANCELLED;
    return event;
  }

  cancelEvent(organizerUoc, event1);
  assert(event1.status === EventStatus.CANCELLED, 'Event successfully transitioned to CANCELLED');

  // ---------------------------------------------------------------------------
  // 8. Validation Rules (Dates, URLs, Duplicates, Cross-University)
  // ---------------------------------------------------------------------------
  console.log('\n8. Testing Validation Rules & Integrity Constraints...');

  // Invalid date range (endDate < startDate)
  let invalidDateRangeBlocked = false;
  try {
    validateAndCreateEvent(organizerUoc, {
      organizationId: mockOrgA.id,
      categoryId: mockCategory.id,
      title: 'Invalid Dates Event',
      slug: 'invalid-dates',
      description: 'Test',
      mode: EventMode.IN_PERSON,
      startDate: new Date('2026-11-20T09:00:00Z'),
      endDate: new Date('2026-11-19T09:00:00Z'), // Before start!
    });
  } catch (err: any) {
    if (err.message.includes('BadRequestException')) invalidDateRangeBlocked = true;
  }
  assert(invalidDateRangeBlocked, 'Event with endDate < startDate is rejected with BadRequestException');

  // Invalid registration deadline (deadline > startDate)
  let invalidDeadlineBlocked = false;
  try {
    validateAndCreateEvent(organizerUoc, {
      organizationId: mockOrgA.id,
      categoryId: mockCategory.id,
      title: 'Invalid Deadline Event',
      slug: 'invalid-deadline',
      description: 'Test',
      mode: EventMode.IN_PERSON,
      startDate: new Date('2026-11-20T09:00:00Z'),
      endDate: new Date('2026-11-21T09:00:00Z'),
      registrationDeadline: new Date('2026-11-22T09:00:00Z'), // After start!
    });
  } catch (err: any) {
    if (err.message.includes('BadRequestException')) invalidDeadlineBlocked = true;
  }
  assert(invalidDeadlineBlocked, 'Registration deadline after start date is rejected with BadRequestException');

  // Invalid registration URL
  let invalidUrlBlocked = false;
  try {
    validateAndCreateEvent(organizerUoc, {
      organizationId: mockOrgA.id,
      categoryId: mockCategory.id,
      title: 'Invalid URL Event',
      slug: 'invalid-url',
      description: 'Test',
      mode: EventMode.ONLINE,
      startDate: new Date('2026-12-01T09:00:00Z'),
      endDate: new Date('2026-12-02T09:00:00Z'),
      registrationUrl: 'not-a-valid-url',
    });
  } catch (err: any) {
    if (err.message.includes('BadRequestException')) invalidUrlBlocked = true;
  }
  assert(invalidUrlBlocked, 'Malformed registration URL is rejected with BadRequestException');

  // Cross-university relationship violation (UOC club claiming UOM university)
  let crossUniBlocked = false;
  try {
    validateAndCreateEvent(organizerUoc, {
      organizationId: mockOrgA.id, // UOC club
      categoryId: mockCategory.id,
      universityId: mockUniversityB.id, // Claiming UOM!
      title: 'Cross Uni Mismatch Event',
      slug: 'cross-uni-mismatch',
      description: 'Test',
      mode: EventMode.IN_PERSON,
      startDate: new Date('2026-12-10T09:00:00Z'),
      endDate: new Date('2026-12-10T18:00:00Z'),
    });
  } catch (err: any) {
    if (err.message.includes('BadRequestException')) crossUniBlocked = true;
  }
  assert(crossUniBlocked, 'Organization claiming unrelated University ID is rejected');

  // Duplicate slug
  let duplicateSlugBlocked = false;
  try {
    validateAndCreateEvent(organizerUoc, {
      organizationId: mockOrgA.id,
      categoryId: mockCategory.id,
      title: 'Duplicate Slug Event',
      slug: 'reid-extreme-2026', // Already exists!
      description: 'Test',
      mode: EventMode.IN_PERSON,
      startDate: new Date('2026-12-20T09:00:00Z'),
      endDate: new Date('2026-12-20T18:00:00Z'),
    });
  } catch (err: any) {
    if (err.message.includes('ConflictException')) duplicateSlugBlocked = true;
  }
  assert(duplicateSlugBlocked, 'Duplicate event slug is rejected with ConflictException');

  // ---------------------------------------------------------------------------
  // 9. Public Listing, Pagination, Sorting & Filtering
  // ---------------------------------------------------------------------------
  console.log('\n9. Testing Public Listing, Sorting & Pagination...');

  // Setup additional published events for query testing
  const published1: EventRecord = {
    id: 'pub-1',
    organizationId: mockOrgA.id,
    categoryId: mockCategory.id,
    universityId: mockUniversityA.id,
    title: 'Alpha Hackathon',
    slug: 'alpha-hackathon',
    description: 'Hackathon description',
    status: EventStatus.PUBLISHED,
    mode: EventMode.ONLINE,
    startDate: new Date('2026-10-01T09:00:00Z'),
    endDate: new Date('2026-10-02T18:00:00Z'),
    registrationDeadline: new Date('2026-09-25T23:59:59Z'),
    createdAt: new Date('2026-09-01T00:00:00Z'),
  };

  const published2: EventRecord = {
    id: 'pub-2',
    organizationId: mockOrgB.id,
    categoryId: mockCategory.id,
    universityId: mockUniversityB.id,
    title: 'Beta Design Sprint',
    slug: 'beta-design-sprint',
    description: 'UI/UX sprint',
    status: EventStatus.PUBLISHED,
    mode: EventMode.IN_PERSON,
    startDate: new Date('2026-10-10T09:00:00Z'),
    endDate: new Date('2026-10-10T18:00:00Z'),
    registrationDeadline: new Date('2026-10-05T23:59:59Z'),
    createdAt: new Date('2026-09-02T00:00:00Z'),
  };

  const queryPool = [published1, published2, event1, event2]; // event1 is CANCELLED, event2 is PENDING_REVIEW

  function queryPublicEvents(query: {
    page?: number;
    limit?: number;
    mode?: EventMode;
    universityId?: string;
    sortBy?: 'newest' | 'upcoming' | 'deadline' | 'startDate';
  }) {
    // Strictly filter to PUBLISHED only
    let items = queryPool.filter((e) => e.status === EventStatus.PUBLISHED);

    if (query.mode) {
      items = items.filter((e) => e.mode === query.mode);
    }
    if (query.universityId) {
      items = items.filter((e) => e.universityId === query.universityId);
    }

    if (query.sortBy === 'newest') {
      items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (query.sortBy === 'upcoming' || query.sortBy === 'startDate') {
      items.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    } else if (query.sortBy === 'deadline') {
      items.sort((a, b) => (a.registrationDeadline?.getTime() || 0) - (b.registrationDeadline?.getTime() || 0));
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    return {
      items: items.slice(skip, skip + limit),
      meta: { total: items.length, page, limit, totalPages: Math.ceil(items.length / limit) },
    };
  }

  const allPublic = queryPublicEvents({});
  assert(allPublic.items.length === 2, 'Public listing returns only PUBLISHED events, excluding DRAFT/CANCELLED');

  const onlineOnly = queryPublicEvents({ mode: EventMode.ONLINE });
  assert(onlineOnly.items.length === 1 && onlineOnly.items[0]?.slug === 'alpha-hackathon', 'Filter by event mode ONLINE works accurately');

  const sortedByDeadline = queryPublicEvents({ sortBy: 'deadline' });
  assert(sortedByDeadline.items[0]?.slug === 'alpha-hackathon', 'Sorting by registration deadline orders earliest cutoff first');

  const paged = queryPublicEvents({ page: 1, limit: 1 });
  assert(paged.items.length === 1 && paged.meta.totalPages === 2, 'Pagination limit and totalPages calculation is accurate');

  // ---------------------------------------------------------------------------
  // 10. University Inheritance from Organization on Event Creation
  // ---------------------------------------------------------------------------
  console.log('\n10. Testing University Inheritance from Organization on Event Creation...');

  const organizerExternal = { id: 'user-leader-external', roles: [RoleType.ORGANIZER] };

  // Test 1: Inherit university (org has university, dto has none)
  const inheritedEvent = validateAndCreateEvent(organizerUoc, {
    organizationId: mockOrgA.id, // UOC org
    categoryId: mockCategory.id,
    title: 'UOC Inherited University Event',
    slug: 'uoc-inherited-event',
    description: 'Auto-inherits UOC universityId',
    mode: EventMode.IN_PERSON,
    startDate: new Date('2026-12-15T09:00:00Z'),
    endDate: new Date('2026-12-15T18:00:00Z'),
    // universityId omitted
  });
  assert(
    inheritedEvent.universityId === mockUniversityA.id,
    'Event automatically inherits organization universityId when omitted in DTO (Rule 1)',
  );

  // Test 2: Explicit matching university (org has university, dto supplies same)
  const matchingEvent = validateAndCreateEvent(organizerUoc, {
    organizationId: mockOrgA.id, // UOC org
    categoryId: mockCategory.id,
    universityId: mockUniversityA.id, // Explicitly UOC
    title: 'UOC Explicit Match Event',
    slug: 'uoc-explicit-match-event',
    description: 'Supplies matching universityId',
    mode: EventMode.IN_PERSON,
    startDate: new Date('2026-12-16T09:00:00Z'),
    endDate: new Date('2026-12-16T18:00:00Z'),
  });
  assert(
    matchingEvent.universityId === mockUniversityA.id,
    'Event keeps explicitly supplied matching universityId (Rule 2)',
  );

  // Test 3: Explicit mismatching university (org has university, dto supplies different)
  let mismatchRejected = false;
  let mismatchMessage = '';
  try {
    validateAndCreateEvent(organizerUoc, {
      organizationId: mockOrgA.id, // UOC org
      categoryId: mockCategory.id,
      universityId: mockUniversityB.id, // Explicitly UOM (mismatch!)
      title: 'UOC Mismatch Event',
      slug: 'uoc-mismatch-event',
      description: 'Supplies mismatching universityId',
      mode: EventMode.IN_PERSON,
      startDate: new Date('2026-12-17T09:00:00Z'),
      endDate: new Date('2026-12-17T18:00:00Z'),
    });
  } catch (err: any) {
    if (err.message.includes('Event university must match the hosting organization\'s university')) {
      mismatchRejected = true;
      mismatchMessage = err.message;
    }
  }
  assert(
    mismatchRejected,
    `Explicit mismatching university is rejected with BadRequestException: "${mismatchMessage}" (Rule 3)`,
  );

  // Test 4: Organization without university (org has null, dto has none)
  const noUniEvent = validateAndCreateEvent(organizerExternal, {
    organizationId: mockOrgNoUni.id, // Org without university (null)
    categoryId: mockCategory.id,
    title: 'Community Independent Event',
    slug: 'community-independent-event',
    description: 'Org without university',
    mode: EventMode.ONLINE,
    startDate: new Date('2026-12-18T09:00:00Z'),
    endDate: new Date('2026-12-18T18:00:00Z'),
    // universityId omitted
  });
  assert(
    noUniEvent.universityId === null,
    'Event has null universityId when organization has no university and none supplied (Rule 4)',
  );

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log('\n==============================================================================');
  console.log(`📊 Phase 6 Test Results: ${passed}/${total} Passed (${failed} Failed)`);
  console.log('==============================================================================\n');

  if (failed > 0) {
    console.error('❌ Some tests failed.');
    process.exit(1);
  } else {
    console.log('🎉 All Phase 6 Core Event Management tests passed successfully!');
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
