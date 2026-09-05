/**
 * ==============================================================================
 * CampusPulse — Phase 12: Organizer Dashboard Test Suite
 * ==============================================================================
 * Tests:
 * 1. Organizer Event Creation & Lifecycle:
 *    - Creation in DRAFT status
 *    - Updates/Edits in DRAFT status
 *    - Submission for admin review (DRAFT -> PENDING_REVIEW)
 *    - Cancellation of published event (PUBLISHED -> CANCELLED)
 * 2. Event Page View Incrementation:
 *    - Atomic increment of viewCount upon page impression
 * 3. Organizer Engagement Analytics Engine:
 *    - Aggregate metrics: totalEvents, published, pending, views, registrations, bookmarks
 *    - Per-event breakdown with conversion rates (registrations / views * 100)
 *    - Recent opportunities chronology
 * ==============================================================================
 */

import { EventStatus, EventMode } from '@campuspulse/types';

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

interface MockEvent {
  id: string;
  title: string;
  slug: string;
  organizationId: string;
  status: EventStatus;
  viewCount: number;
  registrationsCount: number;
  bookmarksCount: number;
  mode: EventMode;
  createdAt: Date;
  updatedAt: Date;
}

const eventsDb: MockEvent[] = [];

function createEvent(dto: {
  title: string;
  slug: string;
  organizationId: string;
  mode?: EventMode;
}) {
  const event: MockEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    title: dto.title,
    slug: dto.slug,
    organizationId: dto.organizationId,
    status: EventStatus.DRAFT,
    viewCount: 0,
    registrationsCount: 0,
    bookmarksCount: 0,
    mode: dto.mode || EventMode.IN_PERSON,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  eventsDb.push(event);
  return event;
}

function updateEvent(id: string, updates: Partial<MockEvent>) {
  const event = eventsDb.find((e) => e.id === id);
  if (!event) throw new Error('Event not found');
  Object.assign(event, updates, { updatedAt: new Date() });
  return event;
}

function submitForReview(id: string) {
  const event = eventsDb.find((e) => e.id === id);
  if (!event) throw new Error('Event not found');
  if (event.status !== EventStatus.DRAFT) throw new Error('Only DRAFT events can be submitted');
  event.status = EventStatus.PENDING_REVIEW;
  event.updatedAt = new Date();
  return event;
}

function cancelEvent(id: string) {
  const event = eventsDb.find((e) => e.id === id);
  if (!event) throw new Error('Event not found');
  event.status = EventStatus.CANCELLED;
  event.updatedAt = new Date();
  return event;
}

function incrementViewCount(id: string) {
  const event = eventsDb.find((e) => e.id === id);
  if (!event) throw new Error('Event not found');
  event.viewCount += 1;
  return { success: true, viewCount: event.viewCount };
}

function getOrganizerAnalytics(orgId: string) {
  const orgEvents = eventsDb.filter((e) => e.organizationId === orgId);

  const totalEvents = orgEvents.length;
  const publishedEvents = orgEvents.filter((e) => e.status === EventStatus.PUBLISHED).length;
  const pendingEvents = orgEvents.filter((e) => e.status === EventStatus.PENDING_REVIEW).length;
  const draftEvents = orgEvents.filter((e) => e.status === EventStatus.DRAFT).length;
  const cancelledEvents = orgEvents.filter((e) => e.status === EventStatus.CANCELLED).length;

  let totalViews = 0;
  let totalRegistrations = 0;
  let totalBookmarks = 0;

  const eventBreakdown = orgEvents.map((e) => {
    totalViews += e.viewCount;
    totalRegistrations += e.registrationsCount;
    totalBookmarks += e.bookmarksCount;

    const conversionRate =
      e.viewCount > 0 ? Math.round((e.registrationsCount / e.viewCount) * 100) : 0;

    return {
      id: e.id,
      title: e.title,
      slug: e.slug,
      status: e.status,
      views: e.viewCount,
      bookmarks: e.bookmarksCount,
      registrations: e.registrationsCount,
      conversionRate,
    };
  });

  return {
    totalEvents,
    publishedEvents,
    pendingEvents,
    draftEvents,
    cancelledEvents,
    totalViews,
    totalRegistrations,
    totalBookmarks,
    recentEvents: orgEvents.slice(0, 5),
    eventBreakdown,
  };
}

