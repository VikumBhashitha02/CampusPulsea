/**
 * ==============================================================================
 * CampusPulse — Phase 10: Calendar and Notifications Test Suite
 * ==============================================================================
 * Tests:
 * 1. Notification Creation across all 7 controlled types:
 *    - EVENT_DEADLINE
 *    - EVENT_UPDATED
 *    - EVENT_CANCELLED
 *    - NEW_RECOMMENDATION
 *    - TEAM_REQUEST
 *    - TEAM_REQUEST_ACCEPTED
 *    - TEAM_REQUEST_REJECTED
 * 2. Notification Unread/Read State Management:
 *    - Default isRead: false
 *    - Mark single notification as read
 *    - Mark all notifications as read
 *    - Accurate unread badge count tracking
 * 3. Extensible Push Notification Architecture:
 *    - Verifies decoupled PushNotificationDispatcher hook execution
 * 4. Academic Calendar Schedule Aggregation:
 *    - Event start/end dates (EVENT_DATE)
 *    - Impending registration cutoffs (REGISTRATION_DEADLINE)
 *    - Association with student's saved bookmarks (isBookmarked)
 *    - Association with student's confirmed RSVPs (isRegistered)
 * ==============================================================================
 */

import { NotificationType, EventMode, RegistrationStatus } from '@campuspulse/types';

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

// In-memory simulation models for testing notification & calendar services
interface MockNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  linkUrl?: string;
  createdAt: Date;
}

const notificationsDb: MockNotification[] = [];
const pushedPayloads: any[] = [];

// Pluggable push notification dispatcher stub
const mockPushDispatcher = {
  sendPush: async (payload: any) => {
    pushedPayloads.push(payload);
    return true;
  },
};

function createNotification(dto: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string;
}) {
  const notif: MockNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    userId: dto.userId,
    type: dto.type,
    title: dto.title,
    message: dto.message,
    linkUrl: dto.linkUrl,
    isRead: false,
    createdAt: new Date(),
  };
  notificationsDb.push(notif);

  // Invoke push dispatcher
  mockPushDispatcher.sendPush({
    userId: dto.userId,
    title: dto.title,
    body: dto.message,
    data: { notificationId: notif.id, type: dto.type },
  });

  return notif;
}

function getUnreadCount(userId: string) {
  return notificationsDb.filter((n) => n.userId === userId && !n.isRead).length;
}

function markAsRead(id: string, userId: string) {
  const notif = notificationsDb.find((n) => n.id === id && n.userId === userId);
  if (notif) notif.isRead = true;
  return { id, isRead: true };
}

function markAllAsRead(userId: string) {
  let count = 0;
  for (const notif of notificationsDb) {
    if (notif.userId === userId && !notif.isRead) {
      notif.isRead = true;
      count++;
    }
  }
  return { updatedCount: count };
}

// Calendar aggregation simulation
interface MockCalendarEvent {
  id: string;
  title: string;
  slug: string;
  startDate: Date;
  endDate: Date;
  registrationDeadline?: Date;
  mode: EventMode;
  location?: string;
  registrations: string[]; // userIds
  bookmarks: string[]; // userIds
}

const mockEvents: MockCalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'MoraHack 2026',
    slug: 'morahack-2026',
    startDate: new Date(2026, 8, 15, 9, 0), // Sep 15, 2026
    endDate: new Date(2026, 8, 16, 17, 0),
    registrationDeadline: new Date(2026, 8, 10, 23, 59), // Sep 10, 2026
    mode: EventMode.HYBRID,
    location: 'University of Moratuwa',
    registrations: ['student-1'],
    bookmarks: ['student-1', 'student-2'],
  },
  {
    id: 'evt-2',
    title: 'Colombo AI Symposium',
    slug: 'colombo-ai-symposium',
    startDate: new Date(2026, 8, 22, 10, 0), // Sep 22, 2026
    endDate: new Date(2026, 8, 22, 16, 0),
    registrationDeadline: new Date(2026, 8, 18, 23, 59),
    mode: EventMode.IN_PERSON,
    location: 'University of Colombo',
    registrations: [],
    bookmarks: ['student-1'],
  },
];

function getCalendar(userId: string, month: number, year: number) {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  const entries: any[] = [];

  for (const event of mockEvents) {
    const isRegistered = event.registrations.includes(userId);
    const isBookmarked = event.bookmarks.includes(userId);

    // Event Date Entry
    if (event.startDate >= startOfMonth && event.startDate <= endOfMonth) {
      entries.push({
        id: `evt-${event.id}`,
        eventId: event.id,
        title: event.title,
        date: event.startDate,
        entryType: 'EVENT_DATE',
        isRegistered,
        isBookmarked,
        mode: event.mode,
      });
    }

    // Deadline Entry
    if (
      event.registrationDeadline &&
      event.registrationDeadline >= startOfMonth &&
      event.registrationDeadline <= endOfMonth
    ) {
      entries.push({
        id: `dl-${event.id}`,
        eventId: event.id,
        title: `${event.title} (Deadline)`,
        date: event.registrationDeadline,
        entryType: 'REGISTRATION_DEADLINE',
        isRegistered,
        isBookmarked,
        mode: event.mode,
      });
    }
  }

  entries.sort((a, b) => a.date.getTime() - b.date.getTime());
  return { month, year, totalEntries: entries.length, entries };
}

