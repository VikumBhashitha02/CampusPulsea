'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, LogOut } from 'lucide-react';
import { Drawer } from '../ui/drawer';
import { buttonClassName } from '../ui/button';
import { cn } from '../../lib/cn';
import {
  ADMIN_NAV,
  ORGANIZER_NAV,
  PUBLIC_NAV,
  STUDENT_NAV,
  isAdminUser,
  isNavItemActive,
  isOrganizerUser,
  type AppArea,
} from '../../lib/navigation';
import type { AuthUser } from '../../services/auth.service';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  area: AppArea;
  user: AuthUser | null;
  isAuthenticated: boolean;
  unreadCount: number;
  onLogout: () => void;
}

export function MobileNav({
  open,
  onClose,
  area,
  user,
  isAuthenticated,
  unreadCount,
  onLogout,
}: MobileNavProps) {
  const pathname = usePathname();
  const canOrganize = isOrganizerUser(user);
  const canAdmin = isAdminUser(user);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="CampusPulse menu"
      className="lg:hidden"
      footer={
        isAuthenticated ? (
          <div className="space-y-1">
            <Link
              href="/account/notifications"
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-cp-navy hover:bg-cp-bg"
            >
              <Bell className="w-4 h-4 text-cp-muted" />
              <span className="flex-1">Notifications</span>
              {unreadCount > 0 && (
                <span className="min-w-[1.25rem] h-5 px-1 rounded-full bg-cp-yellow text-cp-navy text-xs font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/account/profile"
              onClick={onClose}
              className="block px-3 py-2.5 rounded-xl text-sm font-medium text-cp-navy hover:bg-cp-bg"
            >
              Profile
            </Link>
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-700 hover:bg-rose-50 text-left"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Link href="/login" onClick={onClose} className={buttonClassName({ variant: 'secondary' })}>
              Login
            </Link>
            <Link href="/register" onClick={onClose} className={buttonClassName({ variant: 'primary' })}>
              Get Started
            </Link>
          </div>
        )
      }
    >
      <div className="space-y-6">
          {area === 'public' && (
            <NavGroup title="Browse" items={PUBLIC_NAV} pathname={pathname} onNavigate={onClose} extra={
              !canOrganize ? (
                <DrawerLink href="/register?role=ORGANIZER" onClick={onClose} pathname={pathname}>
                  For Organizers
                </DrawerLink>
              ) : null
            } />
          )}

          {area === 'student' && (
            <NavGroup title="Student" items={STUDENT_NAV} pathname={pathname} onNavigate={onClose} />
          )}

          {area === 'organizer' && (
            <>
              <NavGroup title="Organizer" items={ORGANIZER_NAV} pathname={pathname} onNavigate={onClose} />
              <NavGroup title="Browse" items={[{ href: '/explore', label: 'Explore' }]} pathname={pathname} onNavigate={onClose} />
            </>
          )}

          {area === 'admin' && (
            <>
              <NavGroup title="Admin" items={ADMIN_NAV} pathname={pathname} onNavigate={onClose} />
              <NavGroup title="Browse" items={[{ href: '/explore', label: 'Explore' }]} pathname={pathname} onNavigate={onClose} />
            </>
          )}

          {isAuthenticated && user && (canOrganize || canAdmin) && area !== 'organizer' && area !== 'admin' && (
            <div className="space-y-1">
              <p className="px-3 text-meta font-semibold uppercase tracking-wide text-cp-muted">Portals</p>
              {canOrganize && (
                <DrawerLink href="/organizer" onClick={onClose} pathname={pathname}>
                  Organizer
                </DrawerLink>
              )}
              {canAdmin && (
                <DrawerLink href="/admin" onClick={onClose} pathname={pathname}>
                  Admin
                </DrawerLink>
              )}
            </div>
          )}
      </div>
    </Drawer>
  );
}

function NavGroup({
  title,
  items,
  pathname,
  onNavigate,
  extra,
}: {
  title: string;
  items: { href: string; label: string }[];
  pathname: string;
  onNavigate: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="px-3 text-meta font-semibold uppercase tracking-wide text-cp-muted">{title}</p>
      {items.map((item) => (
        <DrawerLink key={item.href} href={item.href} pathname={pathname} onClick={onNavigate}>
          {item.label}
        </DrawerLink>
      ))}
      {extra}
    </div>
  );
}

function DrawerLink({
  href,
  pathname,
  onClick,
  children,
}: {
  href: string;
  pathname: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const active = isNavItemActive(pathname, href);
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'block px-3 py-2.5 rounded-xl text-sm font-medium',
        active ? 'bg-cp-yellow-light text-cp-navy' : 'text-cp-navy hover:bg-cp-bg',
      )}
    >
      {children}
    </Link>
  );
}