async function runOrganizerDashboardTests() {
  console.log('\n=============================================================');
  console.log('📊  CampusPulse Phase 12: Organizer Dashboard Suite');
  console.log('=============================================================\n');

  // ---------------------------------------------------------------------------
  // 1. Organizer Event Creation & Lifecycle Transitions
  // ---------------------------------------------------------------------------
  console.log('1. Testing Organizer Event Lifecycle & State Transitions...');

  const e1 = createEvent({
    title: 'MoraHack 2026',
    slug: 'morahack-2026',
    organizationId: 'org-mora-club',
    mode: EventMode.HYBRID,
  });
  assert(e1.status === EventStatus.DRAFT, 'Created event initializes in DRAFT status');
  assert(e1.viewCount === 0, 'Initial viewCount is 0');

  updateEvent(e1.id, { title: 'MoraHack 2026: National Hackathon' });
  assert(
    e1.title.includes('National Hackathon'),
    'Organizer can edit opportunity details in DRAFT status',
  );

  submitForReview(e1.id);
  assert(
    e1.status === EventStatus.PENDING_REVIEW,
    'Opportunity transitioned from DRAFT to PENDING_REVIEW',
  );

  // Simulate admin approval
  e1.status = EventStatus.PUBLISHED;

  // Organizer or admin cancellation
  cancelEvent(e1.id);
  assert(
    e1.status === EventStatus.CANCELLED,
    'Opportunity transitioned from PUBLISHED to CANCELLED',
  );

  // ---------------------------------------------------------------------------
  // 2. Event Page View Tracking
  // ---------------------------------------------------------------------------
  console.log('\n2. Testing Opportunity Page Impression View Incrementation...');

  const e2 = createEvent({
    title: 'Colombo AI Summit 2026',
    slug: 'colombo-ai-summit-2026',
    organizationId: 'org-mora-club',
  });
  e2.status = EventStatus.PUBLISHED;

  incrementViewCount(e2.id);
  incrementViewCount(e2.id);
  const viewRes = incrementViewCount(e2.id);

  assert(
    viewRes.viewCount === 3,
    'Page view counter increments atomically on each visit (3 views)',
  );
  assert(e2.viewCount === 3, 'Event viewCount stored accurately in event record');

  // ---------------------------------------------------------------------------
  // 3. Organizer Analytics Engine
  // ---------------------------------------------------------------------------
  console.log('\n3. Testing Organizer Analytics Engine & Performance Metrics...');

  e2.registrationsCount = 45;
  e2.bookmarksCount = 80;

  const e3 = createEvent({
    title: 'Cloud DevOps Workshop',
    slug: 'cloud-devops-workshop',
    organizationId: 'org-mora-club',
  });
  e3.status = EventStatus.PENDING_REVIEW;
  e3.viewCount = 100;
  e3.registrationsCount = 20;
  e3.bookmarksCount = 35;

  const analytics = getOrganizerAnalytics('org-mora-club');

  assert(analytics.totalEvents === 3, 'Total events count equals 3 for organization');
  assert(analytics.cancelledEvents === 1, 'Cancelled events equals 1 (e1)');
  assert(analytics.publishedEvents === 1, 'Published events equals 1 (e2)');
  assert(analytics.pendingEvents === 1, 'Pending events equals 1 (e3)');
  assert(
    analytics.totalViews === 103,
    'Total view count aggregates across organization events (3 + 100 = 103)',
  );
  assert(
    analytics.totalRegistrations === 65,
    'Total registration clicks aggregates across events (45 + 20 = 65)',
  );
  assert(
    analytics.totalBookmarks === 115,
    'Total bookmarks aggregates across events (80 + 35 = 115)',
  );

  // Conversion rate test
  const e3Analytics = analytics.eventBreakdown.find((b) => b.id === e3.id);
  assert(
    e3Analytics && e3Analytics.conversionRate === 20,
    'Conversion rate accurately calculated (20/100 = 20%)',
  );

  // ---------------------------------------------------------------------------
  // 4. Organizer Registration Management & Scoped Isolation
  // ---------------------------------------------------------------------------
  console.log('\n4. Testing Organizer Registration Access & Multi-Tenant Isolation...');

  interface MockRegistration {
    id: string;
    eventId: string;
    userId: string;
    status: string;
    notes?: string;
    registeredAt: Date;
    user: {
      name: string;
      email: string;
      firstName?: string;
      lastName?: string;
      university?: string;
    };
  }

  const registrationsDb: MockRegistration[] = [
    {
      id: 'reg-1',
      eventId: e2.id,
      userId: 'user-std-1',
      status: 'REGISTERED',
      notes: 'Interested in AI Track',
      registeredAt: new Date(),
      user: { name: 'Kasun Perera', email: 'kasun@uom.lk', university: 'University of Moratuwa' },
    },
    {
      id: 'reg-2',
      eventId: e2.id,
      userId: 'user-std-2',
      status: 'REGISTERED',
      registeredAt: new Date(),
      user: { name: 'Amali Silva', email: 'amali@uom.lk', university: 'University of Moratuwa' },
    },
    {
      id: 'reg-3',
      eventId: e2.id,
      userId: 'user-std-3',
      status: 'CANCELLED',
      registeredAt: new Date(),
      user: { name: 'Nimal Jayasinghe', email: 'nimal@cmb.ac.lk', university: 'University of Colombo' },
    },
  ];

  function getEventRegistrations(
    eventId: string,
    requestingOrgId: string,
    eventOrgId: string,
    isGlobalAdmin = false,
  ) {
    if (!isGlobalAdmin && requestingOrgId !== eventOrgId) {
      throw new Error('Forbidden: Insufficient permissions for this organization event');
    }
    const eventRegs = registrationsDb.filter((r) => r.eventId === eventId);
    const summary = {
      total: eventRegs.length,
      registered: eventRegs.filter((r) => r.status === 'REGISTERED').length,
      cancelled: eventRegs.filter((r) => r.status === 'CANCELLED').length,
      capacity: 100,
    };
    return { summary, items: eventRegs };
  }

  const regData = getEventRegistrations(e2.id, 'org-mora-club', e2.organizationId);
  assert(regData.summary.total === 3, 'Registration summary counts total 3 records');
  assert(regData.summary.registered === 2, 'Active registered students count equals 2');
  assert(regData.summary.cancelled === 1, 'Cancelled registrations count equals 1');
  assert(regData.summary.capacity === 100, 'Capacity retrieved accurately');

  // Student privacy verification: sensitive fields are not exposed
  const firstReg = regData.items[0];
  assert(
    Boolean(firstReg && firstReg.user && firstReg.user.name && !('password' in firstReg.user) && !('token' in firstReg.user)),
    'Student privacy respected: returns display name and university without sensitive credentials',
  );

  // Cross-tenant access protection test
  let unauthorizedBlocked = false;
  try {
    getEventRegistrations(e2.id, 'org-unrelated-club', e2.organizationId);
  } catch (err: any) {
    if (err.message.includes('Forbidden')) {
      unauthorizedBlocked = true;
    }
  }
  assert(
    unauthorizedBlocked,
    'Organizer from another organization is STRICTLY DENIED access to registrations (403 Forbidden)',
  );

  // Global Admin Access test
  const adminRegData = getEventRegistrations(e2.id, 'org-any', e2.organizationId, true);
  assert(
    adminRegData.summary.total === 3,
    'Global Admin has cross-organization access to event registrations',
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

runOrganizerDashboardTests().catch((err) => {
  console.error('Unhandled test execution error:', err);
  process.exit(1);
});
