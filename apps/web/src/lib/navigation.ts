import { RoleType } from '@campuspulse/types';
import type { AuthUser } from '../services/auth.service';

export type AppArea = 'public' | 'student' | 'organizer' | 'admin' | 'auth';

export interface NavItem {
  href: string;
  label: string;
}

export const PUBLIC_NAV: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore' },
  { href: '/universities', label: 'Universities' },
];

export const STUDENT_NAV: NavItem[] = [
  { href: '/account', label: 'Overview' },
  { href: '/explore', label: 'Explore' },
  { href: '/account/saved', label: 'Saved' },
  { href: '/account/registrations', label: 'Registrations' },
  { href: '/account/calendar', label: 'Calendar' },
  { href: '/account/teams', label: 'Team Finder' },
];

export const ORGANIZER_NAV: NavItem[] = [
  { href: '/organizer', label: 'Overview' },
  { href: '/organizer/events', label: 'Opportunities' },
  { href: '/organizer/registrations', label: 'Registrations' },
  { href: '/organizer/analytics', label: 'Analytics' },
];

export const ADMIN_NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/events', label: 'Event Moderation' },
  { href: '/admin/organizations', label: 'Organizations' },
  { href: '/admin/universities', label: 'Universities' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/reports', label: 'Reports' },
];

export function isAdminUser(user: AuthUser | null | undefined): boolean {
  return !!user?.roles?.some((role) => role === RoleType.ADMIN || role === RoleType.SUPER_ADMIN);
}

export function isOrganizerUser(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  const privileged = user.roles?.some((role) =>
    [RoleType.ORGANIZER, RoleType.ADMIN, RoleType.SUPER_ADMIN, RoleType.UNIVERSITY_ADMIN].includes(
      role as RoleType,
    ),
  );
  return Boolean(privileged || (user.organizations && user.organizations.length > 0));
}

export function getRawAppArea(pathname: string): AppArea {
  if (pathname === '/login' || pathname === '/register') return 'auth';
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/organizer')) return 'organizer';
  if (pathname.startsWith('/account')) return 'student';
  return 'public';
}

export function resolveAppArea(pathname: string, user: AuthUser | null | undefined): AppArea {
  const area = getRawAppArea(pathname);
  if (area === 'admin' && !isAdminUser(user)) return 'public';
  if (area === 'organizer' && !isOrganizerUser(user)) return 'public';
  return area;
}

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  if (href === '/account') return pathname === '/account';
  if (href === '/organizer') return pathname === '/organizer';
  if (href === '/admin') return pathname === '/admin';
  if (href === '/organizer/events') {
    return (
      pathname.startsWith('/organizer/events') && !pathname.includes('/registrations')
    );
  }
  if (href === '/organizer/registrations') {
    return (
      pathname.startsWith('/organizer/registrations') ||
      /\/organizer\/events\/[^/]+\/registrations/.test(pathname)
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