async function runCalendarNotificationsTests() {
  console.log('\n=============================================================');
  console.log('🔔  CampusPulse Phase 10: Calendar & Notifications Suite');
  console.log('=============================================================\n');

  // ---------------------------------------------------------------------------
  // 1. Notification Creation across all 7 controlled types
  // ---------------------------------------------------------------------------
  console.log('1. Testing Notification Creation for All 7 Types...');

  const n1 = createNotification({
    userId: 'student-1',
    type: NotificationType.EVENT_DEADLINE,
    title: 'Registration Closing Soon',
    message: 'MoraHack 2026 applications close in 24 hours!',
    linkUrl: '/events/morahack-2026',
  });
  assert(n1.type === NotificationType.EVENT_DEADLINE, 'Created EVENT_DEADLINE notification');

  const n2 = createNotification({
    userId: 'student-1',
    type: NotificationType.EVENT_UPDATED,
    title: 'Venue Relocated',
    message: 'MoraHack moved to the Civil Auditorium.',
    linkUrl: '/events/morahack-2026',
  });
  assert(n2.type === NotificationType.EVENT_UPDATED, 'Created EVENT_UPDATED notification');

  const n3 = createNotification({
    userId: 'student-1',
    type: NotificationType.EVENT_CANCELLED,
    title: 'Event Cancelled',
    message: 'Workshop postponed indefinitely.',
  });
  assert(n3.type === NotificationType.EVENT_CANCELLED, 'Created EVENT_CANCELLED notification');

  const n4 = createNotification({
    userId: 'student-1',
    type: NotificationType.NEW_RECOMMENDATION,
    title: 'Recommended For You',
    message: 'A new AI hackathon matching your skills was published.',
  });
  assert(
    n4.type === NotificationType.NEW_RECOMMENDATION,
    'Created NEW_RECOMMENDATION notification',
  );

  const n5 = createNotification({
    userId: 'student-1',
    type: NotificationType.TEAM_REQUEST,
    title: 'Join Request Received',
    message: 'Nisal requested to join team CyberPulse.',
  });
  assert(n5.type === NotificationType.TEAM_REQUEST, 'Created TEAM_REQUEST notification');

  const n6 = createNotification({
    userId: 'student-1',
    type: NotificationType.TEAM_REQUEST_ACCEPTED,
    title: 'Request Approved',
    message: 'You have been accepted into Team CyberPulse!',
  });
  assert(
    n6.type === NotificationType.TEAM_REQUEST_ACCEPTED,
    'Created TEAM_REQUEST_ACCEPTED notification',
  );

  const n7 = createNotification({
    userId: 'student-1',
    type: NotificationType.TEAM_REQUEST_REJECTED,
    title: 'Request Declined',
    message: 'Team CyberPulse roster has reached full capacity.',
  });
  assert(
    n7.type === NotificationType.TEAM_REQUEST_REJECTED,
    'Created TEAM_REQUEST_REJECTED notification',
  );

  // ---------------------------------------------------------------------------
  // 2. Unread Count & Read State Management
  // ---------------------------------------------------------------------------
  console.log('\n2. Testing Read State & Unread Badge Counter...');

  const initialUnread = getUnreadCount('student-1');
  assert(initialUnread === 7, 'Initial unread count equals 7 created notifications');

  markAsRead(n1.id, 'student-1');
  const unreadAfterSingleRead = getUnreadCount('student-1');
  assert(
    unreadAfterSingleRead === 6,
    'Marking single notification as read decrements unread counter by 1',
  );

  const markAllRes = markAllAsRead('student-1');
  assert(
    markAllRes.updatedCount === 6,
    'markAllAsRead marked all remaining 6 notifications as read',
  );

  const finalUnread = getUnreadCount('student-1');
  assert(finalUnread === 0, 'Unread badge counter is 0 when all notifications are read');

  // ---------------------------------------------------------------------------
  // 3. Extensible Push Notification Dispatcher Stub
  // ---------------------------------------------------------------------------
  console.log('\n3. Testing Push Notification Architecture Hook...');

  assert(
    pushedPayloads.length === 7,
    'Push notification dispatcher stub received all 7 notification payloads',
  );
  assert(
    pushedPayloads[0].userId === 'student-1' &&
      pushedPayloads[0].title === 'Registration Closing Soon',
    'Push payload contains recipient userId and notification title for mobile push delivery',
  );

  // ---------------------------------------------------------------------------
  // 4. Academic Calendar Schedule Aggregation
  // ---------------------------------------------------------------------------
  console.log('\n4. Testing Student Academic Calendar Aggregation...');

  const cal = getCalendar('student-1', 9, 2026); // Sep 2026
  assert(
    cal.totalEntries === 4,
    'Calendar aggregated 4 timeline entries (2 event dates + 2 deadlines)',
  );

  const moraEvent = cal.entries.find(
    (e: any) => e.eventId === 'evt-1' && e.entryType === 'EVENT_DATE',
  );
  assert(
    moraEvent && moraEvent.isRegistered === true && moraEvent.isBookmarked === true,
    'Calendar entry correctly flags student as both registered and bookmarked',
  );

  const moraDeadline = cal.entries.find(
    (e: any) => e.eventId === 'evt-1' && e.entryType === 'REGISTRATION_DEADLINE',
  );
  assert(
    moraDeadline && moraDeadline.entryType === 'REGISTRATION_DEADLINE',
    'Calendar contains distinct registration deadline entry',
  );

  const colomboEvent = cal.entries.find(
    (e: any) => e.eventId === 'evt-2' && e.entryType === 'EVENT_DATE',
  );
  assert(
    colomboEvent && colomboEvent.isRegistered === false && colomboEvent.isBookmarked === true,
    'Colombo event correctly marked as bookmarked only (not registered)',
  );

  assert(
    cal.entries[0].date.getTime() <= cal.entries[1].date.getTime() &&
      cal.entries[1].date.getTime() <= cal.entries[2].date.getTime(),
    'Calendar entries are ordered chronologically',
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

runCalendarNotificationsTests().catch((err) => {
  console.error('Unhandled test execution error:', err);
  process.exit(1);
});
