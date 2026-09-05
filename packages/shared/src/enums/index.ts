/**
 * Shared enums for CampusPulse.
 *
 * These mirror Prisma enums and are usable on both client and server
 * without importing the Prisma client directly.
 */

/** User roles for role-based access control */
export enum UserRole {
  STUDENT = 'STUDENT',
  ORGANIZER = 'ORGANIZER',
  ADMIN = 'ADMIN',
}
