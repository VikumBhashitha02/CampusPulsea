'use client';

import React, { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Bell, Menu, Search } from 'lucide-react';
import { useAuth } from '../../lib/auth/auth-context';
import { notificationsService } from '../../services/notifications.service';
import { buttonClassName } from '../ui/button';
import { cn } from '../../lib/cn';
import {
  ADMIN_NAV,
  ORGANIZER_NAV,
  PUBLIC_NAV,
  STUDENT_NAV,
  isNavItemActive,
  isOrganizerUser,
  resolveAppArea,
} from '../../lib/navigation';
import { UserMenu } from './user-menu';
import { MobileNav } from './mobile-nav';

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuButtonId = useId();
  const area = resolveAppArea(pathname, user);
  const showOrganizerCta = !isOrganizerUser(user);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    let mounted = true;
    if (isAuthenticated) {
      notificationsService
        .getUnreadCount()
        .then((count) => {
          if (mounted) setUnreadCount(count);
        })
        .catch(() => {});
    } else {
      setUnreadCount(0);
    }
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, pathname]);

  const headerLinks =
    area === 'student'
      ? STUDENT_NAV
      : area === 'organizer'
        ? ORGANIZER_NAV
        : area === 'admin'
          ? ADMIN_NAV
          : PUBLIC_NAV;

  const isAuthPage = area === 'auth';

  if (isAuthPage) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50">
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="section-container flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <Link href="/" className="shrink-0 transition-opacity hover:opacity-90">
              <Image
                src="/logo.svg"
                alt="CampusPulse"
                width={150}
                height={36}
                priority
                className="h-7 w-auto object-contain"
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-1" aria-label={`${area} primary navigation`}>
              {headerLinks.map((item) => {
                const active = isNavItemActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
                      active
                        ? 'text-[#0F172A] bg-slate-100 shadow-2xs'
                        : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-50',
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {area === 'public' && showOrganizerCta && (
                <Link
                  href="/register?role=ORGANIZER"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-slate-50 transition-colors"
                >
                  For Organizers
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick search shortcut for desktop */}
            {pathname !== '/explore' && (
              <Link
                href="/explore"
                className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#64748B] hover:text-[#0F172A] hover:border-[#CBD5E1] transition-colors"
                aria-label="Search opportunities"
              >
                <Search className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span>Search opportunities...</span>
              </Link>
            )}

            {isLoading ? (
              <div className="hidden md:block h-8 w-20 rounded-lg bg-slate-100 animate-pulse" />
            ) : isAuthenticated && user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/account/notifications"
                  className="relative p-2 rounded-lg border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
                  aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
                >
                  <Bell className="w-4 h-4 text-[#475569]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[1rem] h-4 px-1 rounded-full bg-[#FEB703] text-[#0F172A] text-[9px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <UserMenu user={user} area={area} onLogout={logout} />
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" className={buttonClassName({ variant: 'ghost', size: 'sm' })}>
                  Login
                </Link>
                <Link href="/register" className={buttonClassName({ variant: 'primary', size: 'sm' })}>
                  Get Started
                </Link>
              </div>
            )}

            <button
              id={menuButtonId}
              type="button"
              className="lg:hidden p-2 rounded-lg text-[#0F172A] hover:bg-slate-100 transition-colors"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div id="mobile-navigation">
        <MobileNav
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          area={area}
          user={user}
          isAuthenticated={isAuthenticated}
          unreadCount={unreadCount}
          onLogout={logout}
        />
      </div>
    </div>
  );
}
